import { formatarData } from "../../../utils/data";
import { vazio, CONTAGENS_POR_PAGINA } from "../models/visitasAtividade.model";
import { useVisitasAtividade } from "../hooks/useVisitasAtividade";
import styles from "../secretaria.module.css";
export default function VisitasAtividade() {
  const {
    soLeitura,
    filtros,
    pagina,
    setPagina,
    resultado,
    erro,
    loading,
    setLoading,
    eventos,
    agendaErro,
    form,
    setForm,
    editId,
    setEditId,
    busy,
    feedback,
    setFeedback,
    exportando,
    recarregar,
    filtrar,
    alterar,
    escolherEvento,
    guardar,
    eliminar,
    exportar
  } = useVisitasAtividade();
  return <section className={styles["visitas-atividade"]}><h2>Visitantes por atividade</h2>
 {!soLeitura && <form className={styles["visitas-form"]} onSubmit={guardar}><h3>{editId ? 'Editar contagem' : 'Registar contagem'}</h3><fieldset disabled={busy}>
 <label>Atividade da Agenda (opcional)<select value={form.evento_id} onChange={escolherEvento}><option value="">Indicar nome e data diretamente</option>{eventos.map(row => <option key={row.id} value={row.id}>{formatarData(row.data_evento)} — {row.titulo}</option>)}</select></label>{agendaErro && <p role="status">Não foi possível carregar a Agenda. Pode indicar a atividade diretamente ou atualizar a página.</p>}
 <label>Nome da atividade<input name="atividade" value={form.atividade} onChange={alterar} required maxLength={150} readOnly={!!form.evento_id} /></label>
 <label>Data<input type="date" name="data_atividade" value={form.data_atividade} onChange={alterar} required readOnly={!!form.evento_id} /></label>
 <label>Quantidade de visitantes<input type="number" name="quantidade" value={form.quantidade} onChange={alterar} required min="0" max="1000000" step="1" /></label>
 <label className={styles["visitas-wide"]}>Observações (opcional)<textarea name="observacoes" value={form.observacoes} onChange={alterar} maxLength={2000} /></label>
 <div className={styles["visitas-actions"]}><button type="submit">{busy ? 'A guardar…' : editId ? 'Guardar alterações' : 'Registar'}</button>{editId && <button type="button" onClick={() => {
            setEditId(null);
            setForm(vazio);
          }}>Cancelar edição</button>}</div></fieldset></form>}
 {feedback && <p className={styles["visitas-feedback"]} role="status">{feedback}</p>}
 <div className={styles["visitas-filtros"]}><label>Desde<input type="date" name="inicio" value={filtros.inicio} onChange={filtrar} /></label><label>Até<input type="date" name="fim" value={filtros.fim} onChange={filtrar} /></label><label>Pesquisar atividade<input name="pesquisa" value={filtros.pesquisa} onChange={filtrar} maxLength={150} /></label><button disabled={exportando || loading || !!erro} onClick={exportar}>{exportando ? 'A exportar…' : 'Exportar PDF'}</button></div>
 {loading ? <p role="status">A carregar contagens…</p> : erro ? <div role="alert"><p>{erro}</p><button onClick={recarregar}>Tentar novamente</button></div> : resultado && <><p className={styles["visitas-total"]}><strong>{resultado.totalVisitantes}</strong> participações de visitantes em <strong>{resultado.total}</strong> atividades no período selecionado.</p><div className={styles["visitas-table"]}><table><thead><tr><th>Data</th><th>Atividade</th><th>Visitantes</th><th>Observações</th>{!soLeitura && <th>Ações</th>}</tr></thead><tbody>{resultado.registos.map(row => <tr key={row.id}><td>{formatarData(row.data_atividade)}</td><td>{row.atividade}{row.evento_id && <small>Ligada à Agenda</small>}</td><td>{row.quantidade}</td><td>{row.observacoes || '—'}</td>{!soLeitura && <td><button disabled={busy} onClick={() => {
                  setEditId(row.id);
                  setForm({
                    ...row,
                    evento_id: row.evento_id ?? '',
                    observacoes: row.observacoes ?? ''
                  });
                  setFeedback(null);
                }}>Editar</button><button disabled={busy} onClick={() => eliminar(row)}>Eliminar</button></td>}</tr>)}</tbody></table></div>{!resultado.registos.length && <p>Sem contagens para este período.</p>}<nav className={styles["visitas-actions"]} aria-label="Páginas das contagens"><button disabled={pagina === 1} onClick={() => {
          setPagina(value => value - 1);
          setLoading(true);
        }}>Anterior</button><span>Página {pagina} de {Math.max(1, Math.ceil(resultado.total / CONTAGENS_POR_PAGINA))}</span><button disabled={pagina * CONTAGENS_POR_PAGINA >= resultado.total} onClick={() => {
          setPagina(value => value + 1);
          setLoading(true);
        }}>Seguinte</button></nav></>}
 </section>;
}
