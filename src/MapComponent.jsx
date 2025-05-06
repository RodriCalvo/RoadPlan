import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import Header from "./Header";
import "./MapComponent.css";

const containerStyle = {
  width: "100%",
  height: "calc(100vh - 80px)",
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
  useEffect(() => {
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
  }, [puntosRuta, indice]);

  return (
    <div className="map-container">
      <Header />
      <div className="map-controls">
        <button className="map-button" onClick={obtenerUbicacionActual}>
          Seleccionar Ubicación Actual
        </button>
        <button className="map-button" onClick={() => setDestino(null)}>
          Seleccionar Destino
        </button>
        <button 
          className="map-button" 
          onClick={calcularRuta}
          disabled={!inicio || !destino}
        >
          Iniciar Viaje
        </button>
      </div>

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
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapComponent;
