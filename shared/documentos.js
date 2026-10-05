export const TITULOS_DOCUMENTO = {
  Batismo: "Declaração de Batismo",
  Membro: "Declaração de Membro",
  Recomendacao: "Carta de Recomendação",
};

export function dataValida(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validarDocumento(registo) {
  if (!registo || !Object.hasOwn(TITULOS_DOCUMENTO, registo.tipo)) return "Tipo de documento inválido.";
  const dados = registo.dados_json;
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) return "Dados do documento inválidos.";
  for (const [key, label, max] of [["nome_completo", "Nome", 250], ["bi", "BI / Cartão de Cidadão", 50]]) {
    if (typeof registo[key] !== "string" || !registo[key].trim() || registo[key].length > max) return `${label} inválido ou em falta.`;
  }
  if (!dataValida(registo.data_emissao)) return "Data de emissão inválida ou em falta.";
  if (registo.tipo === "Batismo") {
    if (!dataValida(dados.data_nascimento) || !dataValida(dados.data_batismo)) return "Indique datas válidas de nascimento e batismo.";
    if (dados.data_batismo < dados.data_nascimento) return "O batismo não pode ser anterior ao nascimento.";
  } else if (!dataValida(dados.data_entrada)) return "Indique uma data de entrada válida.";
  if (registo.tipo === "Membro" && !["Ativo", "Inativo"].includes(dados.estado)) return "Estado do membro inválido.";
  if (registo.tipo === "Recomendacao") {
    if (typeof dados.igreja_destino !== "string" || !dados.igreja_destino.trim() || dados.igreja_destino.length > 250) return "Indique a igreja de destino (até 250 caracteres).";
    if (dados.motivo != null && (typeof dados.motivo !== "string" || dados.motivo.length > 2000)) return "O motivo deve ter até 2000 caracteres.";
  }
  return null;
}
