import axios from "axios";
import Profile from "../models/Profile.js";
import dotenv from "dotenv";

dotenv.config();

const AI_URL = process.env.GROQ_API_URL;
const API_KEY = process.env.GROQ_API_KEY;

// Function to retrieve Raka Nugraha's profile data from the database
const getProfileData = async () => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return "Raka Nugraha's profile data is not available.";

    return formatMarkdownData(profile);
  } catch (error) {
    console.error("Error retrieving profile data:", error);
    return "An error occurred while fetching profile data.";
  }
};

function formatMarkdownData(data) {
  let markdown = `# ${data.name}\n\n`;
  markdown += `## About Me\n${data.about}\n\n`;

  // **SKILLS**
  markdown += `## Skills:\n`;
  data.skills.forEach((category, index) => {
    markdown += `${index + 1}. **${category.category}**:\n`;
    category.skills.forEach((skill) => {
      markdown += `   - ${skill}\n`;
    });
  });

  // **EXPERIENCE**
  markdown += `\n## Work Experience:\n`;
  data.experience.forEach((exp, index) => {
    markdown += `${index + 1}. **${exp.role}** at *${exp.company}*\n`;
    markdown += `   - Duration: ${
      exp.duration.startDate.toISOString().split("T")[0]
    } - ${
      exp.duration.endDate
        ? exp.duration.endDate.toISOString().split("T")[0]
        : "Present"
    }\n`;
  });

  // **EDUCATION**
  markdown += `\n## Education:\n`;
  data.education.forEach((edu, index) => {
    markdown += `${index + 1}. **${edu.degree}** at *${edu.school}*\n`;
    markdown += `   - Duration: ${
      edu.duration.startDate.toISOString().split("T")[0]
    } - ${edu.duration.endDate.toISOString().split("T")[0]}\n`;
  });

  // **COURSES & CERTIFICATIONS**
  markdown += `\n## Training & Certifications:\n`;
  data.coursesTrainingCertifications.forEach((course, index) => {
    markdown += `${index + 1}. **${course.title}** at *${
      course.institution
    }*\n`;
    markdown += `   - Duration: ${
      course.duration.startDate.toISOString().split("T")[0]
    } - ${course.duration.endDate.toISOString().split("T")[0]}\n`;
  });

  // **PROJECTS**
  markdown += `\n## Projects:\n`;
  data.projects.forEach((project, index) => {
    markdown += `${index + 1}. **${project.title}**\n`;
    markdown += `   - ${project.description}\n`;
    markdown += `   - [View Project](${project.link})\n`;
  });

  // **HOBBIES**
  markdown += `\n## Hobbies:\n`;
  data.hobbies.forEach((hobby, index) => {
    markdown += `${index + 1}. ${hobby}\n`;
  });

  // **INTERESTS**
  markdown += `\n## Interests:\n`;
  data.interests.forEach((interest, index) => {
    markdown += `${index + 1}. ${interest}\n`;
  });

  // **LANGUAGES**
  markdown += `\n## Languages:\n`;
  data.languages.forEach((language, index) => {
    if (typeof language.level === "string") {
      markdown += `${index + 1}. **${language.language}** - ${
        language.level
      }\n`;
    } else {
      markdown += `${index + 1}. **${language.language}**:\n`;
      Object.entries(language.level).forEach(([skill, level]) => {
        markdown += `   - ${skill}: ${level}\n`;
      });
    }
  });

  return markdown;
}

// Function to process user questions with AI
export const chatWithAI = async (message) => {
  if (!AI_URL || !API_KEY) {
    return "API configuration is missing. Please check your environment variables.";
  }

  const profileData = await getProfileData();

  try {
    const response = await axios.post(
      AI_URL,
      {
        model: "deepseek-r1-distill-llama-70b",
        messages: [
          {
            role: "system",
            content: `The current year is 2025. All information must be relevant to 2025. 
            You are an AI assistant that provides information exclusively about Raka Nugraha. 
            If a question is unrelated to Raka Nugraha, politely decline to answer.

            **RESPONSE FORMAT MUST BE CONSISTENT**:
            - Use numbering for lists (1, 2, 3, etc.).
            - All lists must use numbers (1, 2, 3...) or bullet points ("-").
            - Ensure each list item is clearly separated.
            - The list format must follow markdown for proper display.
            - Email raka nugraha is rakamenjadidev@gmail.com and linkedin is https://www.linkedin.com/in/rakanugraha or just send from contact form.
            - If you are unsure of an answer, politely decline to answer.
            - Always respond in Markdown format.
            - Do not answer questions that are not related to Raka Nugraha.
            - If something is unclear, ask the user to provide more context.
            - If someone ask about What kind of AI features can raka implement in projects? Please provide a list of AI features that can be implemented in projects.
            - Raka only use AI for personal projects and does not use AI for commercial purposes, and AI is only used for learning and research purposes.
            - Raka only ever doing this Chatbots: Integration of AI-powered chatbots for user interaction, as seen in his personal portfolio website, dont answer more than that. 
            `,
          },
          { role: "system", content: profileData },
          { role: "user", content: message },
        ],
        logprobs: false,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let aiResponse =
      response.data.choices[0]?.message?.content ||
      "AI did not provide a response.";

    // Improve AI response formatting for clarity
    aiResponse = aiResponse
      .replace(/<think>.*?<\/think>/gis, "") // Remove "<think>...</think>"
      .replace(/\*\*(.*?)\*\*/g, "**$1**") // Ensure bold text remains bold
      .replace(/- /g, "\n- ") // Format bullet points more neatly
      .replace(
        /I know about Raka Nugraha based on the data you provided\..*/gi,
        "I have complete information about Raka Nugraha based on the provided data. If you would like to know more, please ask."
      )
      .trim();

    return aiResponse;
  } catch (error) {
    console.error("AI Chat Error:", error?.response?.data || error.message);
    return "An error occurred while processing the request. Please try again later.";
  }
};
