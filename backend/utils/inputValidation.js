export class InputError extends Error {
  constructor(message) { super(message); this.status = 400; }
}
export function validarId(value) {
  if (!['string', 'number'].includes(typeof value) || !/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < 1 || Number(value) > 2147483647) throw new InputError('Identificador inválido.');
  return Number(value);
}
export function objeto(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new InputError('Os dados devem ser um objeto.');
  return value;
}
export function texto(value, label, max, required = false) {
  if (value == null || value === '') {
    if (required) throw new InputError(`${label} é obrigatório.`);
    return null;
  }
  if (typeof value !== 'string' || Array.from(value).some((char) => char.codePointAt(0) < 32 || char.codePointAt(0) === 127)) throw new InputError(`${label} inválido.`);
  const cleaned = value.trim();
  if (Array.from(cleaned).length > max) throw new InputError(`${label} deve ter no máximo ${max} caracteres.`);
  if (!cleaned && required) throw new InputError(`${label} é obrigatório.`);
  return cleaned || null;
}
export function emailNormalizado(value, required = false) {
  const email = texto(value, 'Email', 150, required);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InputError('Formato de email inválido.');
  return email?.toLowerCase() ?? null;
}
export function escolha(value, label, options, fallback = null) {
  if (value == null || value === '') return fallback;
  const cleaned = texto(value, label, 50);
  if (!options.includes(cleaned)) throw new InputError(`${label} inválido.`);
  return cleaned;
}
function data(value, label) {
  const cleaned = texto(value, label, 10);
  if (!cleaned) return null;
  const parsed = new Date(`${cleaned}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleaned) || cleaned.startsWith('0000') || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== cleaned) throw new InputError(`${label} inválida. Use uma data real no formato AAAA-MM-DD.`);
  return cleaned;
}
export const PERFIS = ['Administrador', 'Secretaria', 'Tesouraria', 'Pastor', 'Membro'];
export const ESTADOS = ['Ativo', 'Inativo'];
export function validarMembro(payload, pessoal = false) {
  const body = objeto(payload);
  const dados = {
    telemovel: texto(body.telemovel, 'Telemóvel', 9),
    sexo: escolha(body.sexo, 'Sexo', ['Masculino', 'Feminino']),
    estado_civil: escolha(body.estado_civil, 'Estado civil', ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)']),
    morada: texto(body.morada, 'Morada', 255),
    codigo_postal: texto(body.codigo_postal, 'Código postal', 8),
  };
  if (dados.telemovel && !/^\d{9}$/.test(dados.telemovel)) throw new InputError('O telemóvel deve conter exatamente 9 dígitos.');
  if (dados.codigo_postal && !/^\d{4}-\d{3}$/.test(dados.codigo_postal)) throw new InputError('O código postal deve ter o formato XXXX-XXX.');
  if (!pessoal) {
    Object.assign(dados, { nome: texto(body.nome, 'Nome', 150, true), email: emailNormalizado(body.email), nascimento: data(body.nascimento, 'Data de nascimento'), entrada: data(body.entrada, 'Data de entrada'), batizado: escolha(body.batizado, 'Batismo', ['Sim', 'Não'], 'Não'), estado: escolha(body.estado, 'Estado', ESTADOS, 'Ativo') });
    if (Object.hasOwn(body, 'utilizador_id')) dados.utilizador_id = body.utilizador_id == null || body.utilizador_id === '' ? null : validarId(body.utilizador_id);
  }
  return dados;
}
export function validarUtilizador(payload, criar = false) {
  const body = objeto(payload);
  const dados = { nome: texto(body.nome, 'Nome', 150, true), perfil: escolha(body.perfil, 'Perfil', PERFIS, criar ? 'Membro' : null), estado: escolha(body.estado, 'Estado', ESTADOS, criar ? 'Ativo' : null) };
  if (!dados.perfil || !dados.estado) throw new InputError('Perfil e estado são obrigatórios.');
  if (criar) dados.email = emailNormalizado(body.email, true);
  return dados;
}
