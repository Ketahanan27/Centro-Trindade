import { tesourariaService } from './tesouraria.service.js';

export async function getMovimentos(_req, res) {
  try {
    res.json(await tesourariaService.listarMovimentos());
  } catch (error) {
    console.error('[getMovimentos]', error.code ?? 'erro');
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

export async function getResumo(_req, res) {
  try {
    res.json(await tesourariaService.obterResumo());
  } catch (error) {
    console.error('[getResumo]', error.code ?? 'erro');
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

export async function getHistorico(_req, res) {
  try {
    res.json(await tesourariaService.listarHistorico());
  } catch (error) {
    console.error('[tesourariaHistorico]', error.code ?? 'erro');
    res.status(500).json({ message: 'Não foi possível consultar o histórico.' });
  }
}

export const escreverMovimento = acao => async (req, res) => {
  try {
    const id = await tesourariaService.escrever(acao, req.params?.id, req.body, req.user.id);
    return res.status(acao === 'Criado' ? 201 : 200).json({
      message: acao === 'Criado' ? 'Movimento registado com sucesso.'
        : acao === 'Alterado' ? 'Movimento atualizado com sucesso.'
          : 'Movimento eliminado com histórico preservado.',
      id,
    });
  } catch (error) {
    if (error.status === 400 || error.status === 404) return res.status(error.status).json({ message: error.message });
    console.error('[tesouraria]', error.code ?? 'erro');
    return res.status(500).json({ message: 'Não foi possível guardar a operação. Nenhuma alteração foi confirmada.' });
  }
};

export const createMovimento = escreverMovimento('Criado');
export const updateMovimento = escreverMovimento('Alterado');
export const deleteMovimento = escreverMovimento('Eliminado');
