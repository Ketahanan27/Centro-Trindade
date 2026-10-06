import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import "../assets/styles/home/login.css";
import logo from "../assets/img/principal.png";

function RedefinirPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ nova_password: "", confirmar: "" });
  const [loading, setLoading] = useState(false);
  const [resultado, setStatus] = useState(null);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConf, setMostrarConf] = useState(false);

  const status = token ? resultado : { tipo: "erro", texto: "Link inválido. Verifica se copiaste o endereço completo do email." };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !token) return;

    if (form.nova_password !== form.confirmar) {
      setStatus({ tipo: "erro", texto: "As palavras-passe não coincidem." });
      return;
    }

    if (form.nova_password.length < 8) {
      setStatus({ tipo: "erro", texto: "A palavra-passe deve ter pelo menos 8 caracteres." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/auth/redefinir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nova_password: form.nova_password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus({ tipo: "erro", texto: data?.message ?? "Erro ao redefinir. Tente novamente." });
        return;
      }

      setStatus({ tipo: "sucesso", texto: data?.message ?? "Palavra-passe atualizada com sucesso!" });
      setTimeout(() => navigate("/login"), 2500);
    } catch {
      setStatus({ tipo: "erro", texto: "Não foi possível ligar ao servidor." });
    } finally {
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
