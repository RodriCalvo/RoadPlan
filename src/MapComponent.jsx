import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import Header from "./Header";
import "./MapComponent.css";

const containerStyle = {
  width: "100%",
  height: "100%", // Cambia esto para que tome el 100% del contenedor .map-content
};

const center = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires

const estaciones = [
  { nombre: "Estación Shell", lat: -34.7, lng: -58.5 },
  { nombre: "YPF", lat: -35.0, lng: -58.9 },
  { nombre: "Axion", lat: -34.7, lng: -58.8 },
];

const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [destino, setDestino] = useState(null);
  const [inicio, setInicio] = useState(null);
  const [ruta, setRuta] = useState(null);
  const [posicionAuto, setPosicionAuto] = useState(null);
  const [puntosRuta, setPuntosRuta] = useState([]);
  const [indice, setIndice] = useState(0);
  const [autonomia, setAutonomia] = useState("");
  const [showPrivacidad, setShowPrivacidad] = useState(false);
  const [deseaDormir, setDeseaDormir] = useState(null);
  const [mensajeError, setMensajeError] = useState("");
  const [totalDistanceKm, setTotalDistanceKm] = useState(null);
  const [puntosParada, setPuntosParada] = useState([]);
  const [panelVisible, setPanelVisible] = useState(true);
  const [nombreUbicacionActual, setNombreUbicacionActual] = useState("");
  const [nombreDestino, setNombreDestino] = useState("");

  // Obtiene la ubicación actual
  const obtenerUbicacionActual = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nuevaUbicacion = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUbicacionActual(nuevaUbicacion);
        setInicio(nuevaUbicacion);
        setPosicionAuto(nuevaUbicacion);
      },
      () => alert("No se pudo obtener la ubicación")
    );
  };

  // Nueva función para manejar la petición de ubicación con privacidad
  const handleUbicacionClick = () => {
    setShowPrivacidad(true);
  };

  const handlePermitirUbicacion = () => {
    setShowPrivacidad(false);
    obtenerUbicacionActual();
  };

  const handleCancelarUbicacion = () => {
    setShowPrivacidad(false);
  };

  // Establecer el destino cuando se hace click en el mapa
  const establecerDestino = (e) => {
    if (!e.latLng) {
      alert("Error al seleccionar destino");
      return;
    }
    setDestino({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  // Función para calcular la distancia entre dos puntos (Haversine)
  function distanciaEnKm(p1, p2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLng = (p2.lng - p1.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Lógica para dividir la ruta en segmentos de autonomía
  function calcularPuntosParada(overviewPath, autonomiaKm) {
    if (!overviewPath || overviewPath.length === 0 || !autonomiaKm) return [];
    let puntos = [];
    let distanciaAcumulada = 0;
    let ultimoPunto = { lat: overviewPath[0].lat(), lng: overviewPath[0].lng() };
    for (let i = 1; i < overviewPath.length; i++) {
      const actual = { lat: overviewPath[i].lat(), lng: overviewPath[i].lng() };
      const d = distanciaEnKm(ultimoPunto, actual);
      distanciaAcumulada += d;
      if (distanciaAcumulada >= autonomiaKm) {
        puntos.push(actual);
        distanciaAcumulada = 0;
      }
      ultimoPunto = actual;
    }
    return puntos;
  }

  // Calcular la ruta óptima considerando tráfico
  const calcularRuta = () => {
    if (!inicio || !destino) {
      alert("Por favor, selecciona tanto el inicio como el destino.");
      return;
    }
  
    const directionsService = new google.maps.DirectionsService();
  
    directionsService.route(
      {
        origin: inicio,
        destination: destino,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setRuta(result);
          const puntos = result.routes[0].overview_path.map((p) => ({
            lat: p.lat(),
            lng: p.lng(),
          }));
          setPuntosRuta(puntos);
          setIndice(0);
          setPosicionAuto(puntos[0]);

          // Calcular la distancia total en km
          const legs = result.routes[0].legs;
          const totalMetros = legs.reduce((acc, leg) => acc + leg.distance.value, 0);
          const totalKm = totalMetros / 1000;
          setTotalDistanceKm(totalKm);

          // Calcular puntos de parada según autonomía
          const autonomiaKm = parseFloat(autonomia);
          const puntosParada = calcularPuntosParada(result.routes[0].overview_path, autonomiaKm);
          setPuntosParada(puntosParada);

          // Guardar el historial después de obtener la ruta
          guardarHistorial();
        } else {
          alert("No se pudo calcular la ruta");
        }
      }
    );
  };
  

  const guardarHistorial = () => {
    if (inicio && destino) {
      const nuevoViaje = {
        inicio: inicio,
        destino: destino,
        fecha: new Date().toISOString(), // Fecha y hora del viaje
      };
  
      // Obtener los historiales existentes del localStorage
      const historiales = JSON.parse(localStorage.getItem("historiales")) || [];
  
      // Agregar el nuevo viaje al historial
      historiales.push(nuevoViaje);
  
      // Guardar el historial actualizado en localStorage
      localStorage.setItem("historiales", JSON.stringify(historiales));
    } else {
      alert("Debe seleccionar un inicio y un destino para el viaje.");
    }
  };
  

  // Simulación del movimiento del auto en la ruta
  /*useEffect(() => {
    if (puntosRuta.length > 0 && indice < puntosRuta.length - 1) {
      const interval = setInterval(() => {
        setIndice((prev) => {
          const nextIndex = prev + 1;
          setPosicionAuto(puntosRuta[nextIndex]);
          return nextIndex;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [puntosRuta, indice]);*/

  // Cambia el botón de calcular ruta para ocultar el panel
  const handleCalcularRuta = () => {
    if (!destino) {
      setMensajeError("Por favor, selecciona un destino en el mapa.");
      setTimeout(() => setMensajeError(""), 2500);
      return;
    }
    calcularRuta();
    setPanelVisible(false); // Oculta el panel al calcular ruta
  };

  // Nueva función para obtener el nombre del lugar
  const obtenerNombreLugar = (lat, lng, setNombre) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        // Extraer solo calle y número
        const components = results[0].address_components;
        let street = "";
        let number = "";

        components.forEach((comp) => {
          if (comp.types.includes("route")) street = comp.long_name;
          if (comp.types.includes("street_number")) number = comp.long_name;
        });

        if (street && number) {
          setNombre(`${street} ${number}`);
        } else if (street) {
          setNombre(street);
        } else {
          setNombre(results[0].formatted_address.split(",")[0]); // fallback: primer parte
        }
      } else {
        setNombre(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    });
  };

  useEffect(() => {
    if (ubicacionActual) {
      obtenerNombreLugar(ubicacionActual.lat, ubicacionActual.lng, setNombreUbicacionActual);
    }
  }, [ubicacionActual]);

  useEffect(() => {
    if (destino) {
      obtenerNombreLugar(destino.lat, destino.lng, setNombreDestino);
    }
  }, [destino]);

  return (
    <div className="map-container">
      <Header />
      <div className="map-content">
        {panelVisible && (
          <div className="controls-panel">
            <div className="autonomia-group">
              <span className="autonomia-label">Autonomía del vehículo</span>
              <div className="autonomia-input-row">
                <input
                  type="number"
                  id="autonomia"
                  value={autonomia}
                  onChange={(e) => setAutonomia(e.target.value)}
                  className="autonomia-input"
                  placeholder="0"
                  min="0"
                />
                <span className="autonomia-unidad">kms</span>
              </div>
            </div>
            <div className="ubicacion-group">
              <span className="ubicacion-label">Ubicación actual</span>
              <div
                className="ubicacion-caja"
                onClick={handleUbicacionClick}
                tabIndex={0}
                role="button"
                style={{ cursor: 'pointer' }}
              >
                {ubicacionActual
                  ? nombreUbicacionActual || "Cargando..."
                  : 'Seleccionar ubicación'}
              </div>
            </div>
            <div className="ubicacion-group">
              <span className="ubicacion-label">Destino</span>
              <div
                className="ubicacion-caja"
                onClick={() => setDestino(null)}
                tabIndex={0}
                role="button"
                style={{ cursor: 'pointer' }}
              >
                {destino
                  ? nombreDestino || "Cargando..."
                  : 'Seleccionar destino en el mapa'}
              </div>
            </div>
            <div className="dormir-group">
              <span className="dormir-label">¿Desea dormir?</span>
              <div className="dormir-botones-row">
                <button
                  className={`dormir-btn${deseaDormir === true ? ' selected' : ''}`}
                  onClick={() => setDeseaDormir(true)}
                  type="button"
                >
                  Sí
                </button>
                <button
                  className={`dormir-btn${deseaDormir === false ? ' selected' : ''}`}
                  onClick={() => setDeseaDormir(false)}
                  type="button"
                >
                  No
                </button>
              </div>
            </div>
            <div className="panel-actions">
              <button
                className="calcular-btn"
                onClick={handleCalcularRuta}
                disabled={!destino}
              >
                Calcular ruta
              </button>
              {mensajeError && <div className="mensaje-error">{mensajeError}</div>}
              {totalDistanceKm && (
                <div className="distancia-total">
                  Distancia total: {totalDistanceKm.toFixed(1)} km
                </div>
              )}
            </div>
          </div>
        )}
        {!panelVisible && (
          <button
            className="show-panel-btn"
            onClick={() => setPanelVisible(true)}
            aria-label="Mostrar panel"
            title="Mostrar panel de búsqueda"
          >
            &#9776;
          </button>
        )}

        {/* Modal de privacidad */}
        {showPrivacidad && (
          <div className="modal-privacidad-overlay">
            <div className="modal-privacidad">
              <h2>Privacidad de tu ubicación</h2>
              <p>Necesitamos tu ubicación para calcular rutas seguras y confiables.<br />¿Deseas compartir tu ubicación con RoadPlan?</p>
              <div className="modal-privacidad-botones">
                <button className="modal-btn permitir" onClick={handlePermitirUbicacion}>Permitir</button>
                <button className="modal-btn cancelar" onClick={handleCancelarUbicacion}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Mapa debajo */}
        <LoadScript googleMapsApiKey="AIzaSyCC3AO9wWo39j38UP4cAJ5ZF1Hyjf4clOo">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={ubicacionActual || center}
            zoom={12}
            onLoad={(map) => setMap(map)}
            onClick={establecerDestino}
          >
            {ubicacionActual && <Marker position={ubicacionActual} title="Ubicación Actual" />}
            {destino && <Marker position={destino} title="Destino" />}
            {ruta && <DirectionsRenderer directions={ruta} options={{ suppressMarkers: true }} />}
            {estaciones.map((est, idx) => (
              <Marker key={idx} position={{ lat: est.lat, lng: est.lng }} title={est.nombre} />
            ))}
            {posicionAuto && <Marker position={posicionAuto} title="Auto en Movimiento" />}
            {/* Marcadores de puntos de parada */}
            {puntosParada.map((p, idx) => (
              <Marker
                key={`parada-${idx}`}
                position={p}
                title={`Parada ${idx + 1}`}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default MapComponent;
