import { Link } from "react-router-dom";

import logo from "../assets/img/principal.png";

function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="column">
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>

          <div className="socials">
            <a
              href="https://www.youtube.com/@trindade3oficial/featured"
              target="_blank"
              rel="noreferrer"
            >
              <i className="ri-youtube-line"></i>
            </a>

            <a
              href="https://www.instagram.com/trindade3oficial/"
              target="_blank"
              rel="noreferrer"
            >
              <i className="ri-instagram-line"></i>
            </a>

            <a href="#">
              <i className="ri-whatsapp-line"></i>
            </a>
          </div>
        </div>

        <div className="column">
          <h4>Quem Somos</h4>

          <a href="#galeria">Galeria</a>

          <a href="#">Canais</a>
        </div>

        <div className="column">
          <h4>Contactos</h4>

          <Link to="/formulario">Formulário</Link>

          <a href="#">Política de Privacidade</a>

          <a href="#">Termos e Condições</a>
        </div>
      </footer>
      <div className="copyright">
        Copyright © 2025 TRINDADE. All Rights Reserved.
      </div>
    </>
  );
}

export default Footer;