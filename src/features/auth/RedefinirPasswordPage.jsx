import { Link } from 'react-router-dom';
import './auth.css';
import logo from '../../assets/img/principal.png';
import { useRedefinirPassword } from './hooks/useRedefinirPassword.js';

function RedefinirPassword() {
  const { token, form, loading, status, mostrarNova, setMostrarNova, mostrarConf, setMostrarConf, handleChange, handleSubmit } = useRedefinirPassword();

  return (
    <div className="login-page">
      <div className="login-wrapper">

        <span className="login-bg-animate"></span>

        <div className="login-form-box">

          <div className="login-logo">
            <img src={logo} alt="Centro Trindade" />
          </div>

          <h2>Nova Palavra-passe</h2>

          {status && (
            <div
              className={`recuperar-status recuperar-status--${status.tipo}`}
              style={{ marginBottom: "20px" }}
            >
              {status.tipo === "sucesso" ? "✓ " : "✗ "}{status.texto}
              {status.tipo === "sucesso" && (
                <span style={{ display: "block", fontSize: "13px", marginTop: "4px", opacity: .8 }}>
                  A redirecionar para o login...
                </span>
              )}
            </div>
          )}

          {token && status?.tipo !== "sucesso" && (
            <form onSubmit={handleSubmit}>

              <div className="login-input-box">
                <input
                  type={mostrarNova ? "text" : "password"}
                  name="nova_password"
                  value={form.nova_password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength={8}
                />
                <label>Nova Palavra-passe</label>
                <i
                  className={mostrarNova ? "ri-eye-off-line" : "ri-eye-line"}
                  style={{ cursor: "pointer" }}
                  onClick={() => setMostrarNova((v) => !v)}
                />
              </div>

              <div className="login-input-box">
                <input
                  type={mostrarConf ? "text" : "password"}
                  name="confirmar"
                  value={form.confirmar}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength={8}
                />
                <label>Confirmar Palavra-passe</label>
                <i
                  className={mostrarConf ? "ri-eye-off-line" : "ri-eye-line"}
                  style={{ cursor: "pointer" }}
                  onClick={() => setMostrarConf((v) => !v)}
                />
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "A guardar..." : "Guardar Nova Palavra-passe"}
              </button>

            </form>
          )}

          <div className="login-link" style={{ marginTop: "20px" }}>
            <p className="back-home">
              <Link to="/login">
                <i className="ri-arrow-left-line"></i>
                Voltar para o Login
              </Link>
            </p>
          </div>

        </div>

        <div className="login-info-text">
          <h2>CENTRO<br />TRINDADE</h2>
          <p>Defina a sua nova palavra-passe de acesso.</p>
        </div>

      </div>
    </div>
  );
}

export default RedefinirPassword;
