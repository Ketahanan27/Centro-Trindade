import styles from "../dashboard.module.css";
import GraficoFinanceiro from './GraficoFinanceiro';
import { euro } from '../dashboard.model';
export default function ResumoFinanceiro({
  stats,
  periodo,
  graficoAnual
}) {
  return <article className={styles["overview-panel"]}><div className={styles["overview-panel-heading"]}><h2>Resumo financeiro</h2><span>Perfis autorizados</span></div><div className={styles["overview-finance"]}><div><span>Receitas do mês</span><strong className={styles["teal-text"]}>{euro(stats.receitas)}</strong></div><div><span>Despesas do mês</span><strong className={styles["coral-text"]}>{euro(stats.despesas)}</strong></div><div><span>Saldo do mês</span><strong className={styles["gold-text"]}>{euro(stats.saldo)}</strong></div></div><p className={styles["overview-note"]}>Receitas e despesas mensais · {periodo.ano}</p><GraficoFinanceiro dados={graficoAnual} meses={periodo.mes} /><p className={styles["overview-note"]}>Saldo do mês = receitas menos despesas; não representa o saldo acumulado.</p></article>;
}
