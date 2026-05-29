import { Link } from "react-router-dom";

import logo from "../assets/img/image1.png";

function Navbar() {
  return (
    <nav>
      <div className="nav-logo">
        <Link to="/">
          <img src={logo} alt="Logo Trindade" />
        </Link>
      </div>

      <ul className="nav-links">
        <li className="link">
          <Link to="/">Trindade</Link>
        </li>

        <li className="link">
          <Link to="/escola120">Escola 120</Link>
        </li>

        <li className="link">
          <a href="#galeria">Galeria</a>
        </li>

        <li className="link">
          <Link to="/quem-somos">Quem Somos</Link>
        </li>

        <li className="link">
          <Link to="/contribua">Contribua</Link>
        </li>
      </ul>

      <Link to="/quem-somos">
        <button className="btn">Contactos</button>
      </Link>
    </nav>
  );
}

export default Navbar;