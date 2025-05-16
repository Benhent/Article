import { MailService } from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      html
    };
    await mailService.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}