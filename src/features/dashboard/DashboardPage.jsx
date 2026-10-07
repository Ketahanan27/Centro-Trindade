import styles from "./dashboard.module.css";
import Pendencias from "./components/Pendencias";
import ProximosEventos from "./components/ProximosEventos";
import ResumoFinanceiro from "./components/ResumoFinanceiro";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import { Link } from "react-router-dom";
import { tituloDoMes } from "./dashboard.model";
import { useDashboard } from "./hooks/useDashboard";
import Indicador from "./components/Indicador";
import Atividades from "./components/Atividades";
import Visitantes from "./components/Visitantes";
export default function DashboardPage() {
  const {
    dados,
    loading,
    erro,
    repetir
  } = useDashboard();
  if (loading || erro) return <DashboardLayout><section className={styles["church-overview"] + " " + styles["overview-state"]} role="status"><p>{loading ? 'A carregar o estado da igreja…' : erro}</p>{erro && <button onClick={repetir}>Tentar novamente</button>}</section></DashboardLayout>;
  const {
    stats,
    periodo,
    podeVerMembros,
    podeVerFinancas,
    pendencias
  } = dados;
  const tituloMes = tituloDoMes(periodo.inicioMes);
  return <DashboardLayout><div className={styles["church-overview"]}>
    <header className={styles["overview-heading"]}><div><h1>Visão geral da igreja</h1><p>{tituloMes}</p></div><span className={styles["overview-live"]}>Dados atuais</span></header>
    <section className={styles["overview-stats"] + " " + (podeVerMembros ? "" : styles["compact"])} aria-label="Indicadores da igreja">
      <Indicador titulo="Membros ativos" valor={stats.membros} icon="ri-team-line" />
      {podeVerMembros && <Indicador titulo="Total de visitantes" valor={stats.visitantes} icon="ri-user-heart-line" cor="gold" detalhe="Todas as atividades registadas" />}
      <Indicador titulo="Próximos eventos" valor={stats.eventos} icon="ri-calendar-event-line" cor="purple" />
    </section>
    {podeVerMembros && <section className={styles["overview-grid"]}><article className={styles["overview-panel"]}><h2>Visitantes por atividade</h2><Atividades dados={dados.visitantesAtividade} /><Link to="/dashboard/secretaria">Consultar contagens na Secretaria</Link></article><article className={styles["overview-panel"]}><h2>Visitantes por estado</h2><Visitantes dados={dados.visitantesPorEstado} /></article></section>}
    <section className={styles["overview-grid"] + " " + (!podeVerFinancas ? styles["without-finance"] : "")}>
      {podeVerFinancas && <ResumoFinanceiro stats={stats} periodo={periodo} graficoAnual={dados.graficoAnual} />}
      <div className={styles["overview-stack"]}><ProximosEventos eventos={dados.proximosEventos} podeVerMembros={podeVerMembros} />
      {podeVerMembros && <Pendencias pendencias={pendencias} />}</div>
    </section>
  </div></DashboardLayout>;
}
