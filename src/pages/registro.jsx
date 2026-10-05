import { Link } from "react-router-dom";
import "../assets/styles/home/login.css";
import logo from "../assets/img/principal.png";

function Registo() {
  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-form-box">
          <div className="login-logo"><img src={logo} alt="Centro Trindade" /></div>
          <h2>Acesso por convite</h2>
          <p>As contas são criadas pelo administrador da igreja. Contacte a equipa responsável para solicitar acesso.</p>
          <p>Se recebeu um convite por email, abra o link para definir a sua palavra-passe.</p>
          <div className="login-link">
            <p>Já tem conta? <Link to="/login">Entrar</Link></p>
            <p className="back-home"><Link to="/">Voltar à página inicial</Link></p>
          </div>
        </div>
        <div className="login-info-text">
          <h2>CENTRO<br />TRINDADE</h2>
          <p>Acesso à área da igreja.</p>
        </div>
      </div>
    </div>
  );
}

export default Registo;
