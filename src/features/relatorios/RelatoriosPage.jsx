import styles from "./relatorios.module.css";
import DashboardLayout from "../../components/dashboard/dashboardlayout";
import { useRelatorios } from "./hooks/useRelatorios";
import RelatorioFiltros from "./components/RelatorioFiltros";
import RelatorioResumo from "./components/RelatorioResumo";
export default function RelatoriosPage() {
  const relatorio = useRelatorios();
  return <DashboardLayout><div className={styles["global-reports"]}>
 <header><h1>Relatórios</h1><p>Relatório de operações da igreja</p></header>
 <RelatorioFiltros {...relatorio} />
 {relatorio.erro && <p className={styles["report-error"]} role="alert">{relatorio.erro}</p>}
 {relatorio.dados && <RelatorioResumo dados={relatorio.dados} />}
 </div></DashboardLayout>;
}
