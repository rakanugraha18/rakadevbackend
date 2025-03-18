import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (req, res) => {
  try {
    const { from_name, from_email, message } = req.body;

    if (!from_name || !from_email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailData = await resend.emails.send({
      from: `"${from_name}" <onboarding@resend.dev>`,
      to: ["rakamenjadidev@gmail.com"],
      subject: `New Contact Form Message from ${from_name}`,
      text: `Name: ${from_name}\nEmail: ${from_email}\nMessage: ${message}`,
    });

    return res.status(200).json(emailData);
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
};
