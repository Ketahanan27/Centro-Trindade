import db from "../config/db.js";
import { escreverMovimento } from "./tesourariaEscrita.js";

export const getMovimentos = (req, res) => {
  const sql = `
    SELECT
      t.id,
      t.natureza,
      t.tipo,
      t.valor,
      TO_CHAR(t.data, 'YYYY-MM-DD') AS data,
      t.observacao,
      t.created_at,
      COALESCE(registo.autor_nome, u.nome) AS autor_registo,
      ultima.autor_nome AS autor_ultima_operacao,
      ultima.acao AS ultima_operacao
    FROM tesouraria t
    LEFT JOIN utilizadores u ON u.id = t.criado_por
    LEFT JOIN LATERAL (
      SELECT autor_nome FROM tesouraria_historico
      WHERE movimento_id = t.id AND acao = 'Criado' ORDER BY id ASC LIMIT 1
    ) registo ON true
    LEFT JOIN LATERAL (
      SELECT autor_nome, acao FROM tesouraria_historico
      WHERE movimento_id = t.id ORDER BY id DESC LIMIT 1
    ) ultima ON true
    ORDER BY t.data DESC, t.id DESC
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
