import { secretariaCrud } from '../utils/secretariaCrud.js';
import { validarApresentacao } from '../utils/secretariaValidation.js';
import db from "../config/db.js";

export const getApresentacoes = (req, res) => {
  db.query("SELECT * FROM apresentacoes ORDER BY data_apresentacao DESC", (err, result) => {
    if (err) {
      console.error("[getApresentacoes]", err);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
    res.json(result);
  });
};

const crud = secretariaCrud({ tabela: 'apresentacoes', campos: ['data_apresentacao','quantidade','observacoes'], validar: validarApresentacao, singular: 'Apresentação', genero: 'a' });
export const createApresentacao = crud.criar;
export const updateApresentacao = crud.atualizar;
export const deleteApresentacao = crud.eliminar;
