import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import logo from "../assets/img/principal.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar" ref={navRef}>

      <div className="nav-logo">
        <Link to="/" onClick={closeMenu}>
          <img src={logo} alt="Logo Trindade" />
        </Link>
      </div>

      <ul className={`nav-links ${menuOpen ? "is-open" : ""}`}>

        <li className="link">
          <Link to="/" onClick={closeMenu}>
            Trindade
          </Link>
        </li>

        <li className="link">
          <Link to="/escola120" onClick={closeMenu}>
            Academia 120
          </Link>
        </li>

        <li className="link">
          <Link to="/calendario" onClick={closeMenu}>
            Agenda
          </Link>
        </li>

        <li className="link">
          <Link to="/contribua" onClick={closeMenu}>
            Contribua
          </Link>
        </li>

        <li className="link mobile-only">
          <Link to="/formulario" onClick={closeMenu}>
            Contactos
          </Link>
        </li>

        <li className="link mobile-only">
          <Link to="/login" onClick={closeMenu}>
            Login
          </Link>
        </li>

      </ul>

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
        aria-label="Menu"
      >
        <i className={menuOpen ? "ri-close-line" : "ri-menu-line"}></i>
      </div>

    </nav>
  );
}

export default Navbar;
