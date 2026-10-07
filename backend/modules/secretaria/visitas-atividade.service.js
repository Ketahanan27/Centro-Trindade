import { InputError, validarId } from '../../utils/inputValidation.js';
import { hojeLisboa } from '../../utils/dataLisboa.js';
import { validarContagem, validarFiltrosContagens, LIMITE_EXPORTACAO } from './visitas-atividade.model.js';
import { visitasAtividadeRepository } from './visitas-atividade.repository.js';

function exigirContagem(resultado) {
  if (!resultado.rowCount) throw Object.assign(new Error('Contagem não encontrada.'), { status: 404 });
}

export function criarVisitasAtividadeService(repositorio = visitasAtividadeRepository, hoje = hojeLisboa) {
  async function preparar(payload) {
    const dados = validarContagem(payload);
    if (dados.evento_id) {
      const eventos = await repositorio.obterEvento(dados.evento_id);
      if (!eventos.length) throw new InputError('Selecione um evento existente.');
      dados.atividade = eventos[0].titulo;
      dados.data_atividade = eventos[0].data;
    }
    if (!dados.data_atividade) throw new InputError('Data da atividade é obrigatória.');
    if (dados.data_atividade > hoje()) {
      throw new InputError('Registe a contagem após a atividade; a data não pode ser futura.');
    }
    return dados;
  }
  return {
    async listar(query) {
      const filtros = validarFiltrosContagens(query);
      const [resumo, registos] = await Promise.all([repositorio.resumir(filtros), repositorio.listar(filtros)]);
      if (filtros.exportar && registos.length > LIMITE_EXPORTACAO) {
        throw new InputError('Reduza o período do relatório para até 5000 atividades.');
      }
      return { registos, total: Number(resumo[0].total), totalVisitantes: Number(resumo[0].visitantes) };
    },
    async criar(payload, autorId) {
      const resultado = await repositorio.criar(await preparar(payload), autorId);
      exigirContagem(resultado);
      return resultado.rows[0].id;
    },
    async atualizar(identificador, payload, autorId) {
      const id = validarId(identificador);
      const resultado = await repositorio.atualizar(id, await preparar(payload), autorId);
      exigirContagem(resultado);
      return resultado.rows[0].id;
    },
    async eliminar(identificador) {
      exigirContagem(await repositorio.eliminar(validarId(identificador)));
    },
  };
}

export const visitasAtividadeService = criarVisitasAtividadeService();
