export const FORM_VAZIO = {
  nome_completo: '', bi: '', data_nascimento: '', data_batismo: '',
  data_entrada: '', estado: 'Ativo', igreja_destino: '', motivo: '',
};

export function dadosParaEmissao(formulario, tipo, hoje = new Date()) {
  const dataEmissao = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  return {
    tipo,
    nome_completo: formulario.nome_completo.trim(),
    bi: formulario.bi.trim(),
    data_emissao: dataEmissao,
    dados_json: { ...formulario },
  };
}
