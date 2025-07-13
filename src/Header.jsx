import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "/logo.webp";
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

  // Función para scroll suave a un id
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handler para los enlaces especiales
  const handleNavClick = (e, id) => {
    e.preventDefault();
    if (window.location.pathname === "/") {
      scrollToSection(id);
    } else {
      navigate("/", { replace: false });
      setTimeout(() => scrollToSection(id), 100);
    }
    setMenuOpen(false);
  };

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
        <a href="#top" className="logo-link" onClick={e => handleNavClick(e, "top") }>
          <img src={logo} alt="Logo" className="logo" />
          <span className="logo-text">RoadPlan</span>
        </a>
      </div>
      <div className="header-right">
        <nav className="nav-links">
          <a href="#top" className="nav-link" onClick={e => handleNavClick(e, "top")}>Inicio</a>
          <Link to="/mapa" className="nav-link">Mapa</Link>
          <Link to="/historial" className="nav-link">Historial</Link>
          <a href="#about" className="nav-link" onClick={e => handleNavClick(e, "about")}>Acerca de</a>
          <a href="#contacto" className="nav-link" onClick={e => handleNavClick(e, "contacto")}>Contacto</a>
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
          <Link to="/" className="side-link" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link to="/mapa" className="side-link" onClick={() => setMenuOpen(false)}>Mapa</Link>
          <Link to="/historial" className="side-link" onClick={() => setMenuOpen(false)}>Historial</Link>
          <a href="#about" className="side-link" onClick={e => handleNavClick(e, "about")}>Acerca de</a>
          <a href="#contacto" className="side-link" onClick={e => handleNavClick(e, "contacto")}>Contacto</a>
        </nav>
      </div>
      {/* Fondo oscuro al abrir menú */}
      {menuOpen && <div className="backdrop"></div>}
    </header>
  );
};

export default Header;
