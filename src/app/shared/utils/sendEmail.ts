import nodemailer from "nodemailer";

const sendEmail = async (to: string, resetToken: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // ✅ MUST MATCH FRONTEND
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

  const message = `
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    <p>This link will expire in 10 minutes.</p>
  `;

  await transporter.sendMail({
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset",
    html: message,
  });
};

export default sendEmail;
