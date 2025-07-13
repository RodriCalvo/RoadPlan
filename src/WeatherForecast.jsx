import React, { useEffect, useState } from "react";

function WeatherForecast({ puntosRuta, fecha }) {
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    async function fetchWeather() {
      if (!puntosRuta || puntosRuta.length === 0) return;
      const promesas = puntosRuta.map(async (p) => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lng}&hourly=temperature_2m,precipitation,weathercode&start_date=${fecha}&end_date=${fecha}`;
        const res = await fetch(url);
        const data = await res.json();
        return {
          lat: p.lat,
          lng: p.lng,
          temp: data.hourly?.temperature_2m?.[12], // Mediodía
          precip: data.hourly?.precipitation?.[12],
          code: data.hourly?.weathercode?.[12]
        };
      });
      const resultados = await Promise.all(promesas);
      setForecast(resultados);
    }
    fetchWeather();
  }, [puntosRuta, fecha]);

  return (
    <div className="weather-forecast-panel">
      <h3>Pronóstico del clima en tu recorrido</h3>
      {forecast.length === 0 && <div>Cargando clima...</div>}
      <ul>
        {forecast.map((f, idx) => (
          <li key={idx}>
            <strong>Parada {idx + 1}:</strong> {f.temp ? `${f.temp}°C` : "Sin datos"} | 
            {f.precip ? `Precipitación: ${f.precip}mm` : ""} | 
            {f.code ? `Código clima: ${f.code}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WeatherForecast;