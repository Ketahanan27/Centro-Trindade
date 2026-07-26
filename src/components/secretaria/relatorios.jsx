import { useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import { apiFetch } from "../../utils/api";

const MESES_PT = [
  "", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];
const CORES = [
  "#0044ff", "#ff3333", "#00c853", "#ffc107",
  "#9c27b0", "#00bcd4", "#ff6b35", "#e91e63",
];

/*
|--------------------------------------------------------------------------
| Gráfico de rosca (donut) desenhado à mão
|--------------------------------------------------------------------------
|
| Constrói cada fatia como um path SVG em coordenadas polares, com um
| pequeno espaçamento (GAP) entre fatias para separá-las visualmente.
| O caso de uma única categoria com 100% dos dados é tratado à parte,
| porque um arco de 360º degenera na fórmula normal de start/end angle.
|
*/
function Donut({ dados, campoLabel = "estado" }) {
  const total = dados.reduce((s, d) => s + Number(d.total), 0);

  if (!total) {
    return <p style={{ color: "#666", padding: "20px 0" }}>Sem dados.</p>;
  }

  const CX = 80;
  const CY = 80;
  const OR = 65;
  const IR = 42;
  let angle = -Math.PI / 2;

  const arcs = dados.map((d, i) => {
    const pct = Number(d.total) / total;
    const sweep = pct * 2 * Math.PI;
    const GAP = dados.length > 1 ? 0.03 : 0;
    const a0 = angle + GAP / 2;
    const a1 = angle + sweep - GAP / 2;
    const large = sweep - GAP > Math.PI ? 1 : 0;

    const path = pct > 0.998
      ? `M${CX + OR} ${CY} A${OR} ${OR} 0 1 1 ${CX + OR - 0.01} ${CY}
         L${CX + IR - 0.01} ${CY} A${IR} ${IR} 0 1 0 ${CX + IR} ${CY} Z`
      : `M${CX + OR * Math.cos(a0)} ${CY + OR * Math.sin(a0)}
         A${OR} ${OR} 0 ${large} 1 ${CX + OR * Math.cos(a1)} ${CY + OR * Math.sin(a1)}
         L${CX + IR * Math.cos(a1)} ${CY + IR * Math.sin(a1)}
         A${IR} ${IR} 0 ${large} 0 ${CX + IR * Math.cos(a0)} ${CY + IR * Math.sin(a0)} Z`;

    angle += sweep;
    return {
      path,
      cor: CORES[i % CORES.length],
      label: d[campoLabel] || "—",
      total: Number(d.total),
      pct: (pct * 100).toFixed(1),
    };
  });

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 160 160" width="160" height="160" aria-hidden="true">
        {arcs.map((a, i) => <path key={i} d={a.path} fill={a.cor} />)}
        <text x={CX} y={CY - 7} textAnchor="middle" fill="white" fontSize="22" fontWeight="700">{total}</text>
        <text x={CX} y={CY + 13} textAnchor="middle" fill="#888" fontSize="11">Total</text>
      </svg>
      <div className="donut-legend">
        {arcs.map((a, i) => (
          <div key={i} className="legend-row">
            <span className="legend-dot" style={{ background: a.cor }} />
            <span className="legend-label">{a.label}</span>
            <span className="legend-val">
              {a.total}
              <span className="legend-pct"> ({a.pct}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Gráfico de barras mensal, agrupado por categoria
|--------------------------------------------------------------------------
|
| Recebe os dados brutos por mês e uma lista de "campos" (cada um com a
| sua chave, rótulo e cor) e desenha um grupo de barras lado a lado por
| mês. Os meses sem dados são preenchidos com zero para manter sempre
| as 12 colunas do ano.
|
*/
function BarrasMensal({ dadosBrutos, campos }) {
  const dados = Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    const found = dadosBrutos.find((d) => Number(d.mes) === mes) ?? {};
    const row = { mes };
    campos.forEach((c) => { row[c.chave] = Number(found[c.chave] ?? 0); });
    return row;
  });

  const W = 680;
  const H = 240;
  const PAD = { top: 20, right: 20, bottom: 44, left: 58 };
  const cW = (W - PAD.left - PAD.right) / 12;
  const cH = H - PAD.top - PAD.bottom;

  const allVals = dados.flatMap((d) => campos.map((c) => d[c.chave]));
  const maxVal = Math.max(1, ...allVals);

  const bW = Math.min(cW * 0.28, 18);
  const gap = 3;

  const yPos = (v) => PAD.top + cH * (1 - v / maxVal);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} aria-hidden="true">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = PAD.top + cH * (1 - f);
        return (
          <g key={f}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#2a2a2a" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fill="#777" fontSize="11">
              {(maxVal * f).toFixed(0)}
            </text>
          </g>
        );
      })}

      {dados.map((d) => {
        const cx = PAD.left + (d.mes - 0.5) * cW;
        const offset = -(campos.length - 1) * (bW + gap) / 2;

        return (
          <g key={d.mes}>
            {campos.map((c, ci) => {
              const h = (d[c.chave] / maxVal) * cH;
              const x = cx + offset + ci * (bW + gap);
              return (
                <g key={ci}>
                  <rect x={x} y={yPos(d[c.chave])} width={bW} height={h} fill={c.cor} rx="3" opacity={d[c.chave] === 0 ? 0.12 : 1} />
                  {h > 16 && (
                    <text x={x + bW / 2} y={yPos(d[c.chave]) - 3} textAnchor="middle" fill={c.cor} fontSize="9">
                      {d[c.chave].toFixed(0)}
                    </text>
                  )}
                </g>
              );
            })}
            <text x={cx} y={H - PAD.bottom + 15} textAnchor="middle" fill="#888" fontSize="11">
              {MESES_PT[d.mes]}
            </text>
          </g>
        );
      })}

      {campos.map((c, i) => (
        <g key={i}>
          <rect x={PAD.left + i * 90} y={H - 14} width="10" height="10" fill={c.cor} rx="2" />
          <text x={PAD.left + i * 90 + 14} y={H - 5} fill="#aaa" fontSize="11">{c.label}</text>
        </g>
      ))}
    </svg>
  );
}

function Relatorios() {
  const anoAtual = new Date().getFullYear();
  const [ano, setAno] = useState(anoAtual);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await apiFetch(`/api/relatorios?ano=${ano}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDados(await res.json());
    } catch (e) {
      console.error("[Relatorios]", e);
      setErro("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, [ano]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const exportarPDF = () => {
    if (!dados) return;
    const doc = new jsPDF();
    const g = dados.geral;
    const hoje = new Date().toLocaleDateString("pt-PT");

    doc.setFillColor(0, 68, 255);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Centro Trindade — Relatório Anual", 105, 12, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Ano: ${ano}  |  Gerado em: ${hoje}`, 105, 22, { align: "center" });

    doc.setTextColor(0, 0, 0);
    let y = 38;

    const secao = (titulo) => {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setFillColor(0, 68, 255);
      doc.rect(14, y, 182, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.text(titulo, 18, y + 5.5);
      doc.setTextColor(0, 0, 0);
      y += 12;
    };

    const linha = (k, v) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.text(`  ${k}:`, 18, y);
      doc.setFont("helvetica", "bold");
      doc.text(String(v), 90, y);
      doc.setFont("helvetica", "normal");
      y += 7;
    };

    secao("Resumo Geral");
    linha("Membros Ativos", g.membros_ativos ?? "—");
    linha("Total de Membros", g.membros_total ?? "—");
    linha("Total de Visitantes", g.visitantes_total ?? "—");
    linha("Convertidos", g.convertidos ?? "—");
    linha("Próximos Eventos", g.proximos_eventos ?? "—");
    linha(`Receitas (${ano})`, `${Number(g.receitas_ano ?? 0).toFixed(2)} €`);
    linha(`Despesas (${ano})`, `${Number(g.despesas_ano ?? 0).toFixed(2)} €`);
    linha("Saldo", `${(Number(g.receitas_ano ?? 0) - Number(g.despesas_ano ?? 0)).toFixed(2)} €`);
    y += 4;

    secao("Membros por Estado");
    dados.membrosEstado.forEach((m) => linha(m.estado, m.total));
    y += 4;

    secao("Visitantes por Estado");
    dados.visitantesEstado.forEach((v) => linha(v.estado, v.total));
    y += 4;

    secao(`Financeiro Mensal — ${ano}`);
    dados.financeiroMensal.forEach((f) => {
      linha(MESES_PT[f.mes], `Receitas: ${Number(f.receitas).toFixed(2)} €  |  Despesas: ${Number(f.despesas).toFixed(2)} €`);
    });
    if (!dados.financeiroMensal.length) linha("—", "Sem movimentos registados");
    y += 4;

    secao(`Eventos por Mês — ${ano}`);
    dados.eventosMes.forEach((e) => linha(MESES_PT[e.mes], `${e.total} evento(s)`));
    if (!dados.eventosMes.length) linha("—", "Sem eventos registados");

    doc.save(`relatorio-centro-trindade-${ano}.pdf`);
  };

  if (loading) {
    return (
      <div className="secretaria-container">
        <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
          <i className="ri-loader-4-line" style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}></i>
          A carregar relatórios...
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="secretaria-container">
        <div style={{ padding: "40px", textAlign: "center", color: "#ff5252" }}>
          <i className="ri-error-warning-line" style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}></i>
          {erro}
          <button onClick={carregar} className="rel-retry-btn">Tentar novamente</button>
        </div>
      </div>
    );
  }

  const g = dados.geral;
  const saldo = Number(g.receitas_ano ?? 0) - Number(g.despesas_ano ?? 0);

  return (
    <div className="secretaria-container rel-root">

      <div className="page-header">
        <h1>Relatórios</h1>
        <div className="header-actions">
          <select
            className="rel-ano-select"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
          >
            {[anoAtual, anoAtual - 1, anoAtual - 2, anoAtual - 3].map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <button onClick={exportarPDF}>
            <i className="ri-file-pdf-line"></i> Exportar PDF
          </button>
        </div>
      </div>

      <div className="rel-stats">
        <div className="rel-stat-card">
          <i className="ri-team-line"></i>
          <div>
            <p className="rel-stat-val">{g.membros_ativos ?? 0}</p>
            <p className="rel-stat-lbl">Membros Ativos</p>
          </div>
        </div>
        <div className="rel-stat-card">
          <i className="ri-user-received-line"></i>
          <div>
            <p className="rel-stat-val">{g.convertidos ?? 0}</p>
            <p className="rel-stat-lbl">Convertidos</p>
          </div>
        </div>
        <div className="rel-stat-card receita">
          <i className="ri-arrow-up-circle-line"></i>
          <div>
            <p className="rel-stat-val">{Number(g.receitas_ano ?? 0).toFixed(2)} €</p>
            <p className="rel-stat-lbl">Receitas {ano}</p>
          </div>
        </div>
        <div className={`rel-stat-card ${saldo >= 0 ? "positivo" : "negativo"}`}>
          <i className={`ri-${saldo >= 0 ? "arrow-up" : "arrow-down"}-circle-line`}></i>
          <div>
            <p className="rel-stat-val">{saldo.toFixed(2)} €</p>
            <p className="rel-stat-lbl">Saldo {ano}</p>
          </div>
        </div>
      </div>

      <div className="rel-row-2">
        <div className="rel-panel">
          <h2 className="rel-panel-title">
            <i className="ri-user-received-line"></i> Visitantes por Estado
          </h2>
          <Donut dados={dados.visitantesEstado} campoLabel="estado" />
        </div>
      </div>

      <div className="rel-panel">
        <h2 className="rel-panel-title">
          <i className="ri-bar-chart-2-line"></i> Financeiro Mensal — {ano}
        </h2>
        {dados.financeiroMensal.length === 0 ? (
          <p style={{ color: "#666" }}>Sem movimentos financeiros em {ano}.</p>
        ) : (
          <BarrasMensal
            dadosBrutos={dados.financeiroMensal}
            campos={[
              { chave: "receitas", label: "Receitas", cor: "#0044ff" },
              { chave: "despesas", label: "Despesas", cor: "#ff3333" },
            ]}
          />
        )}
      </div>

      <div className="rel-row-2">
        <div className="rel-panel">
          <h2 className="rel-panel-title">
            <i className="ri-calendar-event-line"></i> Eventos por Mês — {ano}
          </h2>
          {dados.eventosMes.length === 0 ? (
            <p style={{ color: "#666" }}>Sem eventos em {ano}.</p>
          ) : (
            <BarrasMensal
              dadosBrutos={dados.eventosMes}
              campos={[{ chave: "total", label: "Eventos", cor: "#9c27b0" }]}
            />
          )}
        </div>

        <div className="rel-panel">
          <h2 className="rel-panel-title">
            <i className="ri-presentation-line"></i> Apresentações — {ano}
          </h2>
          {dados.apresentacoesMes.length === 0 ? (
            <p style={{ color: "#666" }}>Sem apresentações em {ano}.</p>
          ) : (
            <BarrasMensal
              dadosBrutos={dados.apresentacoesMes}
              campos={[{ chave: "criancas", label: "Crianças", cor: "#00c853" }]}
            />
          )}
        </div>
      </div>

    </div>
  );
}

export default Relatorios;
