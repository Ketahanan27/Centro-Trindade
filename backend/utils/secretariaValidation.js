import { InputError, objeto, texto, emailNormalizado, escolha, data, validarId } from './inputValidation.js';

function notas(value, label, max = 10000) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || Array.from(value).some((char) => {
    const code = char.codePointAt(0);
    return (code < 32 && ![9, 10, 13].includes(code)) || code === 127;
  })) throw new InputError(`${label} inválido.`);
  const cleaned = value.trim();
  if (Array.from(cleaned).length > max) throw new InputError(`${label} deve ter no máximo ${max} caracteres.`);
  return cleaned || null;
}
function dataObrigatoria(value, label) {
  const result = data(value, label);
  if (!result) throw new InputError(`${label} é obrigatória.`);
  return result;
}
export function validarVisitante(payload) {
  const body = objeto(payload);
  const telefone = texto(body.telefone, 'Telefone', 9, true);
  if (!/^\d{9}$/.test(telefone)) throw new InputError('O telefone deve conter exatamente 9 dígitos.');
  return { nome: texto(body.nome, 'Nome', 150, true), telefone, email: emailNormalizado(body.email), data_visita: dataObrigatoria(body.data_visita, 'Data da visita'), convidado_por: texto(body.convidado_por, 'Convidado por', 150, true), observacoes: notas(body.observacoes, 'Observações'), estado: escolha(body.estado, 'Estado', ['Visitante', 'Em acompanhamento', 'Tornou-se membro'], 'Visitante') };
}
export function validarApresentacao(payload) {
  const body = objeto(payload);
  let quantidade;
  try { quantidade = validarId(body.quantidade); } catch { throw new InputError('Quantidade deve ser um número inteiro positivo, até 2147483647.'); }
  return { data_apresentacao: dataObrigatoria(body.data_apresentacao, 'Data da apresentação'), quantidade, observacoes: notas(body.observacoes, 'Observações') };
}
export function validarAta(payload) {
  const body = objeto(payload);
  const hora = texto(body.hora, 'Hora', 8, true);
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(hora)) throw new InputError('Hora inválida. Use HH:MM ou HH:MM:SS.');
  return { titulo: texto(body.titulo, 'Título', 255, true), data: dataObrigatoria(body.data, 'Data da reunião'), hora, local: texto(body.local, 'Local', 255), participantes: notas(body.participantes, 'Participantes'), resumo: notas(body.resumo, 'Resumo', 30000), decisoes: notas(body.decisoes, 'Decisões', 30000), observacoes: notas(body.observacoes, 'Observações') };
}
