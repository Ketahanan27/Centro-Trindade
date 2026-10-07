import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/dashboardlayout';
import { apiFetch } from '../../utils/api';
import { formatarData } from '../../utils/data';
import '../../assets/styles/dashboard/overview.css';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const euro = (value) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(value));
const ESTADOS = [['Visitante', '#0044ff'], ['Em acompanhamento', '#00c9e0'], ['Tornou-se membro', '#a6b9ff']];
function Indicador({ titulo, valor, icon, cor = 'blue', detalhe }) {
  return <article className={`overview-stat ${cor}`}><span className="overview-icon" aria-hidden="true"><i className={icon}/></span><div><span>{titulo}</span><strong>{valor}</strong>{detalhe && <small>{detalhe}</small>}</div></article>;
}
function Barras({ dados, financeiro = false, meses }) {
  const linhas = Array.from({length: meses}, (_, i) => ({mes: i+1, ...(dados.find((row) => row.mes === i+1) ?? {})}));
  const max = Math.max(1, ...linhas.flatMap((row) => financeiro ? [row.receitas ?? 0, row.despesas ?? 0] : [row.total ?? 0]));
  const temDados = linhas.some((row) => financeiro ? row.receitas || row.despesas : row.total);
  if (!temDados) return <p className="overview-empty">Sem registos neste período.</p>;
  return <><div className="overview-chart" role="img" aria-label={financeiro ? 'Receitas e despesas por mês; valores na tabela abaixo.' : 'Registos de visitantes por mês; valores na tabela abaixo.'}>
    {linhas.map((row) => <div className="overview-column" key={row.mes}><div className="overview-bars">
      <div className={financeiro ? 'income' : 'growth'} style={{height: `${100 * (financeiro ? row.receitas ?? 0 : row.total ?? 0)/max}%`}} title={financeiro ? euro(row.receitas ?? 0) : String(row.total ?? 0)}/>
      {financeiro && <div className="expense" style={{height: `${100*(row.despesas ?? 0)/max}%`}} title={euro(row.despesas ?? 0)}/>}
    </div><span>{MESES[row.mes-1]}</span></div>)}
  </div>{financeiro && <div className="overview-chart-legend"><span><b className="income"/>Receitas</span><span><b className="expense"/>Despesas</span></div>}
  <details className="overview-values"><summary>Ver valores por mês</summary><table><caption>{financeiro ? 'Valores financeiros mensais' : 'Registos de visitantes mensais'}</caption><thead><tr><th>Mês</th><th>{financeiro ? 'Receitas' : 'Visitantes'}</th>{financeiro && <th>Despesas</th>}</tr></thead><tbody>{linhas.map((row) => <tr key={row.mes}><th>{MESES[row.mes-1]}</th><td>{financeiro ? euro(row.receitas ?? 0) : row.total ?? 0}</td>{financeiro && <td>{euro(row.despesas ?? 0)}</td>}</tr>)}</tbody></table></details></>;
}
function Visitantes({ dados }) {
  const linhas = ESTADOS.map(([estado, cor]) => ({estado, cor, total: dados.find((row) => row.estado === estado)?.total ?? 0}));
  const total = linhas.reduce((sum,row) => sum+row.total,0);
  let inicio = 0;
  const partes = linhas.map((row) => { const fim = inicio + (total ? row.total/total*100 : 0); const parte = `${row.cor} ${inicio}% ${fim}%`; inicio = fim; return parte; });
  return <><div className="overview-visitors"><div className="overview-donut" role="img" aria-label={`${total} visitantes; distribuição por estado na legenda.`} style={{background: total ? `conic-gradient(${partes.join(',')})` : '#283440'}}><div><strong>{total}</strong><span>visitantes</span></div></div><ul>{linhas.map((row) => <li key={row.estado}><b style={{background:row.cor}}/><span>{row.estado}</span><strong>{row.total}</strong></li>)}</ul></div><p className="overview-note">Estado atual de todos os registos de visitantes.</p></>;
}
export default function Dashboard() {
  const [dados, setDados] = useState(null);
  const [loading,setLoading] = useState(true);
  const [erro,setErro] = useState(null);
  const [tentativa,setTentativa] = useState(0);
  useEffect(() => {
    let active = true;
    async function carregar() {
      try { const res = await apiFetch('/api/dashboard/stats'); if (!res.ok) throw new Error(); const data = await res.json(); if(active) setDados(data); }
      catch { if(active) setErro('Não foi possível carregar os indicadores. Tente novamente.'); }
      finally { if(active) setLoading(false); }
    }
    carregar(); return () => { active = false; };
  }, [tentativa]);
  function repetir() { setLoading(true);setErro(null);setTentativa((value)=>value+1); }
  if (loading || erro) return <DashboardLayout><section className="church-overview overview-state" role="status"><p>{loading ? 'A carregar o estado da igreja…' : erro}</p>{erro && <button onClick={repetir}>Tentar novamente</button>}</section></DashboardLayout>;
  const {stats,periodo,podeVerMembros,podeVerFinancas,pendencias} = dados;
  const tituloMes = new Intl.DateTimeFormat('pt-PT',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${periodo.inicioMes}T12:00:00Z`));
  return <DashboardLayout><div className="church-overview">
    <header className="overview-heading"><div><h1>Visão geral da igreja</h1><p>{tituloMes}</p></div><span className="overview-live">Dados atuais</span></header>
    <section className="overview-stats" aria-label="Indicadores da igreja">
      <Indicador titulo="Membros ativos" valor={stats.membros} icon="ri-team-line" detalhe="Total atual"/>
      {podeVerMembros && <><Indicador titulo="Novos membros este mês" valor={stats.novosMembros} icon="ri-user-add-line" cor="teal" detalhe="Por data de entrada"/><Indicador titulo="Visitantes este mês" valor={stats.visitantes} icon="ri-user-heart-line" cor="gold" detalhe="Registos de visitas"/></>}
      <Indicador titulo="Próximos eventos" valor={stats.eventos} icon="ri-calendar-event-line" cor="purple" detalhe={podeVerMembros ? 'Eventos agendados' : 'Eventos públicos'}/>
    </section>
    {podeVerMembros && <section className="overview-grid"><article className="overview-panel"><h2>Visitantes por mês</h2><p className="overview-note">Registos pela data da visita · {periodo.ano}</p><Barras dados={dados.visitantesMensais} meses={periodo.mes}/></article><article className="overview-panel"><h2>Visitantes por estado</h2><Visitantes dados={dados.visitantesPorEstado}/></article></section>}
    <section className={`overview-grid ${!podeVerFinancas ? 'without-finance' : ''}`}>
      {podeVerFinancas && <article className="overview-panel"><div className="overview-panel-heading"><h2>Resumo financeiro</h2><span>Perfis autorizados</span></div><div className="overview-finance"><div><span>Receitas do mês</span><strong className="teal-text">{euro(stats.receitas)}</strong></div><div><span>Despesas do mês</span><strong className="coral-text">{euro(stats.despesas)}</strong></div><div><span>Saldo do mês</span><strong className="gold-text">{euro(stats.saldo)}</strong></div></div><p className="overview-note">Receitas e despesas mensais · {periodo.ano}</p><Barras dados={dados.graficoAnual} financeiro meses={periodo.mes}/><p className="overview-note">Saldo do mês = receitas menos despesas; não representa o saldo acumulado.</p></article>}
      <div className="overview-stack"><article className="overview-panel"><div className="overview-panel-heading"><h2>Próximos eventos</h2><Link to={podeVerMembros ? '/dashboard/agenda' : '/calendario'}>Ver agenda</Link></div>{dados.proximosEventos.length ? <ul className="overview-events">{dados.proximosEventos.map((evento) => <li key={evento.id}><time dateTime={evento.data}><strong>{evento.data.slice(8,10)}</strong><span>{MESES[Number(evento.data.slice(5,7))-1]}</span></time><div><strong>{evento.titulo}</strong><small>{formatarData(evento.data)}{evento.hora_evento ? ` · ${evento.hora_evento.slice(0,5)}` : ''}</small>{evento.local_evento && <small>{evento.local_evento}</small>}<div className="overview-event-tags"><span className="overview-visibility">{evento.publico ? 'Público' : 'Interno'}</span><span className={`overview-event-status ${{Agendado:'scheduled','Concluído':'completed',Cancelado:'cancelled'}[evento.estado] ?? ''}`}><i aria-hidden="true"/>{evento.estado}</span></div></div></li>)}</ul> : <p className="overview-empty">Sem eventos agendados.</p>}</article>
      {podeVerMembros && <article className="overview-panel"><h2>Pendências</h2><ul className="overview-pending">{pendencias.contasPorAtivar !== null && <li><Link to="/dashboard/utilizadores">Contas por ativar</Link><strong>{pendencias.contasPorAtivar}</strong></li>}<li><Link to="/dashboard/membros">Membros sem conta associada</Link><strong>{pendencias.membrosSemConta}</strong></li></ul><p className="overview-note">Sem conta associada não significa que seja obrigatório criar uma conta.</p></article>}</div>
    </section>
  </div></DashboardLayout>;
}
