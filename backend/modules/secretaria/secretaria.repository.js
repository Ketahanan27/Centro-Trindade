import db from '../../config/db.js';
import { obterAreaSecretaria } from './secretaria.model.js';

export function criarSecretariaRepository(area) {
  const { tabela, campos, consulta } = obterAreaSecretaria(area);
  const inserir = `INSERT INTO ${tabela} (${campos.join(', ')}) VALUES (${campos.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`;
  const atualizar = `UPDATE ${tabela} SET ${campos.map((campo, i) => `${campo}=$${i + 1}`).join(', ')} WHERE id=$${campos.length + 1}`;
  return {
    listar: () => db.query(consulta),
    criar: dados => db.query(inserir, campos.map(campo => dados[campo])),
    atualizar: (id, dados) => db.query(atualizar, [...campos.map(campo => dados[campo]), id]),
    eliminar: id => db.query(`DELETE FROM ${tabela} WHERE id=$1`, [id]),
  };
}
