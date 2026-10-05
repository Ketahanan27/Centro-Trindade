import db from "../config/db.js";
import { escreverMovimento } from "./tesourariaEscrita.js";

export const getMovimentos = (req, res) => {
  const sql = `
    SELECT
      id,
      natureza,
      tipo,
      valor,
      TO_CHAR(data, 'YYYY-MM-DD') AS data,
      observacao,
      created_at
    FROM tesouraria
    ORDER BY data DESC, id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("[getMovimentos]", err);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
    res.json(result);
  });
};

export const getResumo = (req, res) => {
  const sql = `
    SELECT
      natureza,
      SUM(valor)  AS total,
      COUNT(*)    AS quantidade
    FROM tesouraria
    WHERE EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM data)  = EXTRACT(YEAR FROM CURRENT_DATE)
    GROUP BY natureza
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("[getResumo]", err);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }

    const resumo = { receitas: 0, despesas: 0, saldo: 0 };
    rows.forEach((row) => {
      if (row.natureza === "Receita") resumo.receitas = Number(row.total);
      if (row.natureza === "Despesa") resumo.despesas = Number(row.total);
    });
    resumo.saldo = resumo.receitas - resumo.despesas;

    res.json(resumo);
  });
};

export const createMovimento = escreverMovimento('Criado');
export const updateMovimento = escreverMovimento('Alterado');
export const deleteMovimento = escreverMovimento('Eliminado');
