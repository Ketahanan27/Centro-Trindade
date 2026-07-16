import nodemailer from "nodemailer";

const criarTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, 
    },
  });

export const enviarContacto = async (req, res) => {
  const { nome, telefone, email, assunto, mensagem } = req.body;

  if (!nome?.trim()) {
    return res.status(400).json({ message: "Nome é obrigatório." });
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Email inválido." });
  }
  if (!mensagem?.trim()) {
    return res.status(400).json({ message: "Mensagem é obrigatória." });
  }

  const transporter = criarTransporter();

  const emailIgreja = {
    from:    `"Website Centro Trindade" <${process.env.EMAIL_USER}>`,
    to:      process.env.EMAIL_DESTINO,
    replyTo: email,                         
    subject: `📩 Novo Contacto: ${assunto?.trim() || "Sem assunto"} — ${nome}`,
    html: `
      <!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .wrapper { max-width: 600px; margin: 0 auto; background: white;
                     border-radius: 12px; overflow: hidden;
                     box-shadow: 0 2px 10px rgba(0,0,0,.1); }
          .header { background: #0044ff; color: white; padding: 30px;
                    text-align: center; }
          .header h1 { margin: 0; font-size: 22px; }
          .header p  { margin: 6px 0 0; opacity: .85; font-size: 14px; }
          .body { padding: 30px; }
          .campo { margin-bottom: 18px; }
          .campo label { display: block; font-size: 12px; font-weight: 700;
                         color: #0044ff; text-transform: uppercase;
                         letter-spacing: .05em; margin-bottom: 4px; }
          .campo p { margin: 0; padding: 12px; background: #f8f8f8;
                     border-radius: 8px; border-left: 3px solid #0044ff;
                     color: #333; font-size: 15px; white-space: pre-wrap; }
          .footer { background: #f0f0f0; padding: 16px 30px;
                    text-align: center; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>Centro Trindade</h1>
            <p>Novo contacto recebido pelo website</p>
          </div>
          <div class="body">
            <div class="campo">
              <label>Nome</label>
              <p>${escapeHtml(nome)}</p>
            </div>
            <div class="campo">
              <label>Email</label>
              <p>${escapeHtml(email)}</p>
            </div>
            <div class="campo">
              <label>Telemóvel</label>
              <p>${escapeHtml(telefone || "Não indicado")}</p>
            </div>
            <div class="campo">
              <label>Assunto</label>
              <p>${escapeHtml(assunto || "Não indicado")}</p>
            </div>
            <div class="campo">
              <label>Mensagem</label>
              <p>${escapeHtml(mensagem)}</p>
            </div>
          </div>
          <div class="footer">
            Para responder, basta clicar em "Responder" — a resposta irá directamente para ${escapeHtml(email)}
          </div>
        </div>
      </body>
      </html>
    `,
  };

  const emailConfirmacao = {
    from:    `"Centro Trindade" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: "✅ Recebemos a sua mensagem — Centro Trindade",
    html: `
      <!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .wrapper { max-width: 600px; margin: 0 auto; background: white;
                     border-radius: 12px; overflow: hidden;
                     box-shadow: 0 2px 10px rgba(0,0,0,.1); }
          .header { background: #0044ff; color: white; padding: 30px;
                    text-align: center; }
          .header h1 { margin: 0; font-size: 22px; }
          .body { padding: 30px; color: #333; line-height: 1.6; }
          .body h2 { color: #0044ff; }
          .resumo { background: #f8f8f8; border-radius: 8px;
                    padding: 16px 20px; margin: 20px 0;
                    border-left: 4px solid #0044ff; }
          .resumo p { margin: 6px 0; font-size: 14px; }
          .footer { background: #f0f0f0; padding: 16px 30px;
                    text-align: center; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>Centro Trindade</h1>
          </div>
          <div class="body">
            <h2>Olá, ${escapeHtml(nome)}!</h2>
            <p>
              Recebemos a sua mensagem e entraremos em contacto brevemente.
              Abaixo encontra o resumo do que nos enviou:
            </p>
            <div class="resumo">
              <p><strong>Assunto:</strong> ${escapeHtml(assunto || "Não indicado")}</p>
              <p><strong>Mensagem:</strong> ${escapeHtml(mensagem)}</p>
            </div>
            <p>
              Se tiver alguma dúvida urgente, pode contactar-nos directamente
              através do email <a href="mailto:${process.env.EMAIL_DESTINO}">${process.env.EMAIL_DESTINO}</a>.
            </p>
            <p>Com os melhores cumprimentos,<br><strong>Centro Trindade</strong></p>
          </div>
          <div class="footer">Esta é uma mensagem automática — por favor não responda a este email.</div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(emailIgreja);
    await transporter.sendMail(emailConfirmacao);

    res.json({
      message: "Mensagem enviada com sucesso! Verifique o seu email para a confirmação.",
    });
  } catch (err) {
    console.error("[enviarContacto] Erro nodemailer:", err.message);
    res.status(500).json({
      message: "Erro ao enviar email. Tente novamente mais tarde.",
    });
  }
};

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
