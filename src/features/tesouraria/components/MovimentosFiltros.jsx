import styles from "../tesouraria.module.css";
export default function MovimentosFiltros({
  pesquisa,
  setPesquisa,
  setPaginaAtual,
  filtroNatureza,
  setFiltroNatureza,
  exportarPDF,
  exportarPDFDia
}) {
  return <div className={styles["search-box"]}>
              <input type="text" placeholder="Pesquisar por tipo ou observação..." value={pesquisa} onChange={e => {
      setPesquisa(e.target.value);
      setPaginaAtual(1);
    }} />
              <select className={styles["filtro-natureza-select"]} value={filtroNatureza} onChange={e => {
      setFiltroNatureza(e.target.value);
      setPaginaAtual(1);
    }}>
                <option value="Todos">Todos</option>
                <option value="Receita">Receitas</option>
                <option value="Despesa">Despesas</option>
              </select>
              <button className={styles["btn-export"]} onClick={() => exportarPDF()}>
                PDF geral
              </button>
              <button className={styles["btn-export"]} onClick={exportarPDFDia}>
                PDF diário
              </button>
            </div>;
}
