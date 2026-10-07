import { formatarData } from '../../../utils/data';
import { diasDoMes, MESES } from '../agenda.model';
import styles from '../agenda.module.css';
export default function AgendaCalendario({
  ano,
  mes,
  hoje,
  eventos,
  dataSelecionada,
  selecionarData,
  mudarMes,
  irParaHoje
}) {
  return <div className={styles['calendar-box']}>
    <div className={styles['calendar-header']}>
      <button aria-label="Mês anterior" onClick={() => mudarMes(-1)}><i className="ri-arrow-left-s-line" /></button>
      <h2>{MESES[mes]} {ano}</h2>
      <button aria-label="Mês seguinte" onClick={() => mudarMes(1)}><i className="ri-arrow-right-s-line" /></button>
      <button className={styles['today-btn']} onClick={irParaHoje}>Hoje</button>
    </div>
    <div className={styles.weekdays}>{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => <div key={dia}>{dia}</div>)}</div>
    <div className={styles['calendar-days']}>{diasDoMes(ano, mes).map((data, index) => {
        if (!data) return <div key={`vazio-${index}`} className={styles['empty-day']} />;
        const temEvento = eventos.some(evento => evento.data_evento?.slice(0, 10) === data);
        const classes = [styles.day, data === hoje && styles.today, temEvento && styles['has-event'], data === dataSelecionada && styles.selected].filter(Boolean).join(' ');
        return <button key={data} type="button" className={classes} aria-label={`Selecionar ${formatarData(data)}`} aria-pressed={data === dataSelecionada} onClick={() => selecionarData(data)}>{Number(data.slice(-2))}</button>;
      })}</div>
  </div>;
}
