import styles from "../dashboard.module.css";
import { Link } from 'react-router-dom';
import { formatarData } from '../../../utils/data';
import { MESES, CLASSES_ESTADO_EVENTO } from '../dashboard.model';
export default function ProximosEventos({
  eventos,
  podeVerMembros
}) {
  return <article className={styles["overview-panel"]}><div className={styles["overview-panel-heading"]}><h2>Próximos eventos</h2><Link to={podeVerMembros ? '/dashboard/agenda' : '/calendario'}>Ver agenda</Link></div>{eventos.length ? <ul className={styles["overview-events"]}>{eventos.map(evento => <li key={evento.id}><time dateTime={evento.data}><strong>{evento.data.slice(8, 10)}</strong><span>{MESES[Number(evento.data.slice(5, 7)) - 1]}</span></time><div><strong>{evento.titulo}</strong><small>{formatarData(evento.data)}{evento.hora_evento ? ` · ${evento.hora_evento.slice(0, 5)}` : ''}</small>{evento.local_evento && <small>{evento.local_evento}</small>}<div className={styles["overview-event-tags"]}><span className={styles["overview-visibility"]}>{evento.publico ? 'Público' : 'Interno'}</span><span className={styles["overview-event-status"] + " " + (styles[CLASSES_ESTADO_EVENTO[evento.estado]] || "")}><i aria-hidden="true" />{evento.estado}</span></div></div></li>)}</ul> : <p className={styles["overview-empty"]}>Sem eventos agendados.</p>}</article>;
}
