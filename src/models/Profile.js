// import mongoose from "mongoose";

// const profileSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     about: { type: String, required: true },

//     skills: {
//       UIUX: [{ type: String }],
//       frontend: [{ type: String }],
//       backend: [{ type: String }],
//       devops: [{ type: String }],
//       versionControl: [{ type: String }],
//       AI: [{ type: String }],
//     },

//     experience: [
//       {
//         no: { type: Number, required: true },
//         company: { type: String, required: true },
//         role: { type: String, required: true },
//         startDate: { type: Date, required: true },
//         endDate: { type: Date, default: null }, // Null jika masih bekerja
//       },
//     ],

//     education: [
//       {
//         no: { type: Number, required: true },
//         school: { type: String, required: true },
//         degree: { type: String, required: true },
//         startDate: { type: Date, required: true },
//         endDate: { type: Date, required: true },
//       },
//     ],

//     coursesTrainingCertifications: [
//       {
//         no: { type: Number, required: true },
//         institution: { type: String, required: true },
//         location: { type: String },
//         title: { type: String, required: true },
//         startDate: { type: Date, required: true },
//         endDate: { type: Date, required: true },
//       },
//     ],

//     projects: [
//       {
//         no: { type: Number, required: true },
//         title: { type: String, required: true },
//         description: { type: String, required: true },
//         link: { type: String, required: true },
//       },
//     ],

//     hobbies: [{ type: String }], // List hobi
//     interests: [{ type: String }], // List minat teknologi

//     languages: {
//       type: Map,
//       of: mongoose.Schema.Types.Mixed, // Bisa menyimpan string atau nested object
//     },
//   },
//   { timestamps: true } // Menambahkan createdAt dan updatedAt secara otomatis
// );

// const Profile = mongoose.model("Profile", profileSchema);
// export default Profile;

import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    about: { type: String, required: true },

    skills: [
      {
        category: { type: String, required: true },
        skills: [{ type: String, required: true }],
      },
    ],

    experience: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        duration: {
          startDate: { type: Date, required: true },
          endDate: { type: Date, default: null },
        },
      },
    ],

    education: [
      {
        school: { type: String, required: true },
        degree: { type: String, required: true },
        duration: {
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true },
        },
      },
    ],

    coursesTrainingCertifications: [
      {
        institution: { type: String, required: true },
        location: { type: String },
        title: { type: String, required: true },
        duration: {
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true },
        },
      },
    ],

    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        link: { type: String, required: true },
      },
    ],

    hobbies: [{ type: String }],
    interests: [{ type: String }],

    languages: [
      {
        language: { type: String, required: true },
        level: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
