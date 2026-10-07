import { formatarData } from "../../../utils/data";
import styles from "../tesouraria.module.css";
export default function MovimentosTabela({
  loading,
  movimentos,
  movimentosFiltrados,
  movimentosDaPagina,
  soLeitura,
  saving,
  handleEdit,
  handleDelete,
  totalPaginas,
  paginaVisivel,
  setPaginaAtual
}) {
  return <div className={styles["table-box"]}>
              <h2 className={styles["treasury-table-heading"]}>Movimentos registados</h2>
              {loading ? <p className={styles["empty-row"]}>A carregar movimentos...</p> : <table className={styles["movimentos-table"]}>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Natureza</th>
                      <th>Valor</th>
                      <th>Data</th>
                      <th>Observações</th>
                      <th>Autor</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimentosFiltrados.length === 0 ? <tr>
                        <td colSpan="7" className={styles["empty-row"]}>
                          {movimentos.length === 0 ? "Nenhum movimento registado." : "Sem resultados para o filtro aplicado."}
                        </td>
                      </tr> : movimentosDaPagina.map(mov => <tr key={mov.id}>
                          <td>{mov.tipo}</td>
                          <td>
                            <span className={`${styles["natureza-badge"]} ${mov.natureza === "Receita" ? styles["natureza-receita"] : styles["natureza-despesa"]}`}>
                              {mov.natureza}
                            </span>
                          </td>
                          <td className={styles["valor-cel"]}>
                            {Number(mov.valor).toFixed(2)} €
                          </td>
                          <td>{formatarData(mov.data)}</td>
                          <td className={styles["obs-cel"]}>{mov.observacao || "—"}</td>
                          <td className={styles["autor-cel"]}>
                            <span>{mov.autor_registo || "Não registado"}</span>
                            {mov.ultima_operacao === "Alterado" && <small>Alterado por {mov.autor_ultima_operacao || "Não registado"}</small>}
                          </td>
                          <td><div className={styles["movement-actions"]}>
                            {!soLeitura && <>
                                <button className={styles["edit-btn"]} title="Editar" disabled={saving} onClick={() => handleEdit(mov)}>
                                  <i className="ri-pencil-line"></i>
                                </button>
                                <button className={styles["delete-btn"]} title="Eliminar" disabled={saving} onClick={() => handleDelete(mov.id)}>
                                  <i className="ri-delete-bin-line"></i>
                                </button>
                              </>}
                          </div></td>
                        </tr>)}
                  </tbody>
                </table>}
              {!loading && totalPaginas > 1 && <nav className={styles["pagination"]} aria-label="Paginação dos movimentos">
                  <button type="button" className={styles["pagination-arrow"]} onClick={() => setPaginaAtual(Math.max(paginaVisivel - 1, 1))} disabled={paginaVisivel === 1} aria-label="Página anterior">
                    &larr; Anterior
                  </button>
                  <div className={styles["pagination-pages"]}>
                    {Array.from({
          length: totalPaginas
        }, (_, index) => index + 1).map(pagina => <button type="button" key={pagina} className={`${styles["pagination-page"]} ${pagina === paginaVisivel ? styles.active : ""}`} onClick={() => setPaginaAtual(pagina)} aria-label={`Página ${pagina}`} aria-current={pagina === paginaVisivel ? "page" : undefined}>
                        {pagina}
                      </button>)}
                  </div>
                  <button type="button" className={styles["pagination-arrow"]} onClick={() => setPaginaAtual(Math.min(paginaVisivel + 1, totalPaginas))} disabled={paginaVisivel === totalPaginas} aria-label="Página seguinte">
                    Seguinte &rarr;
                  </button>
                </nav>}
            </div>;
}
