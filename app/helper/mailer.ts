'use server';

import nodemailer from 'nodemailer';

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
              <p>${message}</p>
             </div>`,
    });

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: 'Failed to send email.' };
  }
}