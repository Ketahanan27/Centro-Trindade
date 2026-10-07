import { useApresentacoes } from "../hooks/useApresentacoes";
import styles from "../secretaria.module.css";
export default function Apresentacoes() {
  const {
    soLeitura,
    apresentacoes,
    search,
    setSearch,
    showModal,
    setShowModal,
    editId,
    filtroAno,
    setFiltroAno,
    formData,
    handleChange,
    totalApresentacoes,
    totalCriancas,
    anosDisponiveis,
    apresentacoesFiltradas,
    clearForm,
    handleCreate,
    handleSelect,
    handleEdit,
    handleDelete
  } = useApresentacoes();
  return <div className={styles["apresentacoes-container"] + " " + styles["secretaria-managed"]}>

      {soLeitura && <div className={styles["banner-leitura"]}>
          <i className="ri-eye-line"></i>
          Modo visualização — não tem permissão para registar apresentações.
        </div>}

      <div className={styles["page-header"]}>
        <h1>Apresentação de Crianças</h1>
        {!soLeitura && <button onClick={() => {
        clearForm();
        setShowModal(true);
      }}>
            Nova Apresentação
          </button>}
      </div>

      <div className={styles["secretaria-toolbar"]}>
      <div className={styles["search-box"]}>
        <input type="text" placeholder="Pesquisar observações..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className={styles["filter-box"]}>
        <select value={filtroAno} onChange={e => setFiltroAno(e.target.value)}>
          <option>Todos</option>
          {anosDisponiveis.map(ano => <option key={ano}>{ano}</option>)}
        </select>
      </div>

      </div>

      <div className={styles["stats-grid"]}>
        <div className={styles["stat-card"]}><h3>{totalApresentacoes}</h3><span>Apresentações</span></div>
        <div className={styles["stat-card"]}><h3>{totalCriancas}</h3><span>Crianças apresentadas</span></div>
      </div>

      <div className={styles["table-wrapper"]}>
        <table>
          <thead>
            <tr><th>Data</th><th>Quantidade</th><th>Observações</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {apresentacoesFiltradas.length === 0 ? <tr>
                <td colSpan="4" className={styles["empty-row"]}>
                  {apresentacoes.length === 0 ? "Nenhum registo encontrado." : "Nenhum resultado para o filtro aplicado."}
                </td>
              </tr> : apresentacoesFiltradas.map(item => <tr key={item.id}>
                  <td>{new Date(item.data_apresentacao).toLocaleDateString("pt-PT")}</td>
                  <td><span className={styles["quantity-badge"]}>{item.quantidade}</span></td>
                  <td className={styles["obs-cell"]}>{item.observacoes}</td>
                  <td><div className={styles["secretaria-row-actions"]}>
                    {!soLeitura && <>
                        <button className={styles["edit"]} aria-label="Editar registo" title="Editar" onClick={() => handleSelect(item)}>
                          <i className="ri-pencil-line"></i>
                        </button>
                        <button className={styles["delete"]} aria-label="Eliminar registo" title="Eliminar" onClick={() => handleDelete(item.id)}>
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </>}
                  </div></td>
                </tr>)}
          </tbody>
        </table>
      </div>

      {showModal && <div className={styles["modal"] + " " + styles["active"]}>
          <div className={styles["modal-content"]} role="dialog" aria-modal="true" aria-label="Formulário de registo">
            <div className={styles["modal-header"]}>
              <h2>{editId ? "Editar Apresentação" : "Nova Apresentação"}</h2>
              <button aria-label="Fechar" onClick={() => setShowModal(false)}><i className="ri-close-line"></i></button>
            </div>
            <div className={styles["grid"]}>
              <div className={styles["field"]}>
                <label>Data da Apresentação</label>
                <input type="date" name="data_apresentacao" value={formData.data_apresentacao} onChange={handleChange} />
              </div>
              <div className={styles["field"]}>
                <label>Quantidade de Crianças</label>
                <input type="number" min="1" name="quantidade" value={formData.quantidade} onChange={handleChange} />
              </div>
              <div className={styles["field"] + " " + styles["full"]}>
                <label>Observações</label>
                <textarea rows="4" name="observacoes" value={formData.observacoes} onChange={handleChange} />
              </div>
            </div>
            <div className={styles["form-actions"]}>
              <button className={styles["save"]} onClick={editId ? handleEdit : handleCreate}>Guardar</button>
              <button className={styles["cancel"]} onClick={clearForm}>Limpar</button>
            </div>
          </div>
        </div>}

    </div>;
}
