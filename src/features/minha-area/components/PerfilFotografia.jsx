import styles from "../minha-area.module.css";
import AuthenticatedPhoto from "../../../components/AuthenticatedPhoto";
import { AVATAR_PLACEHOLDER } from "../minha-area.model";
export default function PerfilFotografia({
  avatarSrc,
  handleFotoChange,
  fotoFile,
  handleUpload,
  uploading,
  feedback,
  membro,
  userLocal
}) {
  return <div className={styles["minha-area-card-big"]}>
          <div className={styles["minha-area-card-photo"]}>
            <AuthenticatedPhoto src={avatarSrc} fallback={AVATAR_PLACEHOLDER} alt="Foto de perfil" onError={e => {
        e.currentTarget.src = AVATAR_PLACEHOLDER;
      }} />
            <label className={styles["file-button"]}>
              <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFotoChange} />
              <i className="ri-camera-line"></i>
              <span>{fotoFile ? "Foto selecionada" : "Escolher foto"}</span>
            </label>
            <button className={styles["btn-upload"]} type="button" onClick={handleUpload} disabled={!fotoFile || uploading}>
              <i className="ri-upload-cloud-line"></i>
              <span>{uploading ? "A carregar…" : "Carregar foto"}</span>
            </button>
            <p>JPEG, PNG, GIF ou WebP estático, até 2 MB e 16 milhões de píxeis.</p>
            {feedback && <p className={"" + (styles["minha-area-feedback"] + " ") + (feedback.type === "success" ? styles["sucesso"] : styles["erro"]) + ""}>
                {feedback.message}
              </p>}
          </div>

          <div className={styles["minha-area-card-details"]}>
            <div className={styles["minha-area-card-header"]}>
              <h2>{membro?.nome || userLocal.nome || "Bem-vindo"}</h2>
              <span className={styles["personal-role"]}>{userLocal.perfil || "Membro"}</span>
            </div>
          </div>
        </div>;
}
