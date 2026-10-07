import db from '../../config/db.js';

export const documentosRepository = {
  listar: () => db.query('SELECT * FROM documentos ORDER BY id DESC'),
  criar: dados => db.query(
    `INSERT INTO documentos (tipo, nome_completo, bi, data_emissao, dados_json)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [dados.tipo, dados.nome_completo, dados.bi, dados.data_emissao, JSON.stringify(dados.dados_json)],
  ),
  eliminar: id => db.query('DELETE FROM documentos WHERE id = $1', [id]),
};
