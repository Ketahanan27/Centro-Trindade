import db from '../../config/db.js';
import { comTransacao } from '../../utils/transacao.js';

export const authRepository = {
  procurarConta: email => db.query('SELECT * FROM utilizadores WHERE lower(trim(email)) = $1', [email]),
  registarAcesso: id => db.query('UPDATE utilizadores SET ultimo_acesso = NOW() WHERE id = $1', [id]),
  comTransacao: executar => comTransacao(client => executar({
    consumirToken: tokenHash => client.query(
      `UPDATE password_resets SET usado = 1
       WHERE token = $1 AND usado = 0 AND expiry > NOW()
       RETURNING id, utilizador_id`, [tokenHash],
    ),
    atualizarPassword: (hash, id) => client.query(
      "UPDATE utilizadores SET password = $1, convite_pendente = false, session_version = session_version + 1 WHERE id = $2 AND estado = 'Ativo'", [hash, id],
    ),
    invalidarTokens: id => client.query('UPDATE password_resets SET usado = 1 WHERE utilizador_id = $1', [id]),
  })),
};
