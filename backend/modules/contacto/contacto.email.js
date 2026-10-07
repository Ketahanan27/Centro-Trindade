import nodemailer from 'nodemailer';

export function verificarAceitacao(result, destinatario) {
  if (!result?.accepted?.some((email) => String(email).toLowerCase() === destinatario.toLowerCase())) {
    throw new Error("SMTP_RECIPIENT_NOT_ACCEPTED");
  }
}

export const criarTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

