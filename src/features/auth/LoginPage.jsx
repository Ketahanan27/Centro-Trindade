import { Link } from 'react-router-dom';
import './auth.css';
import logo from '../../assets/img/principal.png';
import ModalRecuperar from './components/ModalRecuperar.jsx';
import { useLogin } from './hooks/useLogin.js';

function Login() {
  const { formData, loading, showPassword, setShowPassword, mostrarRecuperar, setMostrarRecuperar, mensagemLogin, handleChange, handleSubmit } = useLogin();

  return (
    <div className="login-page">
      <div className="login-wrapper">

        <span className="login-bg-animate"></span>

        <div className="login-form-box">

          <div className="login-logo">
            <img src={logo} alt="Centro Trindade" />
          </div>

          <h2>Login</h2>

          {mensagemLogin && (
            <div className="login-erro">
              <i className="ri-close-circle-line"></i> {mensagemLogin}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="login-input-box">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label>Email</label>
              <i className="ri-mail-fill"></i>
            </div>

            <div className="login-input-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label>Palavra-passe</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
              >
                <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "A entrar..." : "Entrar"}
            </button>

            <div className="login-link">

              <p>
                Esqueceu-se da palavra-passe?{" "}
                <button
                  type="button"
                  className="recuperar-link-btn"
                  onClick={() => setMostrarRecuperar(true)}
                >
                  Recuperar
                </button>
              </p>

              <p style={{ color: "#666", fontSize: "13px" }}>
                Para obter acesso, contacte o administrador do sistema.
              </p>

              <p className="back-home">
                <Link to="/">
                  <i className="ri-arrow-left-line"></i>
                  Voltar para Home
                </Link>
              </p>

            </div>

          </form>

        </div>

        <div className="login-info-text">
          <h2>CENTRO<br />TRINDADE</h2>
          <p>Insira os seus acessos para aceder à sua conta.</p>
        </div>

      </div>

      {mostrarRecuperar && (
        <ModalRecuperar onClose={() => setMostrarRecuperar(false)} />
      )}

    </div>
  );
}

export default Login;
