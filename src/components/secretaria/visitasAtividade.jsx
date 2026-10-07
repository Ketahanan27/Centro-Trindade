import { useEffect, useState } from 'react';
import { usePerfil } from '../../routes/PerfilContext';
import { apiFetch, apiFetchArray } from '../../utils/api';
import { formatarData } from '../../utils/data';
import { criarVisitasAtividadePDF } from '../../utils/exportacoesPdf';
import '../../assets/styles/dashboard/visitasAtividade.css';
const vazio = { evento_id: '', atividade: '', data_atividade: '', quantidade: '', observacoes: '' };
export default function VisitasAtividade() {
 const { soLeitura } = usePerfil();
 const [filtros,setFiltros]=useState({inicio:'',fim:'',pesquisa:''});
 const [pagina,setPagina]=useState(1),[tentativa,setTentativa]=useState(0);
 const [resultado,setResultado]=useState(null),[erro,setErro]=useState(null),[loading,setLoading]=useState(true);
 const [eventos,setEventos]=useState([]),[agendaErro,setAgendaErro]=useState(false);
 const [form,setForm]=useState(vazio),[editId,setEditId]=useState(null),[busy,setBusy]=useState(false),[feedback,setFeedback]=useState(null);
 const [exportando,setExportando]=useState(false);
 const query=new URLSearchParams({...filtros,pagina:String(pagina)}).toString();
 useEffect(()=>{let active=true;async function load(){try{const res=await apiFetch(`/api/visitas-atividade?${query}`);const data=await res.json();if(!res.ok)throw new Error(data.message);if(active){setResultado(data);setErro(null);}}catch(error){if(active)setErro(error.message||'Erro ao carregar as contagens.');}finally{if(active)setLoading(false);}}load();return()=>{active=false;};},[query,tentativa]);
 useEffect(()=>{let active=true;apiFetchArray('/api/eventos/internos').then(data=>{if(active)setEventos(data);}).catch(()=>{if(active)setAgendaErro(true);});return()=>{active=false;};},[]);
 function recarregar(){setLoading(true);setTentativa(value=>value+1);}
 function filtrar(event){setFiltros({...filtros,[event.target.name]:event.target.value});setPagina(1);setLoading(true);}
 function alterar(event){setForm({...form,[event.target.name]:event.target.value});setFeedback(null);}
 function escolherEvento(event){const evento=eventos.find(row=>String(row.id)===event.target.value);setForm({...form,evento_id:event.target.value,atividade:evento?.titulo??'',data_atividade:evento?.data_evento?.slice(0,10)??''});}
 async function guardar(event){event.preventDefault();if(busy)return;setBusy(true);setFeedback(null);try{const res=await apiFetch(`/api/visitas-atividade${editId?`/${editId}`:''}`,{method:editId?'PUT':'POST',body:JSON.stringify(form)});const data=await res.json();if(!res.ok)throw new Error(data.message);setFeedback(data.message);setForm(vazio);setEditId(null);setPagina(1);recarregar();}catch(error){setFeedback(error.message);}finally{setBusy(false);}}
 async function eliminar(row){if(busy||!window.confirm(`Eliminar a contagem de ${row.atividade} em ${formatarData(row.data_atividade)}?`))return;setBusy(true);try{const res=await apiFetch(`/api/visitas-atividade/${row.id}`,{method:'DELETE'});const data=await res.json();if(!res.ok)throw new Error(data.message);if(editId===row.id){setEditId(null);setForm(vazio);}setPagina(1);recarregar();setFeedback(data.message);}catch(error){setFeedback(error.message);}finally{setBusy(false);}}
 async function exportar(){if(exportando)return;setExportando(true);try{const res=await apiFetch(`/api/visitas-atividade?${new URLSearchParams({...filtros,exportar:'true'})}`);const data=await res.json();if(!res.ok)throw new Error(data.message);const periodo=`Período: ${filtros.inicio?formatarData(filtros.inicio):'sem início definido'} a ${filtros.fim?formatarData(filtros.fim):'sem fim definido'}.${filtros.pesquisa?` Pesquisa: ${filtros.pesquisa}.`:''}`;criarVisitasAtividadePDF(data.registos,periodo).save('visitantes-por-atividade.pdf');}catch(error){setFeedback(error.message);}finally{setExportando(false);}}
 return <section className="visitas-atividade"><h2>Visitantes por atividade</h2>
 {!soLeitura&&<form className="visitas-form" onSubmit={guardar}><h3>{editId?'Editar contagem':'Registar contagem'}</h3><fieldset disabled={busy}>
 <label>Atividade da Agenda (opcional)<select value={form.evento_id} onChange={escolherEvento}><option value="">Indicar nome e data diretamente</option>{eventos.map(row=><option key={row.id} value={row.id}>{formatarData(row.data_evento)} — {row.titulo}</option>)}</select></label>{agendaErro&&<p role="status">Não foi possível carregar a Agenda. Pode indicar a atividade diretamente ou atualizar a página.</p>}
 <label>Nome da atividade<input name="atividade" value={form.atividade} onChange={alterar} required maxLength={150} readOnly={!!form.evento_id}/></label>
 <label>Data<input type="date" name="data_atividade" value={form.data_atividade} onChange={alterar} required readOnly={!!form.evento_id}/></label>
 <label>Quantidade de visitantes<input type="number" name="quantidade" value={form.quantidade} onChange={alterar} required min="0" max="1000000" step="1"/></label>
 <label className="visitas-wide">Observações (opcional)<textarea name="observacoes" value={form.observacoes} onChange={alterar} maxLength={2000}/></label>
 <div className="visitas-actions"><button type="submit">{busy?'A guardar…':editId?'Guardar alterações':'Registar'}</button>{editId&&<button type="button" onClick={()=>{setEditId(null);setForm(vazio);}}>Cancelar edição</button>}</div></fieldset></form>}
 {feedback&&<p className="visitas-feedback" role="status">{feedback}</p>}
 <div className="visitas-filtros"><label>Desde<input type="date" name="inicio" value={filtros.inicio} onChange={filtrar}/></label><label>Até<input type="date" name="fim" value={filtros.fim} onChange={filtrar}/></label><label>Pesquisar atividade<input name="pesquisa" value={filtros.pesquisa} onChange={filtrar} maxLength={150}/></label><button disabled={exportando||loading||!!erro} onClick={exportar}>{exportando?'A exportar…':'Exportar PDF'}</button></div>
 {loading?<p role="status">A carregar contagens…</p>:erro?<div role="alert"><p>{erro}</p><button onClick={recarregar}>Tentar novamente</button></div>:resultado&&<><p className="visitas-total"><strong>{resultado.totalVisitantes}</strong> participações de visitantes em <strong>{resultado.total}</strong> atividades no período selecionado.</p><div className="visitas-table"><table><thead><tr><th>Data</th><th>Atividade</th><th>Visitantes</th><th>Observações</th>{!soLeitura&&<th>Ações</th>}</tr></thead><tbody>{resultado.registos.map(row=><tr key={row.id}><td>{formatarData(row.data_atividade)}</td><td>{row.atividade}{row.evento_id&&<small>Ligada à Agenda</small>}</td><td>{row.quantidade}</td><td>{row.observacoes||'—'}</td>{!soLeitura&&<td><button disabled={busy} onClick={()=>{setEditId(row.id);setForm({...row,evento_id:row.evento_id??'',observacoes:row.observacoes??''});setFeedback(null);}}>Editar</button><button disabled={busy} onClick={()=>eliminar(row)}>Eliminar</button></td>}</tr>)}</tbody></table></div>{!resultado.registos.length&&<p>Sem contagens para este período.</p>}<nav className="visitas-actions" aria-label="Páginas das contagens"><button disabled={pagina===1} onClick={()=>{setPagina(value=>value-1);setLoading(true);}}>Anterior</button><span>Página {pagina} de {Math.max(1,Math.ceil(resultado.total/25))}</span><button disabled={pagina*25>=resultado.total} onClick={()=>{setPagina(value=>value+1);setLoading(true);}}>Seguinte</button></nav></>}
 </section>;
}
