import { Link } from "react-router-dom";


function Footer() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-links compact">
          <div className="footer-section">
            <h4>Informação</h4>
            <Link to="/">Início</Link>
            <a href="#galeria">Galeria</a>
            <Link to="/calendario">Agenda</Link>
            <Link to="/formulario">Formulário</Link>
          </div>

          <div className="footer-section contactos">
            <h4>Contactos</h4>
            <a href="tel:+351000000000">+351 000 000 000</a>
            <a href="mailto:contato@trindade3oficial.com">contato@trindade3oficial.com</a>
            <span>Av. Principal, Bairro Trindade, Portugal</span>
            <span>Seg-Sex • 09h00 - 18h00</span>
          </div>

          <div className="footer-section">
            <h4>Recursos</h4>
            <Link to="../politica-privacidade">Política de Privacidade</Link>
            <Link to="/termos-condicoes">Termos e Condições</Link>
            <a href="#">Perguntas Frequentes</a>
            <a href="#">Doações</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-socials">
          <span>Conecte-se conosco</span>
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
            <a href="#" aria-label="WhatsApp">
              <i className="ri-whatsapp-line"></i>
            </a>
          </div>
        </div>

        <div className="footer-copy">
          <p>© {anoAtual} Centro Trindade. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
