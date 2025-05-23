import React, { useState, useEffect } from "react";
import "./TripHistory.css";

async function obtenerDireccion(lat, lng) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCC3AO9wWo39j38UP4cAJ5ZF1Hyjf4clOo`
    );
    const data = await response.json();
    return data.results[0]?.formatted_address || "Dirección no encontrada";
  } catch (error) {
    console.error("Error al obtener dirección:", error);
    return "Error al obtener dirección";
  }
}

const TripHistory = () => {
  const [historiales, setHistoriales] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarHistorialConDirecciones() {
      setCargando(true);
      const historialesGuardados = JSON.parse(localStorage.getItem("historiales")) || [];

      const historialesConNombres = await Promise.all(
        historialesGuardados.map(async (viaje) => {
          const inicioNombre = await obtenerDireccion(viaje.inicio.lat, viaje.inicio.lng);
          const destinoNombre = await obtenerDireccion(viaje.destino.lat, viaje.destino.lng);
          return { ...viaje, inicioNombre, destinoNombre };
        })
      );

      setHistoriales(historialesConNombres);
      setCargando(false);
    }

    cargarHistorialConDirecciones();
  }, []);

  return (
    <div className="trip-history">
      <div className="history-content">
        <h1>Historial de Viajes</h1>
        {cargando ? (
          <div className="empty-state">
            <p>Cargando historial...</p>
          </div>
        ) : historiales.length === 0 ? (
          <div className="empty-state">
            <p>No hay viajes registrados aún.</p>
          </div>
        ) : (
          <ul>
            {historiales.map((viaje, index) => (
              <li key={index}>
                <h3>Viaje #{historiales.length - index}</h3>
                <p><strong>Inicio:</strong> {viaje.inicioNombre}</p>
                <p><strong>Destino:</strong> {viaje.destinoNombre}</p>
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

