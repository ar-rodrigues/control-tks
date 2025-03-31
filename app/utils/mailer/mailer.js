"use server";
import nodemailer from "nodemailer";

export async function sendEmail(email, name, password, subject, body) {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: "587" || "465" || process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === "465" ? true : false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject || "Welcome to Our Service!",
    html:
      body ||
      `
      <h1>Hello ${name},</h1>
      <p>Your account has been created successfully.</p>
      <p>Your login details are:</p>
      <ul>
        <li>Email: ${email}</li>
        <li>Password: ${password}</li>
      </ul>
      <p>Please log in and change your password after your first login.</p>
      <p>Thank you!</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}
