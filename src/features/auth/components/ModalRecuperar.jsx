import { createPortal } from 'react-dom';
import { useRecuperarPassword } from '../hooks/useRecuperarPassword.js';

function ModalRecuperar({ onClose }) {
  const { email, setEmail, loading, status, handleSubmit } = useRecuperarPassword();

  return createPortal(
    <div className="recuperar-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="recuperar-box">

        <div className="recuperar-header">
          <h3>Recuperar Palavra-passe</h3>
          <button className="recuperar-close" onClick={onClose} aria-label="Fechar">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <p className="recuperar-desc">
          Insira o seu email. Se existir uma conta associada, receberá um link para redefinir a palavra-passe.
        </p>

        {status && (
          <div className={`recuperar-status recuperar-status--${status.tipo}`}>
            {status.tipo === "sucesso" ? "✓ " : "✗ "}{status.texto}
          </div>
        )}

        {status?.tipo !== "sucesso" && (
          <form onSubmit={handleSubmit}>
            <div className="login-input-box" style={{ marginTop: "28px" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
              <label>Email</label>
              <i className="ri-mail-fill"></i>
            </div>

            <button
              type="submit"
              className="login-btn"
              style={{ marginTop: "24px" }}
              disabled={loading}
            >
              {loading ? "A enviar..." : "Enviar link de recuperação"}
            </button>
          </form>
        )}

        {status?.tipo === "sucesso" && (
          <button className="login-btn" style={{ marginTop: "24px" }} onClick={onClose}>
            Fechar
          </button>
        )}

      </div>
    </div>,
    document.body
  );
}

export default ModalRecuperar;
