import styles from "../dashboard.module.css";
import { prepararVisitantes } from "../dashboard.model";
export default function Visitantes({
  dados
}) {
  const {
    linhas,
    total,
    partes
  } = prepararVisitantes(dados);
  return <><div className={styles["overview-visitors"]}><div className={styles["overview-donut"]} role="img" aria-label={`${total} visitantes; distribuição por estado na legenda.`} style={{
        background: total ? `conic-gradient(${partes.join(',')})` : '#283440'
      }}><div><strong>{total}</strong><span>visitantes</span></div></div><ul>{linhas.map(row => <li key={row.estado}><b style={{
            background: row.cor
          }} /><span>{row.estado}</span><strong>{row.total}</strong></li>)}</ul></div><p className={styles["overview-note"]}>Estado atual dos registos de acompanhamento individual.</p></>;
}
