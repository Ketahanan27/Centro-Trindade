import { pool } from '../../config/db.js';
import { comTransacao } from '../../utils/transacao.js';

export const convitesRepository = {
  revogarLink: tokenHash => pool.query('UPDATE password_resets SET usado=1 WHERE token=$1', [tokenHash]),
  comTransacao: executar => comTransacao(client => executar({
    bloquearEmail: email => client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [email]),
    procurarEmail: email => client.query('SELECT id FROM utilizadores WHERE lower(trim(email))=$1', [email]),
    criarConta: (dados, password) => client.query(
      'INSERT INTO utilizadores (nome,email,password,perfil,estado,convite_pendente) VALUES ($1,$2,$3,$4,$5,true) RETURNING id,nome,email,estado',
      [dados.nome.trim(), dados.email, password, dados.perfil, dados.estado],
    ),
    procurarConta: (publico, identificador) => client.query(
      publico ? 'SELECT id,nome,email,estado,convite_pendente FROM utilizadores WHERE lower(trim(email))=$1 FOR UPDATE'
        : 'SELECT id,nome,email,estado,convite_pendente FROM utilizadores WHERE id=$1 FOR UPDATE',
      [identificador],
    ),
    invalidarLinks: id => client.query('UPDATE password_resets SET usado = 1 WHERE utilizador_id = $1 AND usado = 0', [id]),
    guardarToken: (id, tokenHash, expiry) => client.query('INSERT INTO password_resets (utilizador_id, token, expiry) VALUES ($1,$2,$3)', [id, tokenHash, expiry]),
  })),
};
