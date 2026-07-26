import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import Card from "../../components/dashboard/card";
import { apiFetch } from "../../utils/api";
import "../../assets/styles/dashboard/dashboard.css";

const MESES = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/*
|--------------------------------------------------------------------------
| Gráfico de barras de receitas/despesas
|--------------------------------------------------------------------------
|
| Desenha um SVG à mão (sem biblioteca de gráficos) com uma barra de
| receitas e uma de despesas por mês. Os valores em falta em "dados" são
| preenchidos com zero para garantir sempre as 12 colunas do ano, e a
| escala vertical é calculada a partir do maior valor encontrado.
|
*/
function GraficoBarras({ dados }) {
  if (!dados || dados.length === 0) {
    return (
      <div className="chart-placeholder">
        Sem movimentos registados este ano.
      </div>
    );
  }

  const completo = Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    const found = dados.find((d) => Number(d.mes) === mes);
    return {
      mes,
      receitas: Number(found?.receitas ?? 0),
      despesas: Number(found?.despesas ?? 0),
    };
  });

  const W = 700;
  const H = 280;
  const PAD = { top: 24, right: 20, bottom: 50, left: 64 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(
    1,
    ...completo.map((d) => Math.max(d.receitas, d.despesas))
  );

  const colW = chartW / 12;
  const barW = Math.min(colW * 0.32, 22);
  const gap = 3;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  const yPos = (val) => PAD.top + chartH * (1 - val / maxVal);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-label="Gráfico de receitas e despesas mensais"
    >
      {ticks.map((f) => {
        const y = PAD.top + chartH * (1 - f);
        return (
          <g key={f}>
            <line
              x1={PAD.left} y1={y}
              x2={W - PAD.right} y2={y}
              stroke="#2a2a2a" strokeWidth="1"
            />
            <text
              x={PAD.left - 8} y={y + 4}
              textAnchor="end" fill="#777" fontSize="11"
            >
              {(maxVal * f).toFixed(0)}€
            </text>
          </g>
        );
      })}

      {completo.map(({ mes, receitas, despesas }) => {
        const cx = PAD.left + (mes - 0.5) * colW;
        const recH = (receitas / maxVal) * chartH;
        const desH = (despesas / maxVal) * chartH;

        return (
          <g key={mes}>
            <rect
              x={cx - barW - gap / 2}
              y={yPos(receitas)}
              width={barW}
              height={recH}
              fill="#0044ff"
              rx="3"
              opacity={receitas === 0 ? 0.15 : 1}
            />
            {receitas > 0 && recH > 18 && (
              <text
                x={cx - barW / 2 - gap / 2}
                y={yPos(receitas) - 4}
                textAnchor="middle"
                fill="#5577ff"
                fontSize="9"
              >
                {receitas.toFixed(0)}
              </text>
            )}

            <rect
              x={cx + gap / 2}
              y={yPos(despesas)}
              width={barW}
              height={desH}
              fill="#ff3333"
              rx="3"
              opacity={despesas === 0 ? 0.15 : 1}
            />
            {despesas > 0 && desH > 18 && (
              <text
                x={cx + barW / 2 + gap / 2}
                y={yPos(despesas) - 4}
                textAnchor="middle"
                fill="#ff6666"
                fontSize="9"
              >
                {despesas.toFixed(0)}
              </text>
            )}

            <text
              x={cx}
              y={H - PAD.bottom + 16}
              textAnchor="middle"
              fill="#888"
              fontSize="11"
            >
              {MESES[mes]}
            </text>
          </g>
        );
      })}

      <rect x={PAD.left} y={H - 16} width="10" height="10" fill="#0044ff" rx="2" />
      <text x={PAD.left + 14} y={H - 7} fill="#aaa" fontSize="11">Receitas</text>
      <rect x={PAD.left + 84} y={H - 16} width="10" height="10" fill="#ff3333" rx="2" />
      <text x={PAD.left + 98} y={H - 7} fill="#aaa" fontSize="11">Despesas</text>
    </svg>
  );
}

function Dashboard() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await apiFetch("/api/dashboard/stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setDados(json);
    } catch (err) {
      console.error("[dashboard]", err);
      setErro("Não foi possível carregar os dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dash-loading">
          <i className="ri-loader-4-line dash-spinner"></i>
          <p>A carregar dados...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (erro) {
    return (
      <DashboardLayout>
        <div className="dash-erro">
          <i className="ri-error-warning-line"></i>
          <p>{erro}</p>
          <button onClick={carregarDados}>Tentar novamente</button>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, proximosEventos, ultimosMembros, ultimosMovimentos, graficoAnual, podeVerFinancas } = dados;

  return (
    <DashboardLayout>

      <section className="cards">
        <Card
          icon="ri-team-line"
          title="Membros Ativos"
          value={stats.membros}
        />
        <Card
          icon="ri-calendar-event-line"
          title="Próximos Eventos"
          value={stats.eventos}
        />
        {podeVerFinancas && (
          <Card
            icon="ri-money-euro-circle-line"
            title="Receitas do Mês"
            value={`${Number(stats.receitas).toFixed(2)} €`}
          />
        )}
        <Card
          icon="ri-user-settings-line"
          title="Utilizadores"
          value={stats.utilizadores}
        />
      </section>

      <section className="dashboard-grid">

        <div className="panel">
          <h2>
            <i className="ri-calendar-event-line"></i> Próximos Eventos
          </h2>

          {proximosEventos.length === 0 ? (
            <p className="dash-vazio">Sem eventos agendados.</p>
          ) : (
            proximosEventos.map((ev) => (
              <div key={ev.id} className="event-item">
                <span>{ev.titulo}</span>
                <strong>{ev.data}</strong>
              </div>
            ))
          )}
        </div>

        <div className="panel">
          <h2>
            <i className="ri-user-add-line"></i> Últimos Membros
          </h2>

          {ultimosMembros.length === 0 ? (
            <p className="dash-vazio">Sem membros registados.</p>
          ) : (
            ultimosMembros.map((m) => (
              <div key={m.id} className="event-item">
                <span>{m.nome}</span>
                <span className={m.estado === "Ativo" ? "dash-badge-ativo" : "dash-badge-inativo"}>
                  {m.estado}
                </span>
              </div>
            ))
          )}
        </div>

      </section>

      {podeVerFinancas && (
        <>
          <section className="panel">
            <div className="dash-panel-header">
              <h2><i className="ri-bar-chart-2-line"></i> Relatórios Financeiros</h2>
              <span className="dash-ano">{new Date().getFullYear()}</span>
            </div>

            <GraficoBarras dados={graficoAnual} />
          </section>

          <section className="panel">
            <h2><i className="ri-exchange-dollar-line"></i> Últimos Movimentos</h2>

            {ultimosMovimentos.length === 0 ? (
              <p className="dash-vazio">Sem movimentos registados.</p>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Natureza</th>
                    <th>Valor</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosMovimentos.map((mov) => (
                    <tr key={mov.id}>
                      <td>{mov.tipo}</td>
                      <td>
                        <span className={
                          mov.natureza === "Receita"
                            ? "dash-badge-ativo"
                            : "dash-badge-inativo"
                        }>
                          {mov.natureza}
                        </span>
                      </td>
                      <td className="dash-valor">
                        {Number(mov.valor).toFixed(2)} €
                      </td>
                      <td>{mov.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}

    </DashboardLayout>
  );
}

export default Dashboard;
