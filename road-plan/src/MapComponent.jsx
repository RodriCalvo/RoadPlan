import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100vh",
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
        setPosicionAuto(nuevaUbicacion); // Inicializamos el auto en la ubicación actual
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
    console.log("Destino seleccionado:", { lat: e.latLng.lat(), lng: e.latLng.lng() });
};


  // Calcular la ruta óptima considerando tráfico
  const calcularRuta = () => {
    console.log("Inicio:", inicio, "Destino:", destino); // Verificar valores antes de calcular

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
                setPosicionAuto(puntos[0]); // Inicializa el auto en la ruta
            } else {
                alert("No se pudo calcular la ruta");
            }
        }
    );
};


  // Simulación del movimiento del auto en la ruta
  useEffect(() => {
    if (puntosRuta.length > 0 && indice < puntosRuta.length - 1) {
      const interval = setInterval(() => {
        setIndice((prev) => {
          const nextIndex = prev + 1;
          setPosicionAuto(puntosRuta[nextIndex]); // Mueve el auto
          return nextIndex;
        });
      }, 500); // Cada 500ms avanza el auto en la ruta

      return () => clearInterval(interval);
    }
  }, [puntosRuta, indice]);

  return (
    <LoadScript googleMapsApiKey="AIzaSyCC3AO9wWo39j38UP4cAJ5ZF1Hyjf4clOo">
      <div style={{ padding: "20px", zIndex: 1 }}>
        {/* Botones de acción */}
        <button onClick={obtenerUbicacionActual} style={{ margin: "10px" }}>
          Seleccionar Ubicación Actual
        </button>
        <button onClick={() => setDestino(null)} style={{ margin: "10px" }}>
          Seleccionar Destino
        </button>
        <button onClick={calcularRuta} style={{ margin: "10px" }}>
          Iniciar Viaje
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={ubicacionActual || center}
        zoom={12}
        onLoad={(map) => setMap(map)}
        onClick={establecerDestino}
      >
        {/* Mostrar la ubicación actual */}
        {ubicacionActual && <Marker position={ubicacionActual} title="Ubicación Actual" />}

        {/* Mostrar el destino */}
        {destino && <Marker position={destino} title="Destino" />}

        {/* Si hay una ruta, renderizamos DirectionsRenderer */}
        {ruta && <DirectionsRenderer directions={ruta} options={{ suppressMarkers: true }} />}

        {/* Marcar estaciones de servicio en el mapa */}
        {estaciones.map((est, idx) => (
          <Marker key={idx} position={{ lat: est.lat, lng: est.lng }} title={est.nombre} />
        ))}

        {/* Mostrar el auto en movimiento */}
        {posicionAuto && <Marker position={posicionAuto} title="Auto en Movimiento" />}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
