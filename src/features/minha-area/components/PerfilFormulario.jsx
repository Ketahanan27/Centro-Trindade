import styles from "../minha-area.module.css";
import { CAMPOS_PERFIL } from '../minha-area.model';
import { formatarData } from '../../../utils/data';
export default function PerfilFormulario({
  membro,
  formData,
  handleChange,
  handleSave,
  saving
}) {
  return <form className={styles["minha-area-form"]} onSubmit={handleSave}>
      <h2 className={styles["personal-form-title"]}>Dados pessoais</h2>
      <div className={styles["minha-area-grid"]}>
        {CAMPOS_PERFIL.map(campo => <div key={campo.nome} className={styles["minha-area-card"]}>
            <div className={styles["minha-area-card-icon"]}><i className={campo.icone} /></div>
            <div className={styles["minha-area-card-body"]}>
              <span className={styles["minha-area-card-label"]}>{campo.rotulo}</span>
              {!campo.editavel ? <span className={styles["minha-area-card-valor"]}>
                  {campo.data ? formatarData(membro[campo.nome]) : membro[campo.nome] || '—'}
                </span> : campo.opcoes ? <select className={styles["minha-area-input"]} name={campo.nome} value={formData[campo.nome]} onChange={handleChange} disabled={saving}>
                  <option value="">Selecionar</option>
                  {campo.opcoes.map(opcao => <option key={opcao}>{opcao}</option>)}
                </select> : <input className={styles["minha-area-input"]} name={campo.nome} value={formData[campo.nome]} onChange={handleChange} inputMode={campo.nome === 'telemovel' ? 'numeric' : 'text'} maxLength={campo.maxLength} placeholder={campo.nome === 'codigo_postal' ? '1234-567' : campo.rotulo} disabled={saving} />}
            </div>
          </div>)}
      </div>
      <div className={styles["minha-area-form-actions"]}>
        <button className={styles["btn-save"]} type="submit" disabled={saving}>
          {saving ? 'A guardar…' : 'Guardar alterações'}
        </button>
      </div>
    </form>;
}
