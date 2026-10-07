import { validarId, validarUtilizador, InputError } from '../../utils/inputValidation.js';
import { erroConta } from '../convites/convites.model.js';
import { utilizadoresRepository } from './utilizadores.repository.js';

export function criarUtilizadoresService(repositorio = utilizadoresRepository) {
  function exigirConta(resultado) {
    if (resultado.rowCount === 0) throw erroConta(404, 'Utilizador não encontrado.');
  }
  return {
    async listar() {
      try { return await repositorio.listar(); }
      catch (error) {
        if (error.code !== '42703') throw error;
        return repositorio.listarLegado();
      }
    },
    async atualizar(identificador, payload, autorId) {
      const id = validarId(identificador);
      const dados = validarUtilizador(payload);
      if (id === autorId) throw new InputError('Não pode alterar o seu próprio perfil ou estado aqui.');
      exigirConta(await repositorio.atualizar(id, dados));
    },
    async eliminar(identificador, autorId) {
      const id = validarId(identificador);
      if (id === autorId) throw new InputError('Não pode eliminar a sua própria conta.');
      exigirConta(await repositorio.eliminar(id));
    },
  };
}

export const utilizadoresService = criarUtilizadoresService();
