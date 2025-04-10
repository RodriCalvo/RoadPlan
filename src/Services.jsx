import React from "react";
import "./Services.css";

const Services = () => {
  return (
    <section className="services">
      <h2 className="services-title">Viaja seguro con nuestros servicios</h2>
      <div className="services-grid">
        <div className="service-card">
          <h3>Planifica tu ruta</h3>
          <p>Explora el camino sugerido junto con las paradas para abastecerte de gasolina</p>
        </div>
        <div className="service-card">
          <h3>Reserva alojamiento</h3>
          <p>En caso de quererlo, te mostramos las mejores opciones para dormir en medio del viaje</p>
        </div>
        <div className="service-card">
          <h3>Te cuidamos de tormentas</h3>
          <p>Nuestra tecnología permite visualizar el clima en cada tramo del viaje</p>
        </div>
      </div>
    </section>
  );
};

export default Services; 