import { Request, Response } from "express";
import sendMails from "../services/mail.service";

const sendMail = async (req: Request, res: Response) => {
  try {
    const { email, subject, template, data } = req.body;

    // Validate required fields
    if (!email || !subject || !template) {
      return res.status(400).json({
        success: false,
        message: "Email, subject, and template are required fields",
      });
    }

    // Call the mail service
    await sendMails({
      email,
      subject,
      template,
      data: data || {},
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default sendMail;
