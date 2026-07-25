import db from "../config/db.js";

const q = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

const PERFIS_FINANCAS = ["Administrador", "Tesouraria", "Pastor"];
// Mini-lista de últimos membros: mesmo critério de acesso usado nos módulos
// de membros/relatórios — evita expor nomes e estado de membros ao perfil
// "Tesouraria" (que só deveria ver dados financeiros) ou a um "Membro".
const PERFIS_MEMBROS  = ["Administrador", "Secretaria", "Pastor"];

export const getDashboardStats = async (req, res) => {
  try {
    const podeVerFinancas = PERFIS_FINANCAS.includes(req.user?.perfil);
    const podeVerMembros  = PERFIS_MEMBROS.includes(req.user?.perfil);

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

      // As queries financeiras só correm quando o perfil tem permissão —
      // antes corriam sempre e só a resposta escondia o resultado, o que
      // desperdiçava trabalho na BD para nada.
      podeVerFinancas
        ? q(`SELECT COALESCE(SUM(valor), 0) AS total
             FROM tesouraria
             WHERE natureza = 'Receita'
               AND MONTH(data) = MONTH(CURDATE())
               AND YEAR(data)  = YEAR(CURDATE())`)
        : Promise.resolve([{ total: 0 }]),

      q("SELECT COUNT(*) AS total FROM utilizadores WHERE estado = 'Ativo'"),

      q(`SELECT
           id,
           titulo,
           DATE_FORMAT(data_evento, '%d/%m/%Y') AS data,
           hora_evento,
           local_evento
         FROM eventos
         WHERE data_evento >= CURDATE() AND estado = 'Agendado'
         ORDER BY data_evento ASC
         LIMIT 5`),

      podeVerMembros
        ? q(`SELECT
               id,
               nome,
               estado,
               DATE_FORMAT(entrada, '%d/%m/%Y') AS entrada
             FROM membros
             ORDER BY id DESC
             LIMIT 5`)
        : Promise.resolve([]),

      podeVerFinancas
        ? q(`SELECT
               id,
               tipo,
               natureza,
               CAST(valor AS DECIMAL(10,2)) AS valor,
               DATE_FORMAT(data, '%d/%m/%Y') AS data
             FROM tesouraria
             ORDER BY id DESC
             LIMIT 6`)
        : Promise.resolve([]),

      podeVerFinancas
        ? q(`SELECT
               MONTH(data)  AS mes,
               ROUND(SUM(CASE WHEN natureza = 'Receita' THEN valor ELSE 0 END), 2) AS receitas,
               ROUND(SUM(CASE WHEN natureza = 'Despesa' THEN valor ELSE 0 END), 2) AS despesas
             FROM tesouraria
             WHERE YEAR(data) = YEAR(CURDATE())
             GROUP BY MONTH(data)
             ORDER BY MONTH(data)`)
        : Promise.resolve([]),
    ]);

    res.json({
      stats: {
        membros:      totalMembros.total,
        eventos:      totalEventos.total,
        receitas:     podeVerFinancas ? Number(totalReceitas.total).toFixed(2) : null,
        utilizadores: totalUtilizadores.total,
      },
      proximosEventos,
      ultimosMembros,
      ultimosMovimentos,
      graficoAnual,
      podeVerFinancas,
    });

  } catch (err) {
    console.error("[getDashboardStats]", err);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};