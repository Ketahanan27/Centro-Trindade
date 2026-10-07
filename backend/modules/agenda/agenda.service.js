import { agendaRepository } from './agenda.repository.js';
import { validarEvento } from '../../utils/secretariaValidation.js';
import { InputError, validarId } from '../../utils/inputValidation.js';

import { hojeLisboa } from '../../utils/dataLisboa.js';
export { hojeLisboa } from '../../utils/dataLisboa.js';

const naoEncontrado = () => Object.assign(new Error('Evento não encontrado.'), { status: 404 });

// Repository and clock can be replaced in isolated tests, without a database.
export function criarAgendaService(repositorio = agendaRepository, hoje = hojeLisboa) {
  return {
    listarPublicos: () => repositorio.listarPublicos(),
    listarInternos: () => repositorio.listarInternos(),

    async criar(payload) {
      const dados = validarEvento(payload);
      if (dados.data_evento < hoje()) throw new InputError('Não é permitido criar eventos em datas passadas.');
      return repositorio.criar(dados);
    },

    async atualizar(identificador, payload) {
      const id = validarId(identificador);
      const dados = validarEvento(payload);
      if (await repositorio.atualizar(id, dados) === 0) throw naoEncontrado();
    },

    async eliminar(identificador) {
      const id = validarId(identificador);
      if (await repositorio.eliminarNaoRealizado(id, hoje()) !== 0) return;
      if (!await repositorio.existe(id)) throw naoEncontrado();
      throw new InputError('Eventos já realizados não podem ser eliminados. Pode corrigir os dados e o estado.');
    },
  };
}

export const agendaService = criarAgendaService();
