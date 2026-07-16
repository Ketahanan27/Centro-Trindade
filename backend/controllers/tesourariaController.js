import db from "../config/db.js";

const TIPOS = {
  Receita: ["Dízimo", "Oferta", "Voto", "Contribuição", "Doação", "Ação Social", "T-Shirts", "Outros"],
  Despesa: ["Água", "Luz", "Internet", "Manutenção", "Compras", "Caixa", "Outros"],
};

const tiposParaNatureza = (natureza) => TIPOS[natureza] ?? [];

export const getMovimentos = (req, res) => {
  const sql = `
    SELECT
      id,
      natureza,
      tipo,
      valor,
      DATE_FORMAT(data, '%Y-%m-%d') AS data,
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
    WHERE MONTH(data) = MONTH(CURDATE())
      AND YEAR(data)  = YEAR(CURDATE())
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

export const createMovimento = (req, res) => {
  const { natureza, tipo, valor, data, observacao } = req.body;

  if (!natureza || !["Receita", "Despesa"].includes(natureza)) {
    return res.status(400).json({ message: "Natureza inválida. Use 'Receita' ou 'Despesa'." });
  }

  if (!tipo || !tiposParaNatureza(natureza).includes(tipo)) {
    return res.status(400).json({ message: `Tipo inválido para natureza "${natureza}": ${tipo}.` });
  }

  if (!valor || Number(valor) <= 0) {
    return res.status(400).json({ message: "Valor deve ser superior a zero." });
  }

  if (!data) {
    return res.status(400).json({ message: "Data obrigatória." });
  }

  const dataObj = new Date(data);
  if (isNaN(dataObj.getTime())) {
    return res.status(400).json({ message: "Data inválida." });
  }

  db.query(
    `INSERT INTO tesouraria (natureza, tipo, valor, data, observacao)
     VALUES (?, ?, ?, ?, ?)`,
    [natureza, tipo, Number(valor), data, observacao?.trim() || null],
    (err, result) => {
      if (err) {
        console.error("[createMovimento]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.status(201).json({
        message: "Movimento registado com sucesso.",
        id: result.insertId,
      });
    }
  );
};

export const updateMovimento = (req, res) => {
  const { id } = req.params;
  const { natureza, tipo, valor, data, observacao } = req.body;

  if (!natureza || !["Receita", "Despesa"].includes(natureza)) {
    return res.status(400).json({ message: "Natureza inválida." });
  }

  if (!tipo || !tiposParaNatureza(natureza).includes(tipo)) {
    return res.status(400).json({ message: `Tipo inválido para natureza "${natureza}": ${tipo}.` });
  }

  if (!valor || Number(valor) <= 0) {
    return res.status(400).json({ message: "Valor deve ser superior a zero." });
  }

  if (!data) {
    return res.status(400).json({ message: "Data obrigatória." });
  }

  db.query(
    `UPDATE tesouraria
     SET natureza = ?, tipo = ?, valor = ?, data = ?, observacao = ?
     WHERE id = ?`,
    [natureza, tipo, Number(valor), data, observacao?.trim() || null, id],
    (err, result) => {
      if (err) {
        console.error("[updateMovimento]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Movimento não encontrado." });
      }

      res.json({ message: "Movimento atualizado com sucesso." });
    }
  );
};

export const deleteMovimento = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM tesouraria WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("[deleteMovimento]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Movimento não encontrado." });
      }

      res.json({ message: "Movimento eliminado com sucesso." });
    }
  );
};
