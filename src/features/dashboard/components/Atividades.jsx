import styles from "../dashboard.module.css";
import { formatarData } from "../../../utils/data";
export default function Atividades({
  dados
}) {
  const max = Math.max(1, ...dados.map(row => Number(row.quantidade)));
  return dados.length ? <ul className={styles["overview-activities"]}>{dados.map(row => <li key={row.id}><div><span>{row.atividade} · {formatarData(row.data)}</span><strong>{row.quantidade}</strong></div><div className={styles["overview-activity-track"]} aria-hidden="true"><span style={{
          width: `${Number(row.quantidade) / max * 100}%`
        }} /></div></li>)}</ul> : <p className={styles["overview-empty"]}>Sem contagens registadas neste ano.</p>;
}
