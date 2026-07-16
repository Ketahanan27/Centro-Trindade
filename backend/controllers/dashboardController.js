import db from "../config/db.js";

const q = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

export const getDashboardStats = async (req, res) => {
  try {
    const [
      [totalMembros   = { total: 0 }],
      [totalEventos   = { total: 0 }],
      [totalReceitas  = { total: 0 }],
      [totalUtilizadores = { total: 0 }],
      proximosEventos,
      ultimosMembros,
      ultimosMovimentos,
      graficoAnual,
    ] = await Promise.all([

      q("SELECT COUNT(*) AS total FROM membros WHERE estado = 'Ativo'"),

      q(`SELECT COUNT(*) AS total
         FROM eventos
         WHERE data_evento >= CURDATE() AND estado = 'Agendado'`),

      q(`SELECT COALESCE(SUM(valor), 0) AS total
         FROM tesouraria
         WHERE natureza = 'Receita'
           AND MONTH(data) = MONTH(CURDATE())
           AND YEAR(data)  = YEAR(CURDATE())`),

      q("SELECT COUNT(*) AS total FROM utilizadores WHERE estado = 'Ativo'"),

      q(`SELECT
           titulo,
           DATE_FORMAT(data_evento, '%d/%m/%Y') AS data,
           hora_evento,
           local_evento
         FROM eventos
         WHERE data_evento >= CURDATE() AND estado = 'Agendado'
         ORDER BY data_evento ASC
         LIMIT 5`),

      q(`SELECT
           nome,
           estado,
           DATE_FORMAT(entrada, '%d/%m/%Y') AS entrada
         FROM membros
         ORDER BY id DESC
         LIMIT 5`),

      q(`SELECT
           tipo,
           natureza,
           CAST(valor AS DECIMAL(10,2)) AS valor,
           DATE_FORMAT(data, '%d/%m/%Y') AS data
         FROM tesouraria
         ORDER BY id DESC
         LIMIT 6`),

      q(`SELECT
           MONTH(data)  AS mes,
           ROUND(SUM(CASE WHEN natureza = 'Receita' THEN valor ELSE 0 END), 2) AS receitas,
           ROUND(SUM(CASE WHEN natureza = 'Despesa' THEN valor ELSE 0 END), 2) AS despesas
         FROM tesouraria
         WHERE YEAR(data) = YEAR(CURDATE())
         GROUP BY MONTH(data)
         ORDER BY MONTH(data)`),
    ]);

    res.json({
      stats: {
        membros:      totalMembros.total,
        eventos:      totalEventos.total,
        receitas:     Number(totalReceitas.total).toFixed(2),
        utilizadores: totalUtilizadores.total,
      },
      proximosEventos,
      ultimosMembros,
      ultimosMovimentos,
      graficoAnual,
    });

  } catch (err) {
    console.error("[getDashboardStats]", err);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
