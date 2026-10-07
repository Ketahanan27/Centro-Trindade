import styles from "../dashboard.module.css";
export default function Indicador({
  titulo,
  valor,
  icon,
  cor = 'blue',
  detalhe
}) {
  return <article className={styles["overview-stat"] + " " + (styles[cor] || "")}><span className={styles["overview-icon"]} aria-hidden="true"><i className={icon} /></span><div><span>{titulo}</span><strong>{valor}</strong><small aria-hidden={!detalhe}>{detalhe || "\u00a0"}</small></div></article>;
}
