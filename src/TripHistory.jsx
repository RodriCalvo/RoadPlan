import React, { useState, useEffect } from "react";
import "./TripHistory.css";

const TripHistory = () => {
  const [historiales, setHistoriales] = useState([]);

  useEffect(() => {
    // Recuperar los historiales desde localStorage
    const historialesGuardados = JSON.parse(localStorage.getItem("historiales")) || [];
    console.log("Historial recuperado:", historialesGuardados);
    setHistoriales(historialesGuardados);
  }, []);
  

  return (
    <div className="trip-history">
      <div className="history-content">
        <h1>Historial de Viajes</h1>
        {historiales.length === 0 ? (
          <div className="empty-state">
            <p>No hay viajes registrados aún.</p>
          </div>
        ) : (
          <ul>
            {historiales.map((viaje, index) => (
              <li key={index}>
                <h3>Viaje #{historiales.length - index}</h3>
                <p><strong>Inicio:</strong> {viaje.inicio.lat.toFixed(5)}, {viaje.inicio.lng.toFixed(5)}</p>
                <p><strong>Destino:</strong> {viaje.destino.lat.toFixed(5)}, {viaje.destino.lng.toFixed(5)}</p>
                <p><strong>Fecha:</strong> {new Date(viaje.fecha).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TripHistory;
