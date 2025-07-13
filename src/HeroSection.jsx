import React from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero" id="top">
      <div className="hero-content">
        <h1 className="hero-title">Planifica tu viaje con RoadPlan</h1>
        <p className="hero-subtitle">
          Encuentra la ruta más eficiente, evita el tráfico y llega a tu destino de manera segura.
        </p>
        <button className="hero-button" onClick={() => navigate("/mapa")}>
          Explorar Mapa
        </button>
      </div>
    </section>
  );
};

export default HeroSection;

