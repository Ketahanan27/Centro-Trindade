import { useState } from 'react';
import DashboardLayout from '../../components/dashboard/dashboardlayout';
import VisitasAtividade from './components/VisitasAtividade';
import Visitantes from './components/Visitantes';
import Documentos from './components/Documentos';
import Apresentacoes from './components/Apresentacoes';
import Atas from './components/Atas';
import styles from './secretaria.module.css';

const ABAS = [
  { id: 'visitas-atividade', titulo: 'Visitantes por atividade', componente: VisitasAtividade },
  { id: 'visitantes', titulo: 'Acompanhamento de visitantes', componente: Visitantes },
  { id: 'documentos', titulo: 'Documentos', componente: Documentos },
  { id: 'apresentacoes', titulo: 'Apresentações', componente: Apresentacoes },
  { id: 'atas', titulo: 'Reuniões e Atas', componente: Atas },
];

export default function SecretariaPage() {
  const [abaAtual, setAbaAtual] = useState(ABAS[0].id);
  const Componente = ABAS.find(aba => aba.id === abaAtual).componente;

  return (
    <DashboardLayout>
      <div className={styles['secretaria-page']}>
        <nav className={styles['secretaria-tabs']} aria-label="Áreas da Secretaria">
          {ABAS.map(aba => (
            <button
              key={aba.id}
              className={abaAtual === aba.id ? styles.active : ''}
              aria-pressed={abaAtual === aba.id}
              onClick={() => setAbaAtual(aba.id)}
            >
              {aba.titulo}
            </button>
          ))}
        </nav>
        <div className={styles['secretaria-content']}>
          <Componente />
        </div>
      </div>
    </DashboardLayout>
  );
}
