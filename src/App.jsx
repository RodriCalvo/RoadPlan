import React from "react";
import { Routes, Route } from "react-router-dom";
import Inicio from "./Inicio";
import MapComponent from "./MapComponent";

function App() {
  return (
    <Routes>
      <Route index element={<Inicio />} /> 
      <Route path="/mapa" element={<MapComponent />} />
    </Routes>
  );
}

export default App;

/*
  Componente principal, la que renderiza la estructura de la app. Define el flujo entre los componentes.
  Inicio, luego MapComponent.
*/