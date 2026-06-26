import { Link } from "react-router-dom";

import logo from "../assets/img/principal.png";

function Footer() {
  // CORRIGIDO: ano calculado dinamicamente — estava hardcoded em '2025'
  // mas já estamos em 2026 (e ficará sempre desatualizado se não for dinâmico)
  const anoAtual = new Date().getFullYear();

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
              aria-label="YouTube"
            >
              <i className="ri-youtube-line"></i>
            </a>

            <a
              href="https://www.instagram.com/trindade3oficial/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <i className="ri-instagram-line"></i>
            </a>

            {/* WhatsApp: substituir "#" pelo link real quando disponível */}
            <a
              href="#"
              aria-label="WhatsApp"
            >
              <i className="ri-whatsapp-line"></i>
            </a>
          </div>
        </div>

        <div className="column">
          <h4>Quem Somos</h4>
          <a href="#galeria">Galeria</a>
          {/* "Canais": substituir "#" pelo link real quando disponível */}
          <a href="https://www.youtube.com/@trindade3oficial/featured">Canais</a>
        </div>

        <div className="column">
          <h4>Contactos</h4>
          <Link to="/formulario">Formulário</Link>
          <a href="#">Política de Privacidade</a>
          <a href="#">Termos e Condições</a>
        </div>

      </footer>

      {/* CORRIGIDO: ano hardcoded '2025' substituído por variável dinâmica */}
      <div className="copyright">
        Copyright © {anoAtual} TRINDADE. All Rights Reserved.
      </div>
    </>
  );
}

export default Footer;