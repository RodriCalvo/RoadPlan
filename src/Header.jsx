import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import logo from "/logo.png";

const Header = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="RoadPlan Logo" className="logo" />
        <h1 className="logo-text">RoadPlan</h1>
      </div>
      <nav className="nav">
        <ul className="nav-list">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/mapa">Mapa</Link></li>
          <li><Link to="/historial">Historial</Link></li>
          <li><a href="#about">Acerca de</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
