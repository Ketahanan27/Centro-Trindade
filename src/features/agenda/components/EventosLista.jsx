import { formatarData } from '../../../utils/data';
import styles from '../agenda.module.css';
export default function EventosLista({
  eventosVisiveis,
  eventosDoMes,
  dataSelecionada,
  eventoEmEdicaoId,
  selecionarEvento
}) {
  return <div className={styles['events-box']}>
    <h2><i className="ri-calendar-event-line" /> Gestão de Eventos</h2>
    <div className={styles['selected-date']}>Data Selecionada: <span>{dataSelecionada ? formatarData(dataSelecionada) : 'Nenhuma'}</span></div>
    <div className={styles['event-counter']}>Total do mês: {eventosDoMes.length}</div>
    <div className={styles['event-list']}>
      {!dataSelecionada && <h4>Eventos deste mês</h4>}
      {!eventosVisiveis.length && <p className={styles['empty-message']}>{dataSelecionada ? 'Nenhum evento neste dia.' : 'Nenhum evento neste mês.'}</p>}
      {eventosVisiveis.map(evento => {
        const estado = evento.estado === 'Cancelado' ? 'cancelado' : evento.estado === 'Concluído' ? 'concluido' : 'agendado';
        return <button type="button" key={evento.id} className={[styles['event-item'], eventoEmEdicaoId === evento.id && styles.selected].filter(Boolean).join(' ')} aria-pressed={eventoEmEdicaoId === evento.id} onClick={() => selecionarEvento(evento)}>
          <strong>{evento.titulo}</strong>
          {evento.descricao && <span className={styles['agenda-event-description']}>{evento.descricao}</span>}
          <span className={styles['agenda-event-meta']}><i className="ri-calendar-line" aria-hidden="true" />{formatarData(evento.data_evento)}{evento.hora_evento && <><i className="ri-time-line" aria-hidden="true" />{evento.hora_evento}</>}</span>
          {evento.local_evento && <span className={styles['agenda-event-location']}><i className="ri-map-pin-line" aria-hidden="true" />{evento.local_evento}</span>}
          <span className={styles['agenda-event-badges']}><span className={`${styles['agenda-status']} ${styles[estado]}`}>{evento.estado}</span><span className={styles['agenda-visibility']}>{evento.publico ? 'Público' : 'Interno'}</span></span>
        </button>;
      })}
    </div>
  </div>;
}
