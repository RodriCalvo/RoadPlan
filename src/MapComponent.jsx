import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, DirectionsRenderer, InfoWindow } from "@react-google-maps/api";
import Header from "./Header";
import "./MapComponent.css";

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

const GOOGLE_MAP_LIBRARIES = ["places"];

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
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [nombreUbicacionActual, setNombreUbicacionActual] = useState("");
  const [nombreDestino, setNombreDestino] = useState("");
  const [estacionesCercanas, setEstacionesCercanas] = useState([]);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(null);
  const [hospedajesCercanos, setHospedajesCercanos] = useState([]);
  const [fechaViaje, setFechaViaje] = useState("");
  const [iconoClima, setIconoClima] = useState(null);

  // Limpia los marcadores clásicos anteriores
  useEffect(() => {
    if (!map || !window.google) return;

    // Limpia marcadores previos
    if (window.markers) window.markers.forEach(marker => marker.setMap(null));
    window.markers = [];

    // Ubicación actual (azul)
    if (ubicacionActual) {
      const marker = new window.google.maps.Marker({
        map,
        position: ubicacionActual,
        title: "Ubicación Actual",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        }
      });
      window.markers.push(marker);
    }

    // Destino (rojo)
    if (destino) {
      const marker = new window.google.maps.Marker({
        map,
        position: destino,
        title: "Destino",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        }
      });
      window.markers.push(marker);
    }

    // Estaciones fijas (violeta)
    /*estaciones.forEach((est) => {
      const marker = new window.google.maps.Marker({
        map,
        position: { lat: est.lat, lng: est.lng },
        title: est.nombre,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png"
        }
      });
      window.markers.push(marker);
    });*/

    // Auto en movimiento (amarillo)
    if (posicionAuto) {
      const marker = new window.google.maps.Marker({
        map,
        position: posicionAuto,
        title: "Auto en Movimiento",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
        }
      });
      window.markers.push(marker);
    }

    // Puntos de parada (azul claro)
    puntosParada.forEach((p, idx) => {
      const marker = new window.google.maps.Marker({
        map,
        position: p,
        title: `Parada ${idx + 1}`,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png"
        }
      });
      window.markers.push(marker);
    });

    // Estaciones cercanas encontradas por Places (verde)
    estacionesCercanas.forEach((est, idx) => {
      const marker = new window.google.maps.Marker({
        map,
        position: est.location,
        title:
          (est.displayName && typeof est.displayName === "object" && est.displayName.text) ||
          (typeof est.displayName === "string" && est.displayName) ||
          "Estación de servicio",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        }
      });
      marker.addListener("click", () => {
        let loc = est.location;
        if (typeof loc.lat === "function" && typeof loc.lng === "function") {
          loc = { lat: loc.lat(), lng: loc.lng() };
        }
        setEstacionSeleccionada({ ...est, location: loc, idx });
        map.panTo(loc);
        map.setZoom(16);
      });
      window.markers.push(marker);
    });

    // Hospedajes cercanos encontrados por Places (naranja)
    hospedajesCercanos.forEach((hosp, idx) => {
      const marker = new window.google.maps.Marker({
        map,
        position: hosp.location,
        title: hosp.name ||
          (hosp.displayName && hosp.displayName.text) ||
          (typeof hosp.displayName === "string" && hosp.displayName) ||
          "Hospedaje",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png"
        }
      });
      marker.addListener("click", () => {
        let loc = hosp.location;
        if (typeof loc.lat === "function" && typeof loc.lng === "function") {
          loc = { lat: loc.lat(), lng: loc.lng() };
        }
        setEstacionSeleccionada({ ...hosp, location: loc, idx, esHospedaje: true });
        map.panTo(loc);
        map.setZoom(16);
      });
      window.markers.push(marker);
    });

  }, [map, ubicacionActual, destino, posicionAuto, puntosParada, estacionesCercanas, hospedajesCercanos]);

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
      () => alert("No se pudo obtener la ubicación"),
      { enableHighAccuracy: true }
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
  
    const directionsService = new window.google.maps.DirectionsService();
  
    directionsService.route(
      {
        origin: inicio,
        destination: destino,
        travelMode: window.google.maps.TravelMode.DRIVING,
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
          const puntosParadaConNombre = puntosParada.map((p, idx) => ({
            ...p,
            nombre: `Parada ${idx + 1}`
          }));
          setPuntosParada(puntosParadaConNombre);

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
        fecha: new Date().toISOString(),
      };
      const historiales = JSON.parse(localStorage.getItem("historiales")) || [];
      historiales.push(nuevoViaje);
      localStorage.setItem("historiales", JSON.stringify(historiales));
    } else {
      alert("Debe seleccionar un inicio y un destino para el viaje.");
    }
  };

  // Cambia el botón de calcular ruta para ocultar el panel
  const [panelVisible, setPanelVisible] = useState(true);
  const handleCalcularRuta = () => {
    if (!destino) {
      setMensajeError("Por favor, selecciona un destino en el mapa.");
      setTimeout(() => setMensajeError(""), 2500);
      return;
    }
    calcularRuta();
    setPanelVisible(false);
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
          setNombre(results[0].formatted_address.split(",")[0]);
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

  useEffect(() => {
    if (map && ubicacionActual) {
      map.panTo(ubicacionActual);
      map.setZoom(15); // Puedes ajustar el zoom si lo deseas
    }
  }, [map, ubicacionActual]);

  useEffect(() => {
    if (!window.google || !puntosParada.length) return;

    async function buscarTodas() {
      let todas = [];
      for (const punto of puntosParada) {
        const results = await buscarEstacionesCercanas(punto);
        todas = todas.concat(results);
      }
      setEstacionesCercanas(todas);
    }

    buscarTodas();
  }, [puntosParada]);

  useEffect(() => {
    if (!deseaDormir || !window.google) {
      setHospedajesCercanos([]);
      return;
    }

    async function buscarTodosHospedajes() {
      let todos = [];
      // Si hay puntos de parada, busca en cada uno; si no, busca en la ubicación actual
      const puntosBusqueda = puntosParada.length ? puntosParada : [ubicacionActual].filter(Boolean);
      for (const punto of puntosBusqueda) {
        const results = await buscarLugaresCercanos(punto, "lodging", 8000);
        todos = todos.concat(results);
      }
      setHospedajesCercanos(todos);
    }

    buscarTodosHospedajes();
  }, [deseaDormir, puntosParada, ubicacionActual]);

  useEffect(() => {
    if (!fechaViaje || !ubicacionActual) {
      setIconoClima(null);
      return;
    }

    async function fetchClima() {
      const apiKey = "AIzaSyCC3AO9wWo39j38UP4cAJ5ZF1Hyjf4clOo";
      const result = await obtenerClimaGoogleWeatherAPI(ubicacionActual, fechaViaje, apiKey);
      setIconoClima(result.icon);
      // Si quieres mostrar descripción, guarda result.description
    }

    fetchClima();
  }, [fechaViaje, ubicacionActual]);

  return (
    <div className="map-container">
      <Header />
      <div className="map-content">

        {/* Barra de Origen → Paradas → Destino */}
        <div className="origen-destino-bar">
  <span className="origen-destino-label">Origen:</span>
  <span>{nombreUbicacionActual || (ubicacionActual ? `${ubicacionActual.lat.toFixed(5)}, ${ubicacionActual.lng.toFixed(5)}` : "No seleccionado")}</span>
  <span className="flecha-viaje">→</span>
  {/* Paradas de autonomía */}
  {puntosParada.filter(p => !p.esHospedaje).map((p, idx) => (
    <span key={idx} className="parada-chip">
      {p.nombre || `Parada ${idx + 1}`}
    </span>
  ))}
  {/* Paradas de hospedaje */}
  {puntosParada.filter(p => p.esHospedaje).map((p, idx) => (
    <span key={`hosp-${idx}`} className="parada-chip hospedaje-chip">{p.nombre || "Hospedaje"}</span>
  ))}
  <span className="flecha-viaje">→</span>
  <span className="origen-destino-label">Destino:</span>
  <span>{nombreDestino || (destino ? `${destino.lat.toFixed(5)}, ${destino.lng.toFixed(5)}` : "No seleccionado")}</span>
  {fechaViaje && <span className="icono-clima">{iconoClima}</span>}
</div>

        <div className={`controls-panel ${isPanelExpanded ? "expanded" : "collapsed"}`}>
          <button 
            className="panel-toggle-btn" 
            onClick={() => setIsPanelExpanded(!isPanelExpanded)}
            aria-label={isPanelExpanded ? "Colapsar panel de controles" : "Expandir panel de controles"}
          >
            <span className={`arrow-icon ${isPanelExpanded ? "up" : "down"}`}></span>
          </button>
          {isPanelExpanded && (
            <>
              <div className="autonomia-group">
                <span className="autonomia-label">Autonomía del vehículo</span>
                <div className="autonomía-input-row">
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
                    ? nombreUbicacionActual || `${ubicacionActual.lat.toFixed(5)}, ${ubicacionActual.lng.toFixed(5)}`
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
                    ? nombreDestino || `${destino.lat.toFixed(5)}, ${destino.lng.toFixed(5)}`
                    : 'Seleccionar ubicación'}
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
              <div className="clima-group">
  <div className="clima-seleccione">Seleccione fecha</div>
  <input
    type="date"
    value={fechaViaje}
    onChange={e => setFechaViaje(e.target.value)}
    className="clima-input"
  />
</div>
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
            </>
          )}
        </div>

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
        <LoadScript
          googleMapsApiKey="AIzaSyCC3AO9wWo39j38UP4cAJ5ZF1Hyjf4clOo"
          libraries={GOOGLE_MAP_LIBRARIES}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={ubicacionActual || center}
            zoom={12}
            onLoad={(mapInstance) => setMap(mapInstance)}
            onClick={establecerDestino}
          >
            {ruta && <DirectionsRenderer directions={ruta} options={{ suppressMarkers: true }} />}
            {estacionSeleccionada && estacionSeleccionada.location && (
              <InfoWindow
                position={estacionSeleccionada.location}
                onCloseClick={() => setEstacionSeleccionada(null)}
              >
                <div>
                  <strong>
                    {estacionSeleccionada.name ||
                     (estacionSeleccionada.displayName && estacionSeleccionada.displayName.text) ||
                     (typeof estacionSeleccionada.displayName === "string" && estacionSeleccionada.displayName) ||
                     (estacionSeleccionada.esHospedaje ? "Hospedaje" : "Estación de servicio")}
                  </strong>
                  {estacionSeleccionada.displayName && (
                    <div style={{fontSize: 13, color: "#444"}}>
                      {typeof estacionSeleccionada.displayName === "object"
                        ? estacionSeleccionada.displayName.text
                        : estacionSeleccionada.displayName}
                    </div>
                  )}
                  {estacionSeleccionada.businessStatus && (
                    <div style={{fontSize: 12, color: "#888"}}>
                      Estado: {estacionSeleccionada.businessStatus}
                    </div>
                  )}
                  <button
                    style={{marginTop: 6, fontSize: 13, padding: "4px 8px"}}
                    onClick={() => {
                      setPuntosParada(prev => {
                        if (estacionSeleccionada.esHospedaje) {
                          return [
                            ...prev,
                            {
                              lat: estacionSeleccionada.location.lat,
                              lng: estacionSeleccionada.location.lng,
                              nombre: "Hospedaje",
                              esHospedaje: true
                            }
                          ];
                        }
                        // Estación: reemplaza la más cercana y fuerza el nombre "YPF"
                        let minIdx = 0;
                        let minDist = Infinity;
                        prev.forEach((p, idx) => {
                          const d = Math.abs(p.lat - estacionSeleccionada.location.lat) + Math.abs(p.lng - estacionSeleccionada.location.lng);
                          if (d < minDist) {
                            minDist = d;
                            minIdx = idx;
                          }
                        });
                        const nuevo = [...prev];
                        nuevo[minIdx] = {
                          ...nuevo[minIdx],
                          lat: estacionSeleccionada.location.lat,
                          lng: estacionSeleccionada.location.lng,
                          nombre: "YPF" // <-- Forzado para visualización
                        };
                        return nuevo;
                      });
                      setEstacionSeleccionada(null);
                    }}
                  >
                    Agregar parada de {estacionSeleccionada.esHospedaje ? "hospedaje" : "la estación de servicio"}
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default MapComponent;

// Buscar estaciones cercanas usando la nueva API de Places
async function buscarLugaresCercanos(punto, tipo = "gas_station", radio = 8000) {
  const { Place, SearchNearbyRankPreference } = await window.google.maps.importLibrary("places");
  const request = {
    fields: ["displayName", "location", "businessStatus"],
    locationRestriction: {
      center: punto,
      radius: radio,
    },
    includedPrimaryTypes: [tipo],
    maxResultCount: 8,
    rankPreference: SearchNearbyRankPreference.POPULARITY,
    language: "es-419",
    region: "ar",
  };

  const { places } = await Place.searchNearby(request);
  return (places || []).map(r => ({
    displayName: r.displayName,
    location: r.location,
    businessStatus: r.businessStatus,
    esHospedaje: tipo === "lodging",
  }));
}

// Buscar estaciones cercanas usando la API clásica (fallback)
async function buscarEstacionesCercanas(punto) {
  const request = {
    location: punto,
    radius: 5000,
    types: ["gas_station"],
  };

  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        resolve(results.map(r => ({
          displayName: r.name,
          location: {
            lat: r.geometry.location.lat(),
            lng: r.geometry.location.lng(),
          },
          businessStatus: r.business_status,
        })));
      } else {
        resolve([]);
      }
    });
  });
}

// Obtener clima de Google Weather API
async function obtenerClimaGoogleWeatherAPI({ lat, lng }, fechaISO, apiKey) {
  // Convierte la fecha a año, mes, día
  const fecha = new Date(fechaISO);
  const year = fecha.getFullYear();
  const month = fecha.getMonth() + 1;
  const day = fecha.getDate();

  // Solicita 7 días para asegurar que esté el día seleccionado
  const url = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lng}&days=7`;

  const resp = await fetch(url);
  const data = await resp.json();

  // Busca el día exacto
  const forecastDay = data.forecastDays.find(fd =>
    fd.displayDate.year === year &&
    fd.displayDate.month === month &&
    fd.displayDate.day === day
  );

  if (!forecastDay) return { icon: "❓", description: "Sin datos" };

  // Usamos el pronóstico diurno
  const daytime = forecastDay.daytimeForecast;
  const conditionType = daytime.weatherCondition.type;
  const precip = daytime.precipitation?.probability?.percent || 0;

  // Lógica de iconos y descripción
  if (precip >= 60 || conditionType.includes("RAIN") || conditionType.includes("SHOWERS") || conditionType.includes("STORM")) {
    return { icon: "🌧️", description: "Lluvia" };
  }
  if (conditionType.includes("CLOUDY") || conditionType.includes("OVERCAST")) {
    return { icon: "☁️", description: "Nublado" };
  }
  if (conditionType.includes("SUNNY") || conditionType.includes("CLEAR")) {
    return { icon: "☀️", description: "Soleado" };
  }
  return { icon: "☀️", description: daytime.weatherCondition.description?.text || "Soleado" };
}
