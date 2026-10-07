import styles from "../relatorios.module.css";
export default function RelatorioFiltros({
  periodo,
  preset,
  notas,
  setNotas,
  busy,
  gerar,
  alterar,
  selecionarPreset
}) {
  return <form className={styles["report-panel"]} onSubmit={event => {
    event.preventDefault();
    gerar('resumido');
  }}>
      <div className={styles["report-filters"]}>
        <label>Período<select value={preset} disabled={busy} onChange={event => {
          selecionarPreset(event.target.value);
        }}><option value="mes">Este mês</option><option value="trimestre">Este trimestre</option><option value="ano">Este ano</option><option value="personalizado">Personalizado</option></select></label>
        <label>De<input type="date" value={periodo.inicio} required disabled={busy} onChange={event => alterar('inicio', event.target.value)} /></label>
        <label>Até<input type="date" value={periodo.fim} min={periodo.inicio} required disabled={busy} onChange={event => alterar('fim', event.target.value)} /></label>
        <button disabled={busy} type="submit">{busy ? 'A gerar…' : 'Consultar'}</button>
      </div>
      <label className={styles["report-notes"]}>Observações para o documento<textarea maxLength={2000} rows={3} value={notas} disabled={busy} onChange={event => setNotas(event.target.value)} /></label>
      <div className={styles["report-actions"]}><button type="button" disabled={busy || !periodo.inicio || !periodo.fim || periodo.inicio > periodo.fim} onClick={() => gerar('resumido', true)}>Exportar PDF resumido</button><button type="button" disabled={busy || !periodo.inicio || !periodo.fim || periodo.inicio > periodo.fim} onClick={() => gerar('detalhado', true)}>Exportar PDF detalhado</button></div>
    </form>;
}
