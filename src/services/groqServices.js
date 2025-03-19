import axios from "axios";
import Profile from "../models/Profile.js";
import dotenv from "dotenv";

dotenv.config();

const AI_URL = process.env.GROQ_API_URL;
const API_KEY = process.env.GROQ_API_KEY;

// Fungsi untuk mengambil data Raka Nugraha dari database
const getProfileData = async () => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return "Data tentang Raka Nugraha belum tersedia.";

    return formatMarkdownData(profile);
  } catch (error) {
    console.error("Error mengambil data profil:", error);
    return "Terjadi kesalahan dalam mengambil data profil.";
  }
};

function formatMarkdownData(data) {
  let markdown = `# ${data.name}\n\n`;
  markdown += `## Tentang Saya\n${data.about}\n\n`;

  // **SKILLS**
  markdown += `## Keahlian:\n`;
  data.skills.forEach((category, index) => {
    markdown += `${index + 1}. **${category.category}**:\n`;
    category.skills.forEach((skill) => {
      markdown += `   - ${skill}\n`;
    });
  });

  // **EXPERIENCE**
  markdown += `\n## Pengalaman Kerja:\n`;
  data.experience.forEach((exp, index) => {
    markdown += `${index + 1}. **${exp.role}** di *${exp.company}*\n`;
    markdown += `   - Durasi: ${
      exp.duration.startDate.toISOString().split("T")[0]
    } - ${
      exp.duration.endDate
        ? exp.duration.endDate.toISOString().split("T")[0]
        : "Sekarang"
    }\n`;
  });

  // **EDUCATION**
  markdown += `\n## Pendidikan:\n`;
  data.education.forEach((edu, index) => {
    markdown += `${index + 1}. **${edu.degree}** di *${edu.school}*\n`;
    markdown += `   - Durasi: ${
      edu.duration.startDate.toISOString().split("T")[0]
    } - ${edu.duration.endDate.toISOString().split("T")[0]}\n`;
  });

  // **COURSES & CERTIFICATIONS**
  markdown += `\n## Pelatihan & Sertifikasi:\n`;
  data.coursesTrainingCertifications.forEach((course, index) => {
    markdown += `${index + 1}. **${course.title}** di *${
      course.institution
    }*\n`;
    markdown += `   - Durasi: ${
      course.duration.startDate.toISOString().split("T")[0]
    } - ${course.duration.endDate.toISOString().split("T")[0]}\n`;
  });

  // **PROJECTS**
  markdown += `\n## Proyek:\n`;
  data.projects.forEach((project, index) => {
    markdown += `${index + 1}. **${project.title}**\n`;
    markdown += `   - ${project.description}\n`;
    markdown += `   - [Lihat proyek](${project.link})\n`;
  });

  // **HOBBIES**
  markdown += `\n## Hobi:\n`;
  data.hobbies.forEach((hobby, index) => {
    markdown += `${index + 1}. ${hobby}\n`;
  });

  // **INTERESTS**
  markdown += `\n## Minat:\n`;
  data.interests.forEach((interest, index) => {
    markdown += `${index + 1}. ${interest}\n`;
  });

  // **LANGUAGES**
  markdown += `\n## Bahasa:\n`;
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

// Fungsi untuk memproses pertanyaan ke AI
export const chatWithAI = async (message) => {
  if (!AI_URL || !API_KEY) {
    return "Konfigurasi API tidak ditemukan. Harap periksa variabel lingkungan.";
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
            content: `Saat ini sudah tahun 2025. Semua informasi harus sesuai dengan tahun 2025. 
            Anda adalah AI asisten yang hanya memberikan informasi tentang Raka Nugraha. 
            Jika pertanyaan tidak berkaitan dengan Raka Nugraha, tolak dengan sopan.

            **FORMAT RESPON HARUS KONSISTEN**:
            - Untuk penomoran setiap item daftar, gunakan angka 1, 2, 3, dan seterusnya.
            - Semua daftar harus menggunakan angka (1, 2, 3...) atau tanda "-".
            - Pastikan setiap entri dalam daftar diberi pemisah baris yang jelas.
            - Format daftar harus menggunakan markdown agar bisa ditampilkan dengan benar.
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
      "AI tidak memberikan jawaban.";

    // Perbaikan format jawaban AI agar lebih alami
    aiResponse = aiResponse
      .replace(/<think>.*?<\/think>/gis, "") // Hapus "<think>...</think>"
      .replace(/\*\*(.*?)\*\*/g, "**$1**") // Pastikan bold tetap bold
      .replace(/- /g, "\n- ") // Format bullet point lebih rapi
      .replace(
        /Saya mengetahui informasi tentang Raka Nugraha dari data yang Anda berikan\..*/gi,
        "Saya memiliki informasi lengkap tentang Raka Nugraha berdasarkan data yang telah disediakan. Jika ingin mengetahui lebih lanjut, silakan tanyakan."
      )
      .trim();

    return aiResponse;
  } catch (error) {
    console.error("AI Chat Error:", error?.response?.data || error.message);
    return "Terjadi kesalahan saat memproses pertanyaan. Coba lagi nanti.";
  }
};
