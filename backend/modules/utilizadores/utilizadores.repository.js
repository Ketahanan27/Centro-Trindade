import db from '../../config/db.js';

export const utilizadoresRepository = {
  listar: () => db.query(`SELECT id, nome, email, perfil, estado, convite_pendente,
              TO_CHAR(ultimo_acesso, 'DD/MM/YYYY HH24:MI') AS ultimo_acesso,
              TO_CHAR(created_at, 'DD/MM/YYYY') AS criado
       FROM utilizadores ORDER BY id DESC`),
  listarLegado: () => db.query(`SELECT id, nome, email, perfil, estado,
                  NULL AS ultimo_acesso,
                  TO_CHAR(created_at, 'DD/MM/YYYY') AS criado
           FROM utilizadores ORDER BY id DESC`),
  atualizar: (id, dados) => db.query(
    'UPDATE utilizadores SET nome = $1, perfil = $2, estado = $3, session_version = session_version + 1 WHERE id = $4',
    [dados.nome, dados.perfil, dados.estado, id],
  ),
  eliminar: id => db.query('DELETE FROM utilizadores WHERE id = $1', [id]),
};
