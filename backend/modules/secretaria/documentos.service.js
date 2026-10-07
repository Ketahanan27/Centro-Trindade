import { validarDocumento } from '../../../shared/documentos.js';
import { InputError, validarId } from '../../utils/inputValidation.js';
import { documentosRepository } from './documentos.repository.js';

function lerDadosDocumento(documento) {
  try {
    return typeof documento.dados_json === 'string'
      ? JSON.parse(documento.dados_json) : documento.dados_json ?? {};
  } catch { return {}; }
}

export function criarDocumentosService(repositorio = documentosRepository) {
  return {
    async listar() {
      return (await repositorio.listar()).map(documento => ({
        ...documento, dados_json: lerDadosDocumento(documento),
      }));
    },
    async criar(payload) {
      const erro = validarDocumento(payload);
      if (erro) throw new InputError(erro);
      return (await repositorio.criar(payload)).rows[0].id;
    },
    async eliminar(identificador) {
      const resultado = await repositorio.eliminar(validarId(identificador));
      if (resultado.rowCount === 0) {
        throw Object.assign(new Error('Documento não encontrado.'), { status: 404 });
      }
    },
  };
}

export const documentosService = criarDocumentosService();
