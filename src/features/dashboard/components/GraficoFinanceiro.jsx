import styles from "../dashboard.module.css";
import { MESES, euro, prepararSerieFinanceira } from '../dashboard.model';
export default function GraficoFinanceiro({
  dados,
  meses
}) {
  const {
    linhas,
    max,
    temDados
  } = prepararSerieFinanceira(dados, meses);
  if (!temDados) return <p className={styles["overview-empty"]}>Sem registos neste período.</p>;
  return <>
      <div className={styles["overview-chart"]} role="img" aria-label="Receitas e despesas por mês; valores na tabela abaixo.">
        {linhas.map(linha => <div className={styles["overview-column"]} key={linha.mes}>
            <div className={styles["overview-bars"]}>
              <div className={styles["income"]} style={{
            height: `${100 * linha.receitas / max}%`
          }} title={euro(linha.receitas)} />
              <div className={styles["expense"]} style={{
            height: `${100 * linha.despesas / max}%`
          }} title={euro(linha.despesas)} />
            </div>
            <span>{MESES[linha.mes - 1]}</span>
          </div>)}
      </div>
      <div className={styles["overview-chart-legend"]}><span><b className={styles["income"]} />Receitas</span><span><b className={styles["expense"]} />Despesas</span></div>
      <details className={styles["overview-values"]}>
        <summary>Ver valores por mês</summary>
        <table>
          <caption>Valores financeiros mensais</caption>
          <thead><tr><th>Mês</th><th>Receitas</th><th>Despesas</th></tr></thead>
          <tbody>{linhas.map(linha => <tr key={linha.mes}><th>{MESES[linha.mes - 1]}</th><td>{euro(linha.receitas)}</td><td>{euro(linha.despesas)}</td></tr>)}</tbody>
        </table>
      </details>
    </>;
}
