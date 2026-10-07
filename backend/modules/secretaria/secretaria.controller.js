import { obterAreaSecretaria } from './secretaria.model.js';
import { criarSecretariaService } from './secretaria.service.js';

export function criarSecretariaController(area, service = criarSecretariaService(area)) {
  const { singular, genero } = obterAreaSecretaria(area);
  function responderErro(res, error, acao) {
    if ([400, 404].includes(error.status)) return res.status(error.status).json({ message: error.message });
    if (error.code === '23503') return res.status(409).json({ message: 'Existem registos associados que impedem esta operação.' });
    if (error.code === '23505') return res.status(409).json({ message: 'Já existe um registo com estes dados.' });
    console.error(`[${area}:${acao}]`, error.code ?? 'erro');
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
  const escrever = acao => async (req, res) => {
    try {
      let id;
      if (acao === 'criar') id = await service.criar(req.body);
      else if (acao === 'atualizar') await service.atualizar(req.params.id, req.body);
      else await service.eliminar(req.params.id);
      const verbo = acao === 'criar' ? 'registad' : acao === 'atualizar' ? 'atualizad' : 'eliminad';
      res.status(acao === 'criar' ? 201 : 200).json({
        message: `${singular} ${verbo}${genero} com sucesso.`,
        ...(acao === 'criar' ? { id } : {}),
      });
    } catch (error) { responderErro(res, error, acao); }
  };
  return {
    async listar(_req, res) {
      try { res.json(await service.listar()); }
      catch (error) {
        console.error(`[${area}:listar]`, error.code ?? 'erro');
        res.status(500).json({ message: 'Erro interno do servidor.' });
      }
    },
    criar: escrever('criar'), atualizar: escrever('atualizar'), eliminar: escrever('eliminar'),
  };
}
