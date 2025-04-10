import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Inicio from "./Inicio";
import MapComponent from "./MapComponent";
import TripHistory from "./TripHistory";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Inicio /></Layout>} />
      <Route path="/mapa" element={<Layout><MapComponent /></Layout>} />
      <Route path="/historial" element={<Layout><TripHistory /></Layout>} />
    </Routes>
  );
}

export default App;

/*
  Componente principal, la que renderiza la estructura de la app. Define el flujo entre los componentes.
  Inicio, luego MapComponent.
*/