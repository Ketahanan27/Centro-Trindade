// CORRIGIDO: removido useEffect — estava importado mas nunca utilizado no componente
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/styles/home/login.css";
import logo from "../assets/img/principal.png";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login efetuado com sucesso.");
      navigate("/dashboard");

    } catch (error) {
      console.error("ERRO:", error);
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

          <h2>Login</h2>

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
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label>Palavra-passe</label>
              <i className="ri-lock-fill"></i>
            </div>

            <button type="submit" className="login-btn">
              {loading ? "A entrar..." : "Entrar"}
            </button>

            <div className="login-link">

              <p>
                Esqueceu-se da palavra-passe?
                <a href="#"> Recuperar</a>
              </p>

              <p>
                Ainda não possui conta?
                <Link to="/registo"> Registar</Link>
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
    </div>
  );
}

export default Login;