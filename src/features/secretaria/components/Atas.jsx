import { useAtas } from "../hooks/useAtas";
import styles from "../secretaria.module.css";
export default function Atas() {
  const {
    soLeitura,
    search,
    setSearch,
    showModal,
    setShowModal,
    showDetails,
    setShowDetails,
    selectedMeeting,
    editId,
    formData,
    handleChange,
    resetForm,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleSelect,
    handleView,
    handlePrint,
    filteredMeetings
  } = useAtas();
  return <div className={styles["secretaria-container"] + " " + styles["secretaria-managed"]}>

      {soLeitura && <div className={styles["banner-leitura"]}>
          <i className="ri-eye-line"></i>
          Modo visualização — não tem permissão para criar ou editar reuniões.
        </div>}

      <div className={styles["page-header"]}>
        <h1>Reuniões e Atas</h1>

        {!soLeitura && <div className={styles["header-actions"]}>
            <button onClick={() => {
          resetForm();
          setShowModal(true);
        }}>
              <i className="ri-add-line"></i>
              Nova Reunião
            </button>
          </div>}
      </div>
      <div className={styles["secretaria-toolbar"]}>
      <div className={styles["search-box"]}>
        <input type="text" placeholder="Pesquisar reunião..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      </div>

      <div className={styles["meeting-counter"]}>
        Total: {filteredMeetings.length} reunião(ões)
      </div>

      <div className={styles["table-wrapper"]}>
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Data</th>
              <th>Hora</th>
              <th>Local</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredMeetings.length === 0 ? <tr>
                <td colSpan="5" className={styles["empty-row"]}>Nenhuma reunião registada.</td>
              </tr> : filteredMeetings.map(r => <tr key={r.id} className={selectedMeeting?.id === r.id ? styles["selected-row"] : ""} onClick={() => handleSelect(r)}>
                  <td>{r.titulo}</td>
                  <td>{new Date(r.data).toLocaleDateString("pt-PT")}</td>
                  <td>{r.hora}</td>
                  <td>{r.local}</td>
                  <td><div className={styles["secretaria-row-actions"]}>
                    <button className={styles["view"]} aria-label="Consultar ata" title="Consultar ata" onClick={() => handleView(r)}>
                      <i className="ri-eye-line"></i>
                    </button>

                    {!soLeitura && <>
                        <button className={styles["edit"]} aria-label="Editar registo" title="Editar" onClick={() => handleEdit(r)}>
                          <i className="ri-pencil-line"></i>
                        </button>
                        <button className={styles["delete"]} aria-label="Eliminar registo" title="Eliminar" onClick={() => handleDelete(r.id)}>
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
              <h2>{editId !== null ? "Editar Reunião" : "Registar Reunião"}</h2>
              <button aria-label="Fechar" onClick={() => {
            resetForm();
            setShowModal(false);
          }}>
                <i className="ri-close-line"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles["grid"]}>
                <div className={styles["field"]}>
                  <label>Título</label>
                  <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required />
                </div>

                <div className={styles["field"]}>
                  <label>Data</label>
                  <input type="date" name="data" value={formData.data} onChange={handleChange} required />
                </div>

                <div className={styles["field"]}>
                  <label>Hora</label>
                  <input type="time" name="hora" value={formData.hora} onChange={handleChange} required />
                </div>

                <div className={styles["field"]}>
                  <label>Local</label>
                  <input type="text" name="local" value={formData.local} onChange={handleChange} />
                </div>

                <div className={styles["field"] + " " + styles["full"]}>
                  <label>Participantes</label>
                  <textarea name="participantes" value={formData.participantes} onChange={handleChange} />
                </div>

                <div className={styles["field"] + " " + styles["full"]}>
                  <label>Resumo</label>
                  <textarea name="resumo" value={formData.resumo} onChange={handleChange} />
                </div>

                <div className={styles["field"] + " " + styles["full"]}>
                  <label>Decisões</label>
                  <textarea name="decisoes" value={formData.decisoes} onChange={handleChange} />
                </div>

                <div className={styles["field"] + " " + styles["full"]}>
                  <label>Observações</label>
                  <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} />
                </div>
              </div>

              <div className={styles["form-actions"]}>
                <button type="submit" className={styles["save"]}>Guardar</button>
                <button type="button" className={styles["cancel"]} onClick={resetForm}>Limpar</button>
              </div>
            </form>
          </div>
        </div>}

      {showDetails && selectedMeeting && <div className={styles["modal"] + " " + styles["active"]}>
          <div className={styles["modal-content"]} role="dialog" aria-modal="true" aria-label="Detalhes da ata">
            <div className={styles["modal-header"]}>
              <h2>Detalhes</h2>
              <button aria-label="Fechar detalhes" onClick={() => setShowDetails(false)}>
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className={styles["details-item"]}>
              <strong>Título:</strong> {selectedMeeting.titulo}
            </div>

            <div className={styles["details-item"]}>
              <strong>Data:</strong>{" "}
              {new Date(selectedMeeting.data).toLocaleDateString("pt-PT")}
            </div>

            <div className={styles["details-item"]}>
              <strong>Hora:</strong> {selectedMeeting.hora}
            </div>

            <div className={styles["details-item"]}>
              <strong>Local:</strong> {selectedMeeting.local}
            </div>

            <div className={styles["details-item"]}>
              <strong>Participantes:</strong>{" "}
              {selectedMeeting.participantes}
            </div>

            <div className={styles["details-item"]}>
              <strong>Resumo:</strong> {selectedMeeting.resumo}
            </div>

            <div className={styles["details-item"]}>
              <strong>Decisões:</strong> {selectedMeeting.decisoes}
            </div>

            <div className={styles["details-item"]}>
              <strong>Observações:</strong>{" "}
              {selectedMeeting.observacoes}
            </div>

            <div className={styles["form-actions"]}>
              <button type="button" className={styles["save"]} onClick={handlePrint}>
                Imprimir Ata
              </button>
            </div>
          </div>
        </div>}

    </div>;
}
