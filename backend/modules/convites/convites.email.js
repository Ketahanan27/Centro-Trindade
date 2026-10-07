import nodemailer from 'nodemailer';

const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export async function enviarLink(user, token, convite) {
  const link = new URL('/redefinir-password', process.env.FRONTEND_URL);
  link.searchParams.set('token', token);
  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }, connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 15000 });
  try {
    await transport.sendMail({ from: `"Centro Trindade" <${process.env.EMAIL_USER}>`, to: user.email,
      subject: convite ? 'Centro Trindade — Configure a sua conta' : 'Centro Trindade — Recuperação de palavra-passe',
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px"><h1>Centro Trindade</h1><h2>Olá, ${escape(user.nome)}!</h2><p>${convite ? 'Foi convidado para configurar a sua conta.' : 'Foi solicitada a recuperação da sua palavra-passe.'}</p><p><a href="${escape(link.toString())}">${convite ? 'Configurar conta' : 'Redefinir palavra-passe'}</a></p><p>Link de uso único, válido ${convite ? '48 horas' : '30 minutos'}. Se não esperava este pedido, ignore este email.</p></div>` });
  } finally { transport.close(); }
}

