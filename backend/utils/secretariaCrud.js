import db from '../config/db.js';
import { validarId } from './inputValidation.js';

// Tables and columns come exclusively from fixed controller definitions.
export function secretariaCrud({ tabela, campos, validar, singular, genero = 'o' }) {
  const executar = (acao) => async (req, res) => {
    try {
      const id = acao === 'criar' ? null : validarId(req.params.id);
      const dados = acao === 'eliminar' ? null : validar(req.body);
      let sql;
      let params;
      if (acao === 'criar') {
        sql = `INSERT INTO ${tabela} (${campos.join(', ')}) VALUES (${campos.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`;
        params = campos.map((campo) => dados[campo]);
      } else if (acao === 'atualizar') {
        sql = `UPDATE ${tabela} SET ${campos.map((campo, i) => `${campo}=$${i + 1}`).join(', ')} WHERE id=$${campos.length + 1}`;
        params = [...campos.map((campo) => dados[campo]), id];
      } else { sql = `DELETE FROM ${tabela} WHERE id=$1`; params = [id]; }
      const result = await db.query(sql, params);
      if (acao !== 'criar' && result.rowCount === 0) return res.status(404).json({ message: `${singular} não encontrad${genero}.` });
      const verbo = acao === 'criar' ? 'registad' : acao === 'atualizar' ? 'atualizad' : 'eliminad';
      return res.status(acao === 'criar' ? 201 : 200).json({ message: `${singular} ${verbo}${genero} com sucesso.`, ...(acao === 'criar' ? { id: result.rows[0].id } : {}) });
    } catch (error) {
      if (error.status === 400) return res.status(400).json({ message: error.message });
      if (error.code === '23503') return res.status(409).json({ message: 'Existem registos associados que impedem esta operação.' });
      if (error.code === '23505') return res.status(409).json({ message: 'Já existe um registo com estes dados.' });
      console.error(`[${tabela}:${acao}]`, error.code ?? 'erro');
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  };
  return { criar: executar('criar'), atualizar: executar('atualizar'), eliminar: executar('eliminar') };
}
