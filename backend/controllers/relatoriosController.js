import db from "../config/db.js";

const q = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

const PERFIS_FINANCAS = ["Administrador", "Tesouraria", "Pastor"];

export const getRelatorios = async (req, res) => {
  const ano = Number(req.query.ano) || new Date().getFullYear();
  const podeVerFinancas = PERFIS_FINANCAS.includes(req.user?.perfil);

  try {
    const [
      membrosEstado,
      visitantesEstado,
      financeiroMensal,
      eventosMes,
      apresentacoesMes,
      [geral],
    ] = await Promise.all([


      q(`SELECT estado, COUNT(*) AS total
         FROM membros
         GROUP BY estado
         ORDER BY total DESC`),

      q(`SELECT estado, COUNT(*) AS total
         FROM visitantes
         GROUP BY estado
         ORDER BY total DESC`),


      podeVerFinancas
        ? q(`SELECT
               MONTH(data)  AS mes,
               ROUND(SUM(CASE WHEN natureza = 'Receita' THEN valor ELSE 0 END), 2) AS receitas,
               ROUND(SUM(CASE WHEN natureza = 'Despesa' THEN valor ELSE 0 END), 2) AS despesas
             FROM tesouraria
             WHERE YEAR(data) = ?
             GROUP BY MONTH(data)
             ORDER BY mes`, [ano])
        : Promise.resolve([]),

      q(`SELECT
           MONTH(data_evento) AS mes,
           COUNT(*)           AS total
         FROM eventos
         WHERE YEAR(data_evento) = ?
         GROUP BY MONTH(data_evento)
         ORDER BY mes`, [ano]),

      q(`SELECT
           MONTH(data_apresentacao) AS mes,
           SUM(quantidade)          AS criancas,
           COUNT(*)                 AS sessoes
         FROM apresentacoes
         WHERE YEAR(data_apresentacao) = ?
         GROUP BY MONTH(data_apresentacao)
         ORDER BY mes`, [ano]),

      q(`SELECT
           (SELECT COUNT(*)               FROM membros      WHERE estado = 'Ativo')              AS membros_ativos,
           (SELECT COUNT(*)               FROM membros)                                           AS membros_total,
           (SELECT COUNT(*)               FROM visitantes)                                        AS visitantes_total,
           (SELECT COUNT(*)               FROM visitantes   WHERE estado = 'Convertido')          AS convertidos,
           (SELECT COUNT(*)               FROM apresentacoes WHERE YEAR(data_apresentacao) = ?)   AS apresentacoes_ano,
           (SELECT COALESCE(SUM(quantidade),0) FROM apresentacoes WHERE YEAR(data_apresentacao) = ?) AS criancas_ano,
           (SELECT COUNT(*)               FROM eventos WHERE data_evento >= CURDATE() AND estado = 'Agendado') AS proximos_eventos,
           (SELECT ROUND(COALESCE(SUM(valor),0),2) FROM tesouraria WHERE natureza = 'Receita' AND YEAR(data) = ?) AS receitas_ano,
           (SELECT ROUND(COALESCE(SUM(valor),0),2) FROM tesouraria WHERE natureza = 'Despesa' AND YEAR(data) = ?) AS despesas_ano`,
        [ano, ano, ano, ano]),
    ]);

    // Sem permissão de finanças: não expor os totais financeiros agregados
    // (as queries financeiras acima já nem chegam a correr).
    const geralFinal = geral ?? {};
    if (!podeVerFinancas) {
      geralFinal.receitas_ano = null;
      geralFinal.despesas_ano = null;
    }

    res.json({
      ano,
      membrosEstado,
      visitantesEstado,
      financeiroMensal,
      eventosMes,
      apresentacoesMes,
      geral: geralFinal,
      podeVerFinancas,
    });

  } catch (err) {
    console.error("[getRelatorios]", err);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};