import axios from "axios";
import Profile from "../models/Profile.js";
import dotenv from "dotenv";

dotenv.config();

const AI_URL = process.env.GROQ_API_URL;
const API_KEY = process.env.GROQ_API_KEY;

let profileCache = null;

// Get profile data (once and cache)
const getProfileData = async () => {
  if (profileCache) return profileCache;

  try {
    console.time("GetProfileData");
    const profile = await Profile.findOne().lean();
    console.timeEnd("GetProfileData");

    if (!profile) return "Raka Nugraha's profile data is not available.";

    profileCache = formatMarkdownData(profile);
    return profileCache;
  } catch (error) {
    console.error("Error retrieving profile data:", error);
    return "An error occurred while fetching profile data.";
  }
};

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

// Format profile into markdown
function formatMarkdownData(data) {
  let markdown = `# ${data.name}\n\n`;
  markdown += `## About Me\n${data.about}\n\n`;

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
    const start = new Date(exp?.duration?.startDate);
    const end = exp?.duration?.endDate ? new Date(exp.duration.endDate) : null;

    markdown += `${index + 1}. **${exp.role}** at *${exp.company}*\n`;
    markdown += `   - Duration: ${
      isValidDate(start) ? start.toISOString().split("T")[0] : "N/A"
    } - ${isValidDate(end) ? end.toISOString().split("T")[0] : "Present"}\n`;
  });

  markdown += `\n## Projects:\n`;
  data.projects.forEach((project, index) => {
    markdown += `${index + 1}. **${project.title}**\n`;
    markdown += `   - ${project.description}\n`;
    markdown += `   - [View Project](${project.link})\n`;
  });

  markdown += `\n## Contact:\n`;
  markdown += `- Email: rakamenjadidev@gmail.com\n`;
  markdown += `- LinkedIn: https://www.linkedin.com/in/rakanugraha\n`;

  return markdown;
}

// Chat with AI function
export const chatWithAI = async (message) => {
  if (!AI_URL || !API_KEY) {
    return "API configuration is missing. Please check your environment variables.";
  }

  const profileData = await getProfileData();

  try {
    console.time("GroqAIRequest");

    const response = await axios.post(
      AI_URL,
      {
        model: "llama3-8b-8192", // ← ini yang diganti
        messages: [
          {
            role: "system",
            content: `The current year is 2025...`, // dan seterusnya
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

    console.timeEnd("GroqAIRequest");

    let aiResponse =
      response.data.choices[0]?.message?.content ||
      "AI did not provide a response.";

    aiResponse = aiResponse
      .replace(/<think>.*?<\/think>/gis, "")
      .replace(/\*\*(.*?)\*\*/g, "**$1**")
      .replace(/- /g, "\n- ")
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
