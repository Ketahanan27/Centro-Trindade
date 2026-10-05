import { secretariaCrud } from '../utils/secretariaCrud.js';
import { validarAta } from '../utils/secretariaValidation.js';
import db from "../config/db.js";

export const getAtas = (req, res) => {
  db.query(
    `SELECT
       id,
       titulo,
       TO_CHAR(data, 'YYYY-MM-DD') AS data,
       TO_CHAR(DATE '2000-01-01' + hora, 'HH24:MI')    AS hora,
       local,
       participantes,
       resumo,
       decisoes,
       observacoes,
       created_at
     FROM atas
     ORDER BY data ASC, hora ASC`,
    (err, result) => {
      if (err) {
        console.error("[getAtas]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.json(result);
    }
  );
};

const crud = secretariaCrud({ tabela: 'atas', campos: ['titulo','data','hora','local','participantes','resumo','decisoes','observacoes'], validar: validarAta, singular: 'Reunião', genero: 'a' });
export const createAta = crud.criar;
export const updateAta = crud.atualizar;
export const deleteAta = crud.eliminar;
