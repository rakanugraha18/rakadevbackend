import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import groqRoutes from "./routes/groqRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
const app = express();
const allowedOrigins = [
  "https://rakanugrahadev.vercel.app",
  "http://localhost:3000",
];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin); // Izinkan request jika origin sesuai daftar
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json());
app.use(cookieParser());
app.options("*", cors()); // untuk handle preflight secara global

// Koneksi ke database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/groq", groqRoutes);
app.use("/api/email", emailRoutes);

export default app;
