import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const AI_URL = process.env.GROQ_API_URL;
const API_KEY = process.env.GROQ_API_KEY;

const getProfileData = () => {
  return `
    About Raka Nugraha:
    - Full Stack Developer transitioning from Manual QA
    - Experience in IT Support, Manual QA, and Web Development
    - Email: raka.nugraha@example.com
    
    Core Expertise:
    - Frontend Development: React.js, Next.js, Tailwind CSS
    - Backend Development: Node.js, Express.js, Golang
    - Database Management: MySQL, MongoDB
    - DevOps: Vercel, Render, Railway
    
    Notable Projects:
    1. Flixflix Movie: A movie information website using React.js and TMDB API
       - [View Project](https://flixflix-mntv.vercel.app/)
    2. E-Commerce Smartliving: Full-stack e-commerce platform built during internship
       - [View Project](https://smartliving.vercel.app/)
    3. Portfolio Website: A portfolio showcasing Raka's work with an AI chatbot feature
       - [View Project](https://rakanugrahadev.vercel.app/)
    
    Skills & Technologies:
    - Frontend: HTML, CSS, JavaScript, React.js, Next.js, Tailwind CSS
    - Backend: Node.js, Express.js, Golang, MySQL, MongoDB
    - DevOps: Vercel, Render, Railway
    - Version Control: Git, GitHub
    - UI/UX Tools: Figma, Photoshop
    
    Work Experience:
    - Manual QA at PT Karya Kaya Bahagia (2025 - Present)
    - IT Support Staff at PT American Hamburger (2017 - 2020)
    - Leader Store at PT Surganya Motor Indonesia (2014 - 2016)
    
    Education:
    - SMK Yasti Cisaat, Teknik Komputer dan Jaringan (2011 - 2014)
    
    Certifications & Training:
    - Full Stack Developer Bootcamp, Harisenin.com (2023 - 2024)
    - Junior Technical Support, Badan Diklat (2014)
    
    Additional Information:
    - Passionate about AI and Open Source Development
    - Enjoys reading about coding, watching tech-related content, and playing badminton
  `;
};

export const chatWithAI = async (message) => {
  if (!AI_URL || !API_KEY) {
    return "API configuration is missing. Please check your environment variables.";
  }

  const profileData = getProfileData();

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
            - Ensure each list item is clearly separated.
            - Follow markdown formatting for better readability.`,
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

    aiResponse = aiResponse
      .replace(/<think>.*?<\/think>/gis, "")
      .replace(/\*\*(.*?)\*\*/g, "**$1**")
      .replace(/- /g, "\n- ")
      .trim();

    return aiResponse;
  } catch (error) {
    console.error("AI Chat Error:", error?.response?.data || error.message);
    return "An error occurred while processing the request. Please try again later.";
  }
};
