import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { emailNormalizado, objeto, InputError } from '../../utils/inputValidation.js';
import { hashToken, erroConta } from '../convites/convites.model.js';
import { authRepository } from './auth.repository.js';

export function criarAuthService(repositorio = authRepository) {
  return {
    async autenticar(payload) {
      const body = objeto(payload);
      const email = emailNormalizado(body.email, true);
      const password = body.password;
      if (typeof password !== 'string' || !password || password.length > 1024) throw new InputError('Preencha todos os campos.');
      const contas = await repositorio.procurarConta(email);
      const conta = contas[0];
      if (contas.length !== 1 || conta.estado !== 'Ativo' || conta.convite_pendente
        || !await bcrypt.compare(password, conta.password)) {
        throw erroConta(401, 'Credenciais inválidas.');
      }
      repositorio.registarAcesso(conta.id).catch(error => console.warn('[login] ultimo_acesso:', error.code ?? 'erro'));
      const token = jwt.sign(
        { id: conta.id, perfil: conta.perfil, session_version: conta.session_version },
        process.env.JWT_SECRET, { expiresIn: '1d', algorithm: 'HS256' },
      );
      return { token, user: { id: conta.id, nome: conta.nome, email: conta.email, perfil: conta.perfil } };
    },
    async redefinir(payload) {
      const { token, nova_password } = payload ?? {};
      if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) || typeof nova_password !== 'string' || !nova_password) {
        throw new InputError('Token e nova palavra-passe são obrigatórios.');
      }
      if (nova_password.length < 8 || Buffer.byteLength(nova_password, 'utf8') > 72) {
        throw new InputError('A palavra-passe deve ter pelo menos 8 caracteres e ocupar no máximo 72 bytes.');
      }
      const hash = await bcrypt.hash(nova_password, 10);
      await repositorio.comTransacao(async transacao => {
        const resultado = await transacao.consumirToken(hashToken(token));
        if (resultado.rowCount !== 1) throw new InputError('Link inválido, expirado ou já utilizado.');
        const id = resultado.rows[0].utilizador_id;
        if ((await transacao.atualizarPassword(hash, id)).rowCount !== 1) throw new Error('Conta não encontrada.');
        await transacao.invalidarTokens(id);
      });
    },
  };
}

export const authService = criarAuthService();
