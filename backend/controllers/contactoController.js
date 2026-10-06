import nodemailer from "nodemailer";
import { InputError, objeto, texto, emailNormalizado } from "../utils/inputValidation.js";
import { notas } from "../utils/secretariaValidation.js";

export function validarContacto(payload) {
  const body = objeto(payload);
  const telefone = texto(body.telefone, "Telemóvel", 9);
  if (telefone && !/^\d{9}$/.test(telefone)) throw new InputError("O telemóvel deve conter exatamente 9 dígitos.");
  const mensagem = notas(body.mensagem, "Mensagem", 10000);
  if (!mensagem) throw new InputError("Mensagem é obrigatória.");
  return { nome: texto(body.nome, "Nome", 150, true), telefone,
    email: emailNormalizado(body.email, true), assunto: texto(body.assunto, "Assunto", 200), mensagem };
}
function verificarAceitacao(result, destinatario) {
  if (!result?.accepted?.some((email) => String(email).toLowerCase() === destinatario.toLowerCase())) {
    throw new Error("SMTP_RECIPIENT_NOT_ACCEPTED");
  }
}

const criarTransporter = () =>
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

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const enviarContacto = async (req, res) => {
  let dados;
  try { dados = validarContacto(req.body); }
  catch (err) { return res.status(400).json({ message: err.message }); }
  const { nome, telefone, email, assunto, mensagem } = dados;
  let remetente, destino;
  try {
    remetente = emailNormalizado(process.env.EMAIL_USER, true);
    destino = emailNormalizado(process.env.EMAIL_DESTINO, true);
    if (!process.env.EMAIL_PASS) throw new Error("SMTP_NOT_CONFIGURED");
  } catch {
    return res.status(503).json({ message: "O serviço de contacto está temporariamente indisponível." });
  }

  /*
  |--------------------------------------------------------------------------
  | Email interno para a igreja
  |--------------------------------------------------------------------------
  |
  | Todos os valores vindos do formulário passam por escapeHtml antes de
  | entrarem no template — o campo "mensagem" em particular é texto livre
  | do visitante e não pode ser interpretado como HTML.
  |
  */
  const emailIgreja = {
    from: `"Website Centro Trindade" <${remetente}>`,
    to: destino,
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
    from: `"Centro Trindade" <${remetente}>`,
    to: email,
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
              através do email <a href="mailto:${escapeHtml(destino)}">${escapeHtml(destino)}</a>.
            </p>
            <p>Com os melhores cumprimentos,<br><strong>Centro Trindade</strong></p>
          </div>
          <div class="footer">Esta é uma mensagem automática — por favor não responda a este email.</div>
        </div>
      </body>
      </html>
    `,
  };

  let transporter;
  try {
    transporter = criarTransporter();
    verificarAceitacao(await transporter.sendMail(emailIgreja), destino);
    try {
      verificarAceitacao(await transporter.sendMail(emailConfirmacao), email);
      return res.json({ confirmacao_enviada: true,
        message: "Mensagem enviada com sucesso! Verifique o seu email para a confirmação." });
    } catch {
      console.error("[enviarContacto] Falha no envio da confirmação.");
      return res.json({ confirmacao_enviada: false,
        message: "A sua mensagem foi enviada à igreja, mas não foi possível enviar a confirmação por email. Não precisa de enviar novamente." });
    }
  } catch {
    console.error("[enviarContacto] Falha no envio para a igreja.");
    return res.status(502).json({ message: "Não foi possível confirmar o envio da mensagem. Tente novamente mais tarde." });
  } finally {
    transporter?.close();
  }
};
