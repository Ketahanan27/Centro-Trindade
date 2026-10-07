import { emailNormalizado } from '../../utils/inputValidation.js';
import { validarContacto } from './contacto.model.js';
import { prepararEmailsContacto } from './contacto.templates.js';
import { criarTransporter, verificarAceitacao } from './contacto.email.js';

export function criarContactoService(abrirTransporter = criarTransporter, configuracao = () => process.env) {
  return {
    async enviar(payload) {
      const dados = validarContacto(payload);
      let remetente, destino;
      try {
        const config = configuracao();
        remetente = emailNormalizado(config.EMAIL_USER, true);
        destino = emailNormalizado(config.EMAIL_DESTINO, true);
        if (!config.EMAIL_PASS) throw new Error('SMTP_NOT_CONFIGURED');
      } catch {
        throw Object.assign(new Error('O serviço de contacto está temporariamente indisponível.'), { status: 503 });
      }
      const { emailIgreja, emailConfirmacao } = prepararEmailsContacto(dados, remetente, destino);
      let transporter;
      try {
        transporter = abrirTransporter();
        verificarAceitacao(await transporter.sendMail(emailIgreja), destino);
        try {
          verificarAceitacao(await transporter.sendMail(emailConfirmacao), dados.email);
          return {
            confirmacao_enviada: true,
            message: 'Mensagem enviada com sucesso! Verifique o seu email para a confirmação.',
          };
        } catch {
          console.error('[enviarContacto] Falha no envio da confirmação.');
          return {
            confirmacao_enviada: false,
            message: 'A sua mensagem foi enviada à igreja, mas não foi possível enviar a confirmação por email. Não precisa de enviar novamente.',
          };
        }
      } catch {
        console.error('[enviarContacto] Falha no envio para a igreja.');
        throw Object.assign(new Error('Não foi possível confirmar o envio da mensagem. Tente novamente mais tarde.'), { status: 502 });
      } finally { transporter?.close(); }
    },
  };
}

export const contactoService = criarContactoService();
