import { authService } from './auth.service.js';
import { emitirLinkConta } from '../convites/convites.controller.js';

export function register(_req, res) {
  return res.status(403).json({ message: 'As contas são criadas por convite do administrador. Contacte a igreja.' });
}

export async function login(req, res) {
  try { res.json(await authService.autenticar(req.body)); }
  catch (error) {
    if ([400, 401].includes(error.status)) return res.status(error.status).json({ message: error.message });
    console.error('[login]', error.code ?? 'erro');
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

export const recuperarPassword = emitirLinkConta('recuperar');

export async function redefinirPassword(req, res) {
  try {
    await authService.redefinir(req.body);
    res.json({ message: 'Palavra-passe atualizada com sucesso!' });
  } catch (error) {
    if (error.status === 400) return res.status(400).json({ message: error.message });
    console.error('[redefinirPassword]', error.code ?? 'erro');
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}
