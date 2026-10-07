import styles from "../membros.module.css";
import AuthenticatedPhoto from "../../../components/AuthenticatedPhoto";
import { formatarData } from "../../../utils/data";
import MembroModal from "./MembroModal";
export default function MembroDetalhes({
  membro,
  onFechar
}) {
  return <MembroModal titulo="Detalhes do Membro" onFechar={onFechar}>
    <div className={styles["details-wrapper"]}>
      <div className={styles["details-profile-card"]}>
        {membro.foto?.trim() ? <AuthenticatedPhoto className={styles["details-avatar"]} src={membro.foto?.trim()} alt={`Foto de perfil de ${membro.nome || "membro"}`} /> : <div className={`${styles["details-avatar"]} ${styles["details-avatar-placeholder"]}`}>
            <i className="ri-user-line"></i>
          </div>}
      </div>

      <div className={styles["details-list"]}>
        {[["Nome", membro.nome], ["Email", membro.email], ["Telemóvel", membro.telemovel], ["Nascimento", formatarData(membro.nascimento)], ["Sexo", membro.sexo], ["Estado Civil", membro.estado_civil], ["Morada", membro.morada], ["Código Postal", membro.codigo_postal], ["Entrada", formatarData(membro.entrada)], ["Batizado", membro.batizado], ["Estado", membro.estado]].map(([label, value]) => <div key={label} className={styles["details-item"]}>
            <strong>{label}:</strong> {value || "—"}
          </div>)}
      </div>
    </div>
  </MembroModal>;
}
