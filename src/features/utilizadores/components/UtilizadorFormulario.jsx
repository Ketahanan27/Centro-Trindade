import styles from "../utilizadores.module.css";
import { createPortal } from "react-dom";
import { PERFIS, DESCRICAO_PERFIL } from "../utilizadores.model";
export default function UtilizadorFormulario({
  editId,
  formData,
  onChange,
  onSubmit,
  onClose,
  loading
}) {
  return createPortal(<div className={styles["modal"] + " " + styles["active"] + " " + styles["users-modal"]} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles["modal-content"]} role="dialog" aria-modal="true" aria-label="Ficha de utilizador">
        <div className={styles["modal-header"]}>
          <h2>{editId ? "Editar Utilizador" : "Novo Utilizador"}</h2>
          <button aria-label="Fechar" onClick={onClose}><i className="ri-close-line"></i></button>
        </div>

        <form onSubmit={onSubmit}>
          <div className={styles["grid"]}>

            <div className={styles["field"]}>
              <label>Nome *</label>
              <input type="text" name="nome" required value={formData.nome} onChange={onChange} />
            </div>

            <div className={styles["field"]}>
              <label>Email *{!editId && " (receberá convite)"}</label>
              <input type="email" name="email" required disabled={!!editId} value={formData.email} onChange={onChange} />
            </div>

            <div className={styles["field"]}>
              <label>Perfil</label>
              <select name="perfil" value={formData.perfil} onChange={onChange}>
                {PERFIS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div className={styles["field"]}>
              <label>Estado</label>
              <select name="estado" value={formData.estado} onChange={onChange}>
                <option>Ativo</option>
                <option>Inativo</option>
              </select>
            </div>

          </div>

          <div className={styles["perfil-descricao"]}>
            <i className="ri-information-line"></i>
            {DESCRICAO_PERFIL[formData.perfil]}
          </div>

          {!editId && <p className={styles["form-nota"]}>
              📧 Será enviado um email para o utilizador configurar a sua palavra-passe.
            </p>}

          <div className={styles["form-actions"]}>
            <button type="submit" className={styles["save"]} disabled={loading}>
              {loading ? "A guardar..." : editId ? "Atualizar" : "Criar e Enviar Convite"}
            </button>
            <button type="button" className={styles["cancel"]} onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>, document.body);
}
