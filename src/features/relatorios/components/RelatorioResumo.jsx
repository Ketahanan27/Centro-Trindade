import styles from "../relatorios.module.css";
import { ROTULOS_RELATORIO, valorRelatorio } from "../../../utils/relatorioGlobalPdf";
import { formatarData } from "../../../utils/data";
export default function RelatorioResumo({
  dados
}) {
  return <section aria-live="polite"><h2>{dados.abrangencia} · {formatarData(dados.inicio)} a {formatarData(dados.fim)}</h2><div className={styles["report-grid"]}>{Object.entries(dados.sections).map(([key, section]) => <article className={styles["report-panel"]} key={key}><h3>{section.titulo}</h3><dl>{Object.entries(section.resumo).map(([name, value]) => <div key={name}><dt>{ROTULOS_RELATORIO[name] || name}</dt><dd>{valorRelatorio(name, value)}</dd></div>)}</dl>{section.estadoAtual && <><h4>Estado atual</h4><dl>{section.estadoAtual.map(row => <div key={row.estado ?? 'sem'}><dt>{row.estado || 'Sem estado'}</dt><dd>{row.total}</dd></div>)}</dl>{section.batizadosAtuais != null && <p>Batizados: {section.batizadosAtuais}</p>}</>}</article>)}</div></section>;
}
