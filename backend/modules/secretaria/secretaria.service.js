import { validarId } from '../../utils/inputValidation.js';
import { obterAreaSecretaria } from './secretaria.model.js';
import { criarSecretariaRepository } from './secretaria.repository.js';

export function criarSecretariaService(area, repositorio = criarSecretariaRepository(area)) {
  const { validar, singular, genero } = obterAreaSecretaria(area);
  function exigirRegisto(resultado) {
    if (resultado.rowCount === 0) {
      throw Object.assign(new Error(`${singular} não encontrad${genero}.`), { status: 404 });
    }
  }
  return {
    listar: () => repositorio.listar(),
    async criar(payload) {
      const resultado = await repositorio.criar(validar(payload));
      return resultado.rows[0].id;
    },
    async atualizar(id, payload) {
      const identificador = validarId(id);
      exigirRegisto(await repositorio.atualizar(identificador, validar(payload)));
    },
    async eliminar(id) {
      exigirRegisto(await repositorio.eliminar(validarId(id)));
    },
  };
}
