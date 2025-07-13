import React, { useState } from "react";
import GoogleMapReact from "google-map-react";

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const defaultCenter = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires
const defaultZoom = 12;

// Componente marcador personalizado
const Marker = ({ text, onClick }) => (
  <div onClick={onClick} style={{ cursor: "pointer", color: "#d32f2f", fontWeight: "bold" }}>
    ⛽
    <div style={{ fontSize: 10, background: "white", borderRadius: 4, padding: "2px 4px", marginTop: 2 }}>{text}</div>
  </div>
);

// Componente para dibujar la polyline SVG
const Polyline = ({ points }) => {
  if (!points.length) return null;
  const path = points.map(p => `${p.x},${p.y}`).join(" ");
  return (
    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <polyline points={path} fill="none" stroke="#1976d2" strokeWidth="4" />
    </svg>
  );
};

const MapComponentGoogleMapReact = () => {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [autonomia, setAutonomia] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [stations, setStations] = useState([]);
  const [infoEstacion, setInfoEstacion] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(defaultZoom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Geocodifica una dirección a lat/lng
  const geocode = async (address) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "OK") {
      return data.results[0].geometry.location;
    }
    throw new Error("No se pudo geocodificar la dirección");
  };

  // Llama a la Directions API y obtiene la polyline
  const fetchRoute = async (from, to) => {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&mode=driving&key=${MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "OK") {
      const points = decodePolyline(data.routes[0].overview_polyline.points);
      return points;
    }
    throw new Error("No se pudo obtener la ruta");
  };

  // Decodifica una polyline de Google
  function decodePolyline(encoded) {
    let points = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return points;
  }

  // Busca estaciones de servicio cerca de la ruta usando Places API (REST)
  const fetchStations = async (routePoints, autonomiaKm) => {
    // Tomar puntos cada X km según autonomía
    const interval = Math.max(1, Math.floor(routePoints.length / 10));
    const searchPoints = routePoints.filter((_, i) => i % interval === 0);
    let allStations = [];
    for (const p of searchPoints) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${p.lat},${p.lng}&radius=${Math.min(autonomiaKm * 1000, 50000)}&type=gas_station&key=${MAPS_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "OK") {
        allStations = allStations.concat(data.results);
      }
    }
    // Eliminar duplicados por place_id
    const unique = {};
    allStations.forEach(s => { unique[s.place_id] = s; });
    return Object.values(unique);
  };

  // Proyecta lat/lng a pixeles del mapa
  const project = (lat, lng, map, maps) => {
    if (!map || !maps) return { x: 0, y: 0 };
    const scale = Math.pow(2, map.zoom);
    const proj = maps.Projection.fromLatLngToPoint(new maps.LatLng(lat, lng));
    return {
      x: proj.x * scale,
      y: proj.y * scale,
    };
  };

  // Maneja el submit del formulario
  const handleCalcular = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setRouteCoords([]);
    setStations([]);
    setInfoEstacion(null);
    try {
      const from = await geocode(origen);
      const to = await geocode(destino);
      setCenter(from);
      setZoom(12);
      const points = await fetchRoute(from, to);
      setRouteCoords(points);
      if (autonomia && parseFloat(autonomia) > 0) {
        const estaciones = await fetchStations(points, parseFloat(autonomia));
        setStations(estaciones);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex" }}>
      <div style={{ width: 350, padding: 20, background: "#f5f5f5", borderRight: "1px solid #ddd" }}>
        <h2>Planificador de Ruta</h2>
        <form onSubmit={handleCalcular}>
          <div>
            <label>Dirección de salida:</label>
            <input value={origen} onChange={e => setOrigen(e.target.value)} required style={{ width: "100%" }} />
          </div>
          <div>
            <label>Dirección de llegada:</label>
            <input value={destino} onChange={e => setDestino(e.target.value)} required style={{ width: "100%" }} />
          </div>
          <div>
            <label>Autonomía (km):</label>
            <input type="number" value={autonomia} onChange={e => setAutonomia(e.target.value)} required min={1} style={{ width: "100%" }} />
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: 10 }}>Calcular ruta</button>
        </form>
        {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
        {loading && <div style={{ marginTop: 10 }}>Calculando...</div>}
        {infoEstacion && (
          <div style={{ marginTop: 20, background: "#fff", padding: 10, borderRadius: 6, boxShadow: "0 2px 8px #0001" }}>
            <h4>{infoEstacion.name}</h4>
            <div>{infoEstacion.vicinity}</div>
            {infoEstacion.rating && <div>⭐ {infoEstacion.rating}</div>}
            <button onClick={() => setInfoEstacion(null)} style={{ marginTop: 8 }}>Cerrar</button>
          </div>
        )}
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: MAPS_API_KEY }}
          center={center}
          zoom={zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => {
            // Para dibujar la polyline SVG, se puede usar un overlay aquí si se desea
          }}
        >
          {/* Marcadores de ruta: inicio y fin */}
          {routeCoords.length > 0 && (
            <Marker lat={routeCoords[0].lat} lng={routeCoords[0].lng} text="Inicio" />
          )}
          {routeCoords.length > 1 && (
            <Marker lat={routeCoords[routeCoords.length - 1].lat} lng={routeCoords[routeCoords.length - 1].lng} text="Destino" />
          )}
          {/* Marcadores de estaciones */}
          {stations.map(est => (
            <Marker
              key={est.place_id}
              lat={est.geometry.location.lat}
              lng={est.geometry.location.lng}
              text={est.name}
              onClick={() => setInfoEstacion(est)}
            />
          ))}
        </GoogleMapReact>
        {/* Polyline SVG sobre el mapa (opcional, requiere proyección de puntos) */}
        {/* Aquí podrías renderizar la polyline si implementas la proyección de lat/lng a pixeles */}
      </div>
    </div>
  );
};

export default MapComponentGoogleMapReact; 