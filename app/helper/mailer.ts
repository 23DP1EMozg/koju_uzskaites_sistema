// Not a 'use server' module on purpose: a server action would let anyone send email through
// our SMTP account. Only server code (the admin actions) may call it.
import nodemailer from 'nodemailer';

// The message can hold user input (names, emails), so it's escaped before going into the HTML part
const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

type SendEmailProps = {
  to: string;        // Recipient's email address
  subject: string;   // Email subject
  message: string;   // Plain text or HTML content
};

export async function sendEmail({ to, subject, message }: SendEmailProps) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for port 465, false for port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `Kojinieks`, // Sent FROM your authenticated address
      to: to,                                             // Sent TO the recipient
      subject: subject,
      text: message,
      html: `<div style="font-family: sans-serif; padding: 20px;">
              <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
             </div>`,
    });

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: 'Failed to send email.' };
  }
}