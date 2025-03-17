import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  name: String,
  about: String,
  skills: [String],
  experience: [
    {
      company: { type: String, required: true },
      role: { type: String, required: true },
      years: { type: Number, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
    },
  ],
  education: [
    {
      school: { type: String, required: true },
      degree: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
    },
  ],
  projects: [
    {
      title: String,
      description: String,
      link: String,
    },
  ],
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
