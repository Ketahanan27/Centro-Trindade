import { Link } from "react-router-dom";
import { useState } from "react";

import logo from "../assets/img/principal.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">
          <img src={logo} alt="Logo Trindade" />
        </Link>
      </div>

      <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
        <li className="link">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Trindade
          </Link>
        </li>

        <li className="link">
          <Link to="/escola120" onClick={() => setMenuOpen(false)}>
            Academia 120
          </Link>
        </li>

        <li className="link">
          <Link to="/contribua" onClick={() => setMenuOpen(false)}>
            Contribua
          </Link>
        </li>

        {/* Apenas Mobile */}
        <li className="link mobile-only">
          <Link to="/formulario" onClick={() => setMenuOpen(false)}>
            Contactos
          </Link>
        </li>

        <li className="link mobile-only">
          <Link to="/login" onClick={() => setMenuOpen(false)}>
            Login
          </Link>
        </li>
      </ul>

      {/* Apenas Desktop */}
      <div className="desktop-actions">
        <Link to="/formulario" className="icon-btn">
          <i className="ri-mail-line"></i>
        </Link>

        <Link to="/login" className="icon-btn">
          <i className="ri-user-3-line"></i>
        </Link>
      </div>

      <div
        className="menu-icon"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <i className="ri-menu-line"></i>
      </div>
    </nav>
  );
}

export default Navbar;