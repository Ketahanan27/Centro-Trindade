import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../assets/styles/home/login.css";
import logo from "../assets/img/principal.png";

function ModalRecuperar({ onClose }) {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [status,  setStatus]  = useState(null); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res  = await fetch("/api/auth/recuperar", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus({ tipo: "erro", texto: data?.message ?? "Erro ao enviar. Tente novamente." });
      } else {
        setStatus({ tipo: "sucesso", texto: data?.message ?? "Email enviado! Verifique a sua caixa de correio." });
      }
    } catch {
      setStatus({ tipo: "erro", texto: "Não foi possível ligar ao servidor." });
    } finally {
      setLoading(false);
    }
  };

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

        {}
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
          <button
            className="login-btn"
            style={{ marginTop: "24px" }}
            onClick={onClose}
          >
            Fechar
          </button>
        )}

      </div>
    </div>,
    document.body
  );
}

function Login() {
  const navigate                    = useNavigate();
  const [searchParams]              = useSearchParams();
  const sessaoExpirada              = searchParams.get("sessao") === "expirada";

  const [formData,         setFormData]         = useState({ email: "", password: "" });
  const [loading,          setLoading]          = useState(false);
  const [showPassword,     setShowPassword]     = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [erroLogin,        setErroLogin]        = useState(null);

  useEffect(() => {
    if (sessaoExpirada) {
      setErroLogin("A sua sessão expirou. Por favor inicie sessão novamente.");
    }
  }, [sessaoExpirada]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErroLogin(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErroLogin(null);

    try {
      const response = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        setErroLogin(err?.message ?? `Erro ${response.status}: servidor indisponível.`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      navigate("/dashboard");

    } catch (error) {
      console.error("ERRO login:", error);
      setErroLogin("Não foi possível ligar ao servidor. Confirma que o backend está a correr.");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">

        <span className="login-bg-animate"></span>

        <div className="login-form-box">

          <div className="login-logo">
            <img src={logo} alt="Centro Trindade" />
          </div>

          <h2>Login</h2>

          {}
          {erroLogin && (
            <div className="login-erro">
              <i className="ri-close-circle-line"></i> {erroLogin}
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

              {}
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

      {}
      {mostrarRecuperar && (
        <ModalRecuperar onClose={() => setMostrarRecuperar(false)} />
      )}

    </div>
  );
}

export default Login;
