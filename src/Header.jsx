import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "/logo.png";
import "./Header.css";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/mapa", label: "Mapa" },
  { to: "/historial", label: "Historial" },
  { to: "#about", label: "Acerca de" },
  { to: "#contacto", label: "Contacto" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.classList.contains('menu-toggle')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo-link">
          <img src={logo} alt="Logo" className="logo" />
          <span className="logo-text">RoadPlan</span>
        </Link>
      </div>
      <div className="header-right">
        <nav className="nav-links">
          {links.map((link) => (
            <Link key={link.label} to={link.to} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          className={`menu-toggle${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>
      {/* Panel lateral */}
      <div className={`side-panel${menuOpen ? " open" : ""}`} ref={panelRef}>
        <nav className="side-nav">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="side-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {/* Fondo oscuro al abrir menú */}
      {menuOpen && <div className="backdrop"></div>}
    </header>
  );
};

export default Header;
