import React from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <h1 className="hero-title">Empieza tu viaje</h1>
      <button className="hero-button" onClick={() => navigate("/mapa")}>
        Iniciar un Viaje
      </button>
    </section>
  );
};

export default HeroSection;

