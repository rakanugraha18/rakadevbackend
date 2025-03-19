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

    // Fungsi untuk mengubah format tanggal menjadi "Bulan Tahun"
    const formatDate = (dateString, showDay = false) => {
      if (!dateString) return "Tidak diketahui";
      const date = new Date(dateString);
      const options = { year: "numeric", month: "long" };
      if (showDay) options.day = "numeric";
      return date.toLocaleDateString("id-ID", options);
    };

    // Format keahlian berdasarkan kategori
    const formatSkills = (category) =>
      profile.skills[category]?.length
        ? profile.skills[category].map((skill) => `- ${skill}`).join("\n")
        : "- Tidak ada data.";

    const experience = profile.experience?.length
      ? profile.experience
          .map((exp, index) => {
            const startFormatted = formatDate(exp.startDate, !exp.endDate);
            const endFormatted = exp.endDate
              ? formatDate(exp.endDate)
              : "sekarang";
            return `${index + 1}. **${exp.role}** di **${
              exp.company
            }** (${startFormatted} - ${endFormatted})`;
          })
          .join("\n")
      : "Tidak ada pengalaman kerja yang tersedia.";

    const education = profile.education?.length
      ? profile.education
          .map((edu, index) => {
            const startFormatted = formatDate(edu.startDate);
            const endFormatted = edu.endDate
              ? formatDate(edu.endDate)
              : "sekarang";
            return `${index + 1}. **${edu.degree}** di **${
              edu.school
            }** (${startFormatted} - ${endFormatted})`;
          })
          .join("\n")
      : "Tidak ada riwayat pendidikan yang tersedia.";

    const projects = profile.projects?.length
      ? profile.projects
          .map(
            (proj, index) =>
              `${index + 1}. **${proj.title}**: ${
                proj.description
              } [Lihat di sini](${proj.link})`
          )
          .join("\n")
      : "Tidak ada proyek yang tersedia.";

    const hobbies = profile.hobbies?.length
      ? profile.hobbies.map((hobby) => `- ${hobby}`).join("\n")
      : "- Tidak ada hobi yang tercatat.";

    const interests = profile.interests?.length
      ? profile.interests.map((interest) => `- ${interest}`).join("\n")
      : "- Tidak ada minat yang tercatat.";

    return `
**Nama**: ${profile.name}
**Tentang**: ${profile.about}

**Keahlian**:
- **UI/UX**:
${formatSkills("UIUX")}

- **Frontend**:
${formatSkills("frontend")}

- **Backend**:
${formatSkills("backend")}

- **DevOps**:
${formatSkills("devops")}

- **Version Control**:
${formatSkills("versionControl")}

- **Artificial Intelligence**:
${formatSkills("AI")}

**Pengalaman Kerja**:
${experience}

**Pendidikan**:
${education}

**Proyek**:
${projects}

**Hobi**:
${hobbies}

**Minat**:
${interests}
    `;
  } catch (error) {
    console.error("Error mengambil data profil:", error);
    return "Terjadi kesalahan dalam mengambil data profil.";
  }
};

// Fungsi untuk memproses pertanyaan ke AI
export // Fungsi untuk memproses pertanyaan ke AI
const chatWithAI = async (message) => {
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
            - Hindari penomoran setiap daftar dengan hanya menggunakan angka 1 saja kecuali untuk daftar pertama.
            - Pastikan setiap entri dalam daftar diberi pemisah baris yang jelas.
            - Format daftar harus menggunakan markdown agar bisa ditampilkan dengan benar.
            - Untuk Durasi, buat seperti ini Durasi: Juli 2011 - Juni 2014 jadi di satukan dalam satu baris dan tidak terpisah dengan bullet point.
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
