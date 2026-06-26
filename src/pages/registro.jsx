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
    perfil: "Membro",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.password !==
      formData.confirmarPassword
    ) {
      alert("As palavras-passe não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: formData.nome,
            email: formData.email,
            password: formData.password,
            perfil: formData.perfil,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        // CORRIGIDO: faltava setLoading(false) neste return —
        // o botão ficava bloqueado em "A criar..." indefinidamente
        setLoading(false);
        return;
      }

      alert("Conta criada com sucesso.");

      // CORRIGIDO: setLoading(false) chamado ANTES de navigate()
      // para evitar "state update on unmounted component" —
      // navigate() desmonta o componente imediatamente
      setLoading(false);
      navigate("/login");

    } catch (error) {
      console.error(error);
      alert("Erro ao comunicar com o servidor.");
      setLoading(false);
    }

    // CORRIGIDO: removido setLoading(false) aqui em baixo —
    // já é tratado em cada ramo acima de forma explícita e segura
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">

        <span className="login-bg-animate"></span>

        <div className="login-form-box">

          <div className="login-logo">
            <img
              src={logo}
              alt="Centro Trindade"
            />
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
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label>Palavra-passe</label>
              <i className="ri-lock-fill"></i>
            </div>

            <div className="login-input-box">
              <input
                type="password"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleChange}
                required
              />
              <label>Confirmar Palavra-passe</label>
              <i className="ri-lock-password-fill"></i>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
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

          <h2>
            CENTRO
            <br />
            TRINDADE
          </h2>

          <p>
            Crie a sua conta para aceder ao ERP.
          </p>

        </div>

      </div>
    </div>
  );
}

export default Registo;