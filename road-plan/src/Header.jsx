import React from "react";
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
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#acerca">Acerca de</a></li>
          <li><a href="#plataforma">Plataforma</a></li>
          <li><a href="#colabora">Colaborá</a></li>
          <li><a href="#difusion">Difusión</a></li>
          <li><a href="#empresas">Empresas</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
