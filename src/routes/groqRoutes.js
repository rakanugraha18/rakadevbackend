import express from "express";
import { chatWithAI } from "../services/groqServices.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const response = await chatWithAI(message);
  res.json({ response });
});

export default router;
