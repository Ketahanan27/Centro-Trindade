import { useVisitantes } from "../hooks/useVisitantes";
import styles from "../secretaria.module.css";
export default function Visitantes() {
  const {
    soLeitura,
    visitantes,
    search,
    setSearch,
    filtroEstado,
    setFiltroEstado,
    showModal,
    setShowModal,
    editId,
    formData,
    handleChange,
    handlePhoneChange,
    clearForm,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSelectVisitor,
    visitantesFiltrados,
    totalVisitantes,
    acompanhamento,
    membros,
    visitante,
    mostrarAcoes
  } = useVisitantes();
  return <div className={styles["visitors-container"] + " " + styles["secretaria-managed"]}>

      {soLeitura && <div className={styles["banner-leitura"]}>
          <i className="ri-eye-line"></i>
          Modo visualização — não tem permissão para editar visitantes.
        </div>}

      <div className={styles["page-header"]}>
        <h1>Acompanhamento de visitantes</h1>
        {!soLeitura && <button onClick={() => {
        clearForm();
        setShowModal(true);
      }}>Novo Visitante</button>}
      </div>

      <div className={styles["secretaria-toolbar"]}>
      <div className={styles["search-box"]}>
        <input type="text" placeholder="Pesquisar visitante..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className={styles["filter-box"]}>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option>Todos</option>
          <option>Visitante</option>
          <option>Em acompanhamento</option>
          <option>Tornou-se membro</option>
        </select>
      </div>

      </div>

      <div className={styles["stats-grid"]}>
        <div className={styles["stat-card"]}><h3>{totalVisitantes}</h3><span>Total</span></div>
        <div className={styles["stat-card"]}><h3>{acompanhamento}</h3><span>Em acompanhamento</span></div>
        <div className={styles["stat-card"]}><h3>{membros}</h3><span>Tornaram-se membros</span></div>
        <div className={styles["stat-card"]}><h3>{visitante}</h3><span>Visitante</span></div>
      </div>

      <div className={styles["table-wrapper"]}>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Data Visita</th>
              <th>Estado</th>
              {mostrarAcoes && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {visitantesFiltrados.length === 0 ? <tr>
                <td colSpan={mostrarAcoes ? 6 : 5} className={styles["empty-row"]}>
                  {visitantes.length === 0 ? "Nenhum visitante registado." : "Nenhum resultado para o filtro aplicado."}
                </td>
              </tr> : visitantesFiltrados.map(v => <tr key={v.id}>
                  <td>{v.nome}</td>
                  <td>{v.telefone}</td>
                  <td>{v.email}</td>
                  <td>{new Date(v.data_visita).toLocaleDateString("pt-PT")}</td>
                  <td><span className={styles["status"] + " " + (v.estado === "Tornou-se membro" ? styles["membro"] : v.estado === "Em acompanhamento" ? styles["acompanhamento"] : "")}>{v.estado}</span></td>
                  {mostrarAcoes && <td><div className={styles["secretaria-row-actions"]}>
                      <button className={styles["edit"]} aria-label={`Editar ${v.nome}`} title="Editar" onClick={() => handleSelectVisitor(v)}>
                        <i className="ri-pencil-line"></i>
                      </button>
                      <button className={styles["delete"]} aria-label={`Eliminar ${v.nome}`} title="Eliminar" onClick={() => handleDelete(v.id)}>
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div></td>}
                </tr>)}
          </tbody>
        </table>
      </div>

      {showModal && <div className={styles["modal"] + " " + styles["active"]}>
          <div className={styles["modal-content"]} role="dialog" aria-modal="true" aria-label="Formulário de registo">
            <div className={styles["modal-header"]}>
              <h2>{editId ? "Editar Visitante" : "Novo Visitante"}</h2>
              <button aria-label="Fechar" onClick={() => setShowModal(false)}><i className="ri-close-line"></i></button>
            </div>
            <div className={styles["grid"]}>
              <div className={styles["field"]}>
                <label>Nome</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
              </div>
              <div className={styles["field"]}>
                <label>Telefone</label>
                <input type="text" name="telefone" value={formData.telefone} onChange={handlePhoneChange} maxLength="9" required />
              </div>
              <div className={styles["field"]}>
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className={styles["field"]}>
                <label>Data da Visita</label>
                <input type="date" name="data_visita" value={formData.data_visita} onChange={handleChange} required />
              </div>
              <div className={styles["field"]}>
                <label>Convidado Por</label>
                <input type="text" name="convidado_por" value={formData.convidado_por} onChange={handleChange} required />
              </div>
              <div className={styles["field"]}>
                <label>Estado</label>
                <select name="estado" value={formData.estado} onChange={handleChange}>
                  <option>Visitante</option>
                  <option>Em acompanhamento</option>
                  <option>Tornou-se membro</option>
                </select>
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
