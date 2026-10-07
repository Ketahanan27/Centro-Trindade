import styles from "../agenda.module.css";
export default function EventoFormulario({
  eventoEmEdicaoId,
  formulario,
  setFormulario,
  hoje,
  criarEvento,
  guardarAlteracao,
  eliminarEvento,
  limparFormulario
}) {
  return <div className={styles["agenda-editor"]}>
            <div className={styles["event-form"]}>
              <h3><i className="ri-edit-box-line" aria-hidden="true" /> {eventoEmEdicaoId ? "Editar atividade" : "Nova atividade"}</h3>
              <div className={styles["agenda-form-grid"]}>
                <label className={styles["agenda-field-wide"]}>Título<input type="text" maxLength={150} placeholder="Nome do culto ou atividade" value={formulario.titulo} onChange={e => setFormulario({
            ...formulario,
            titulo: e.target.value
          })} /></label>
                <label>Data<input type="date" value={formulario.data_evento} min={eventoEmEdicaoId ? undefined : hoje} onChange={e => setFormulario({
            ...formulario,
            data_evento: e.target.value
          })} /></label>
                <label>Hora<input type="time" value={formulario.hora_evento} onChange={e => setFormulario({
            ...formulario,
            hora_evento: e.target.value
          })} /></label>
                <label className={styles["agenda-field-wide"]}>Local<input type="text" placeholder="Local da atividade" value={formulario.local_evento} onChange={e => setFormulario({
            ...formulario,
            local_evento: e.target.value
          })} /></label>
                <label className={styles["agenda-field-wide"]}>Descrição<textarea rows={3} value={formulario.descricao} onChange={e => setFormulario({
            ...formulario,
            descricao: e.target.value
          })} /></label>
                <label>Estado<select value={formulario.estado} onChange={e => setFormulario({
            ...formulario,
            estado: e.target.value
          })}><option>Agendado</option><option>Concluído</option><option>Cancelado</option></select></label>
                <label>Visibilidade<select value={formulario.publico ? "publico" : "interno"} onChange={e => setFormulario({
            ...formulario,
            publico: e.target.value === "publico"
          })}><option value="interno">Interno</option><option value="publico">Público</option></select></label>
              </div>
              <p className={styles["agenda-visibility-note"]}>Eventos públicos agendados divulgam o título, descrição, data, hora e local.</p>
            </div>
            <div className={styles["crud-buttons"]}>
              <button className={styles["btn-create"]} onClick={criarEvento}><i className="ri-add-line" aria-hidden="true" /> Criar</button>
              <button className={styles["btn-edit"]} disabled={!eventoEmEdicaoId} onClick={guardarAlteracao}><i className="ri-pencil-line" aria-hidden="true" /> Guardar alteração</button>
              <button className={styles["btn-delete"]} disabled={!eventoEmEdicaoId} onClick={eliminarEvento}><i className="ri-delete-bin-line" aria-hidden="true" /> Eliminar</button>
              <button className={styles["btn-clear"]} onClick={limparFormulario}>Limpar</button>
            </div>
          </div>;
}
