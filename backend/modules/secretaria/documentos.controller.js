import { documentosService } from './documentos.service.js';

function responderErro(res, error, operacao) {
  if ([400, 404].includes(error.status)) return res.status(error.status).json({ message: error.message });
  console.error(`[${operacao}]`, error.code ?? 'erro');
  return res.status(500).json({ message: 'Erro interno do servidor.' });
}

export async function getDocumentos(_req, res) {
  try { res.json(await documentosService.listar()); }
  catch (error) { responderErro(res, error, 'getDocumentos'); }
}

export async function createDocumento(req, res) {
  try {
    const id = await documentosService.criar(req.body);
    res.status(201).json({ message: 'Documento guardado', id });
  } catch (error) { responderErro(res, error, 'createDocumento'); }
}

export async function deleteDocumento(req, res) {
  try {
    await documentosService.eliminar(req.params.id);
    res.json({ message: 'Documento eliminado com sucesso.' });
  } catch (error) { responderErro(res, error, 'deleteDocumento'); }
}
