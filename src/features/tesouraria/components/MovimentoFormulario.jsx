import { TIPOS, dataHoje } from "../tesouraria.model";
import styles from "../tesouraria.module.css";
export default function MovimentoFormulario({
  editId,
  form,
  handleChange,
  handleSubmit,
  saving,
  limparCampos
}) {
  return <div className={styles["form-box"]}>
              <h2>{editId !== null ? "Editar Movimento" : "Novo Movimento"}</h2>

              <div className={styles["form-grid"]}>

                <div>
                  <label>Natureza</label>
                  <select name="natureza" value={form.natureza} onChange={handleChange}>
                    <option value="Receita">Receita</option>
                    <option value="Despesa">Despesa</option>
                  </select>
                </div>

                <div>
                  <label>Tipo</label>
                  <select name="tipo" value={form.tipo} onChange={handleChange}>
                    {TIPOS[form.natureza].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label>Valor (€)</label>
                  <input type="number" name="valor" step="0.01" min="0.01" placeholder="0.00" value={form.valor} onChange={handleChange} />
                </div>

                <div>
                  <label>Data</label>
                  <input type="date" name="data" max={dataHoje()} value={form.data} onChange={handleChange} />
                </div>

                <div className={styles["campo-full"]}>
                  <label>Observações</label>
                  <input type="text" name="observacao" placeholder="Opcional" value={form.observacao} onChange={handleChange} />
                </div>
                {editId !== null && <div className={styles["campo-full"]}>
                  <label htmlFor="motivo-tesouraria">Motivo da alteração</label>
                  <input id="motivo-tesouraria" name="motivo" value={form.motivo} onChange={handleChange} maxLength={500} />
                </div>}

              </div>

              <div className={styles["form-actions"]}>
                <button className={styles["btn-save"]} onClick={handleSubmit} disabled={saving}>
                  {saving ? "A guardar..." : editId !== null ? "Atualizar" : "Guardar"}
                </button>
                <button className={styles["btn-clear"]} onClick={limparCampos} disabled={saving}>
                  Limpar
                </button>
              </div>
            </div>;
}
