import { InputError, objeto, texto, emailNormalizado } from '../../utils/inputValidation.js';
import { notas } from '../../utils/secretariaValidation.js';

export function validarContacto(payload) {
  const body = objeto(payload);
  const telefone = texto(body.telefone, "Telemóvel", 9);
  if (telefone && !/^\d{9}$/.test(telefone)) throw new InputError("O telemóvel deve conter exatamente 9 dígitos.");
  const mensagem = notas(body.mensagem, "Mensagem", 10000);
  if (!mensagem) throw new InputError("Mensagem é obrigatória.");
  return { nome: texto(body.nome, "Nome", 150, true), telefone,
    email: emailNormalizado(body.email, true), assunto: texto(body.assunto, "Assunto", 200), mensagem };
}
