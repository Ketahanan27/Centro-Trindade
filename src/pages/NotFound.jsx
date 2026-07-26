import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Página não encontrada</h2>
        <p className="not-found-msg">
          A página que procura não existe ou foi movida.
        </p>
        <Link to="/" className="not-found-btn">
          <i className="ri-arrow-left-line"></i>
          Voltar à página inicial
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
