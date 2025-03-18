import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    about: { type: String, required: true },
    skills: [{ type: String, required: true }], // Pastikan skills tidak kosong
    experience: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, default: null }, // Bisa null jika masih bekerja
      },
    ],
    education: [
      {
        school: { type: String, required: true },
        degree: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, default: null }, // Bisa null jika masih kuliah
      },
    ],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        link: { type: String, required: true },
      },
    ],
  },
  { timestamps: true } // Menambahkan createdAt dan updatedAt secara otomatis
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
