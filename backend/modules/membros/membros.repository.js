import db from '../../config/db.js';

export const membrosRepository = {
  associacaoAtual: (params = []) => db.query("SELECT utilizador_id FROM membros WHERE id = $1", params),

  contaAtiva: (params = []) => db.query("SELECT id FROM utilizadores WHERE id = $1 AND estado = 'Ativo'", params),

  membroAssociado: (params = []) => db.query("SELECT id FROM membros WHERE utilizador_id = $1 AND ($2::integer IS NULL OR id <> $2)", params),

  criar: (params = []) => db.query(`INSERT INTO membros
         (nome, email, telemovel, nascimento, sexo, estado_civil,
          morada, codigo_postal, entrada, batizado, estado, utilizador_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`, params),

  listar: (params = []) => db.query(`
      SELECT
        id,
        nome,
        email,
        telemovel,
        TO_CHAR(nascimento, 'YYYY-MM-DD') AS nascimento,
        sexo,
        estado_civil,
        morada,
        codigo_postal,
        TO_CHAR(entrada, 'YYYY-MM-DD')    AS entrada,
        batizado,
        estado,
        foto,
        utilizador_id,
        criado_em AS created_at
      FROM membros
      ORDER BY id DESC
    `, params),

  atualizar: (params = []) => db.query(`UPDATE membros
       SET nome=$1, email=$2, telemovel=$3, nascimento=$4, sexo=$5,
           estado_civil=$6, morada=$7, codigo_postal=$8,
           entrada=$9, batizado=$10, estado=$11,
           utilizador_id=CASE WHEN $14::boolean THEN $12::integer ELSE utilizador_id END
       WHERE id=$13`, params),

  atualizarPerfil: (params = []) => db.query(`UPDATE membros AS m
       SET telemovel = $1,
           sexo = $2,
           estado_civil = $3,
           morada = $4,
           codigo_postal = $5
       FROM utilizadores AS u
       WHERE u.id = m.utilizador_id AND u.id = $6`, params),

  eliminar: (params = []) => db.query("DELETE FROM membros WHERE id=$1 RETURNING foto", params),

  obterPerfil: (params = []) => db.query(`SELECT
         m.id, m.nome, m.email, m.telemovel,
         TO_CHAR(m.nascimento, 'YYYY-MM-DD') AS nascimento,
         m.sexo, m.estado_civil, m.morada, m.codigo_postal,
         TO_CHAR(m.entrada, 'YYYY-MM-DD')    AS entrada,
         m.batizado, m.estado, m.foto
       FROM membros m
       INNER JOIN utilizadores u ON u.id = m.utilizador_id
       WHERE u.id = $1
       LIMIT 1`, params),

  membrosDaConta: (params = []) => db.query("SELECT id FROM membros WHERE utilizador_id = $1", params),

  atualizarFoto: (params = []) => db.query(`WITH anterior AS (SELECT foto FROM membros WHERE id = $2 AND utilizador_id = $3 FOR UPDATE)
       UPDATE membros AS m
       SET foto = $1
       FROM anterior
       WHERE m.id = $2 AND m.utilizador_id = $3
       RETURNING anterior.foto AS foto_anterior`, params),

  fotoAutorizada: (params) => db.query('SELECT foto FROM membros WHERE id = $1 AND ($2::boolean OR utilizador_id = $3)', params)
};
