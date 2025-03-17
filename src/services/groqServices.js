import axios from "axios";
import Profile from "../models/Profile.js";
import dotenv from "dotenv";

dotenv.config();

const AI_URL = process.env.GROQ_API_URL;

// Fungsi untuk mengambil data Raka Nugraha dari database
const getProfileData = async () => {
  const profile = await Profile.findOne();
  if (!profile) return "Data tentang Raka Nugraha belum tersedia.";

  // Fungsi untuk mengubah format tanggal menjadi "Bulan Tahun"
  const formatDate = (dateString, showDay = false) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long" };
    if (showDay) options.day = "numeric";
    return date.toLocaleDateString("id-ID", options);
  };

  return `
  **Nama**: ${profile.name}
  **Tentang**: ${profile.about}

  **Keahlian**:
  ${profile.skills.map((skill) => `- ${skill}`).join("\n")}

  **Pengalaman Kerja**:
  ${profile.experience
    .map((exp) => {
      const startFormatted = formatDate(exp.startDate, !exp.endDate);
      const endFormatted =
        exp.endDate && exp.endDate !== ""
          ? formatDate(exp.endDate)
          : "sekarang";
      const startYear = new Date(exp.startDate).getFullYear();
      const endYear =
        exp.endDate && exp.endDate !== ""
          ? new Date(exp.endDate).getFullYear()
          : null;
      const duration = endYear
        ? `${endYear - startYear} tahun`
        : `sejak ${startFormatted}`;

      return exp.endDate && exp.endDate !== ""
        ? `- **${exp.role}** di ${exp.company} (${duration})`
        : `- **${exp.role}** di ${exp.company} (${startFormatted} - ${endFormatted})`;
    })
    .join("\n")}

  **Pendidikan**:
  ${profile.education
    .map((edu) => {
      const startFormatted = formatDate(edu.startDate);
      const endFormatted =
        edu.endDate && edu.endDate !== ""
          ? formatDate(edu.endDate)
          : "sekarang";
      return `- **${edu.degree}** di ${edu.school} (${startFormatted} - ${endFormatted})`;
    })
    .join("\n")}
    
  **Proyek**:
  ${profile.projects
    .map(
      (proj) =>
        `- **${proj.title}**: ${proj.description} [Lihat di sini](${proj.link})`
    )
    .join("\n")}
  `;
};

// Fungsi untuk memproses pertanyaan ke AI
export const chatWithAI = async (message) => {
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
            Jika pertanyaan tidak berkaitan dengan Raka Nugraha, tolak dengan sopan.`,
          },
          { role: "system", content: profileData },
          { role: "user", content: message },
        ],
        logprobs: false,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let aiResponse = response.data.choices[0].message.content;

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
    console.error("AI Chat Error:", error);
    return "Terjadi kesalahan saat memproses pertanyaan.";
  }
};
