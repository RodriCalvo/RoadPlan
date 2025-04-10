import React from "react";
import "./TripHistory.css";

const TripHistory = () => {
  return (
    <div className="trip-history">
      <div className="history-content">
        <h1>Historial de Viajes</h1>
        <div className="empty-state">
          <p>No hay viajes registrados aún.</p>
        </div>
      </div>
    </div>
  );
};

export default TripHistory; 