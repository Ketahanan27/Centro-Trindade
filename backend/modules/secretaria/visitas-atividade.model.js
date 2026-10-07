import { objeto, texto, data, validarId, InputError } from '../../utils/inputValidation.js';
import { notas } from '../../utils/secretariaValidation.js';

export const TAMANHO_PAGINA = 25;
export const LIMITE_EXPORTACAO = 5000;

export function validarContagem(payload) {
  const body = objeto(payload);
  if (!['number', 'string'].includes(typeof body.quantidade)
    || !/^\d+$/.test(String(body.quantidade))
    || !Number.isSafeInteger(Number(body.quantidade)) || Number(body.quantidade) > 1000000) {
    throw new InputError('Quantidade deve ser um inteiro entre 0 e 1000000.');
  }
  const evento_id = body.evento_id == null || body.evento_id === '' ? null : validarId(body.evento_id);
  return {
    evento_id,
    atividade: evento_id ? null : texto(body.atividade, 'Atividade', 150, true),
    data_atividade: evento_id ? null : data(body.data_atividade, 'Data da atividade'),
    quantidade: Number(body.quantidade),
    observacoes: notas(body.observacoes, 'Observações', 2000),
  };
}

export function validarFiltrosContagens(query) {
  const inicio = data(query.inicio, 'Data inicial');
  const fim = data(query.fim, 'Data final');
  if (inicio && fim && inicio > fim) throw new InputError('O início deve ser anterior ao fim.');
  const pesquisa = texto(query.pesquisa, 'Pesquisa', 150);
  const pagina = validarId(query.pagina ?? 1);
  const exportar = query.exportar === 'true';
  return {
    inicio, fim, pesquisa: pesquisa ? `%${pesquisa}%` : null, exportar,
    limite: exportar ? LIMITE_EXPORTACAO + 1 : TAMANHO_PAGINA,
    offset: exportar ? 0 : (pagina - 1) * TAMANHO_PAGINA,
  };
}
