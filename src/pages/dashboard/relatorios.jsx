import { useState } from 'react';
import DashboardLayout from '../../components/dashboard/dashboardlayout';
import { apiFetch } from '../../utils/api';
import { criarRelatorioGlobalPDF, ROTULOS_RELATORIO, valorRelatorio } from '../../utils/relatorioGlobalPdf';
import { formatarData } from '../../utils/data';
import '../../assets/styles/dashboard/relatorios.css';

const hoje = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Lisbon' });
function datasPreset(preset) {
  const fim = hoje();
  const [ano,mes] = fim.split('-');
  const inicio = preset === 'mes' ? `${ano}-${mes}-01` : preset === 'trimestre' ? `${ano}-${String(Math.floor((Number(mes)-1)/3)*3+1).padStart(2,'0')}-01` : `${ano}-01-01`;
  return { inicio, fim };
}

export default function Relatorios() {
  const [periodo,setPeriodo] = useState(() => datasPreset('ano'));
  const [preset,setPreset] = useState('ano');
  const [dados,setDados] = useState(null);
  const [notas,setNotas] = useState('');
  const [busy,setBusy] = useState(false);
  const [erro,setErro] = useState('');
  async function gerar(modo, exportar = false) {
    if (busy) return;
    setBusy(true); setErro('');
    try {
      const response = await apiFetch(`/api/relatorios/global?${new URLSearchParams({...periodo,modo})}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Não foi possível gerar o relatório.');
      setDados(result);
      if (exportar) criarRelatorioGlobalPDF(result,notas).save(`centro-trindade-relatorio-${modo}-${result.inicio}-${result.fim}.pdf`);
    } catch (error) { setErro(error.message); }
    finally { setBusy(false); }
  }
  const alterar = (key,value) => { setPeriodo(current => ({...current,[key]:value})); setPreset('personalizado'); setDados(null); };
  return <DashboardLayout><div className="global-reports">
    <header><h1>Relatórios</h1><p>Relatório de operações da igreja</p></header>
    <form className="report-panel" onSubmit={event => {event.preventDefault(); gerar('resumido');}}>
      <div className="report-filters">
        <label>Período<select value={preset} disabled={busy} onChange={event => { const value=event.target.value; setPreset(value); if(value !== 'personalizado') setPeriodo(datasPreset(value)); setDados(null); }}><option value="mes">Este mês</option><option value="trimestre">Este trimestre</option><option value="ano">Este ano</option><option value="personalizado">Personalizado</option></select></label>
        <label>De<input type="date" value={periodo.inicio} required disabled={busy} onChange={event => alterar('inicio',event.target.value)} /></label>
        <label>Até<input type="date" value={periodo.fim} min={periodo.inicio} required disabled={busy} onChange={event => alterar('fim',event.target.value)} /></label>
        <button disabled={busy} type="submit">{busy ? 'A gerar…' : 'Consultar'}</button>
      </div>
      <label className="report-notes">Observações para o documento<textarea maxLength={2000} rows={3} value={notas} disabled={busy} onChange={event => setNotas(event.target.value)} /></label>
      <div className="report-actions"><button type="button" disabled={busy || !periodo.inicio || !periodo.fim || periodo.inicio>periodo.fim} onClick={() => gerar('resumido',true)}>Exportar PDF resumido</button><button type="button" disabled={busy || !periodo.inicio || !periodo.fim || periodo.inicio>periodo.fim} onClick={() => gerar('detalhado',true)}>Exportar PDF detalhado</button></div>
    </form>
    {erro && <p className="report-error" role="alert">{erro}</p>}
    {dados && <section aria-live="polite"><h2>{dados.abrangencia} · {formatarData(dados.inicio)} a {formatarData(dados.fim)}</h2><div className="report-grid">{Object.entries(dados.sections).map(([key,section]) => <article className="report-panel" key={key}><h3>{section.titulo}</h3><dl>{Object.entries(section.resumo).map(([name,value]) => <div key={name}><dt>{ROTULOS_RELATORIO[name] || name}</dt><dd>{valorRelatorio(name,value)}</dd></div>)}</dl>{section.estadoAtual && <><h4>Estado atual</h4><dl>{section.estadoAtual.map(row => <div key={row.estado ?? 'sem'}><dt>{row.estado || 'Sem estado'}</dt><dd>{row.total}</dd></div>)}</dl>{section.batizadosAtuais != null && <p>Batizados: {section.batizadosAtuais}</p>}</>}</article>)}</div></section>}
  </div></DashboardLayout>;
}
