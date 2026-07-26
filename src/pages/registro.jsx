import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/styles/home/login.css";
import logo from "../assets/img/principal.png";

function Registo() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmarPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmarPassword) {
      alert("As palavras-passe não coincidem.");
      return;
    }

    if (formData.password.length < 8) {
      alert("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        setLoading(false);
        return;
      }

      alert("Conta criada com sucesso.");
      setLoading(false);
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Erro ao comunicar com o servidor.");
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

          <h2>Registo</h2>

          <form onSubmit={handleSubmit}>

            <div className="login-input-box">
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
              <label>Nome</label>
              <i className="ri-user-fill"></i>
            </div>

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
                minLength={8}
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

            <div className="login-input-box">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
              <label>Confirmar Palavra-passe</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
              >
                <i className={showConfirmPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
              </button>
            </div>

            <p className="registo-nota">
              A conta é criada com o perfil <strong>Membro</strong>. Para aceder com outro
              perfil (Secretaria, Tesouraria, Pastor ou Administrador), contacte um
              administrador do sistema depois de criar a conta.
            </p>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "A criar..." : "Criar Conta"}
            </button>

            <div className="login-link">
              <p>
                Já possui conta?
                <Link to="/login"> Entrar</Link>
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
          <p>Crie a sua conta para aceder ao ERP.</p>
        </div>

      </div>
    </div>
  );
}

export default Registo;
