import { secretariaCrud } from '../utils/secretariaCrud.js';
import { validarVisitante } from '../utils/secretariaValidation.js';
import db from "../config/db.js";

export const getVisitantes = (req, res) => {
  db.query("SELECT * FROM visitantes ORDER BY data_visita DESC", (err, result) => {
    if (err) {
      console.error("[getVisitantes]", err);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
    res.json(result);
  });
};

const crud = secretariaCrud({ tabela: 'visitantes', campos: ['nome','telefone','email','data_visita','convidado_por','observacoes','estado'], validar: validarVisitante, singular: 'Visitante', genero: 'o' });
export const createVisitante = crud.criar;
export const updateVisitante = crud.atualizar;
export const deleteVisitante = crud.eliminar;
