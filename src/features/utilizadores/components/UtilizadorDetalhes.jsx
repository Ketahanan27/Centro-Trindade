import styles from "../utilizadores.module.css";
import { createPortal } from "react-dom";
import BadgePerfil from "./BadgePerfil";
import { DESCRICAO_PERFIL } from "../utilizadores.model";
import { useConviteUtilizador } from "../hooks/useConviteUtilizador";
export default function UtilizadorDetalhes({
  user,
  onClose,
  onEdit,
  currentUserId
}) {
  const {
    resetLoading,
    handleReset
  } = useConviteUtilizador(user);
  return createPortal(<div className={styles["modal"] + " " + styles["active"] + " " + styles["users-modal"]} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles["modal-content"]} role="dialog" aria-modal="true" aria-label="Ficha de utilizador">
        <div className={styles["modal-header"]}>
          <h2>Detalhes do Utilizador</h2>
          <button aria-label="Fechar" onClick={onClose}><i className="ri-close-line"></i></button>
        </div>

        <div className={styles["details-grid-util"]}>
          <div className={styles["details-item"]}><strong>Nome</strong><span>{user.nome}</span></div>
          <div className={styles["details-item"]}><strong>Email</strong><span>{user.email}</span></div>
          <div className={styles["details-item"]}><strong>Perfil</strong><BadgePerfil perfil={user.perfil} /></div>
          <div className={styles["details-item"]}>
            <strong>Estado</strong>
            <span className={user.estado === "Ativo" ? styles["badge-ativo"] : styles["badge-inativo"]}>{user.estado}</span>
          </div>
          <div className={styles["details-item"]}><strong>Último Acesso</strong><span>{user.ultimo_acesso || "Nunca"}</span></div>
          <div className={styles["details-item"]}><strong>Criado em</strong><span>{user.criado}</span></div>
          <div className={styles["details-item"]}><strong>Convite</strong><span>{user.convite_pendente ? "Configuração pendente" : "Conta configurada"}</span></div>
        </div>

        <div className={styles["perfil-descricao"]} style={{
        marginTop: "16px"
      }}>
          <i className="ri-shield-check-line"></i>
          {DESCRICAO_PERFIL[user.perfil]}
        </div>

        {user.id !== currentUserId && <div className={styles["form-actions"]} style={{
        marginTop: "24px"
      }}>
            <button className={styles["save"]} onClick={() => {
          onClose();
          onEdit(user);
        }}>
              <i className="ri-pencil-line"></i> Editar
            </button>
            <button className={styles["cancel"]} onClick={handleReset} disabled={resetLoading || user.estado !== "Ativo"}>
              <i className="ri-refresh-line"></i>
              {resetLoading ? "A enviar..." : user.convite_pendente ? "Reenviar convite" : "Enviar Reset"}
            </button>
          </div>}
      </div>
    </div>, document.body);
}
