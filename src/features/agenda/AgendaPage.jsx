import DashboardLayout from '../../components/dashboard/dashboardlayout';
import { useAgenda } from './hooks/useAgenda';
import AgendaCalendario from './components/AgendaCalendario';
import EventosLista from './components/EventosLista';
import EventoFormulario from './components/EventoFormulario';
import styles from './agenda.module.css';
export default function AgendaPage() {
  const agenda = useAgenda();
  return <DashboardLayout><section className={styles['agenda-container']}>
    <header className={styles['agenda-page-header']}><h1>Agenda</h1><span>{agenda.eventosDoMes.length} {agenda.eventosDoMes.length === 1 ? 'atividade' : 'atividades'} este mês</span></header>
    {agenda.soLeitura && <div className={styles['banner-leitura']}><i className="ri-eye-line" /> Modo visualização — não tem permissão para editar eventos.</div>}
    <AgendaCalendario {...agenda} />
    <EventosLista {...agenda} />
    {!agenda.soLeitura && <EventoFormulario {...agenda} />}
  </section></DashboardLayout>;
}
