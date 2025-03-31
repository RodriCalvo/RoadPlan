import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Inicio from "./Inicio";
import MapComponent from "./MapComponent";

function App() {
  return (
    <Router basename={process.env.NODE_ENV === "production" ? "/road-plan" : "/"}>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/mapa" element={<MapComponent />} />
      </Routes>
    </Router>
  );
}

export default App;



/*
  Componente principal, la que renderiza la estructura de la app. Define el flujo entre los componentes.
  Inicio, luego MapComponent.
*/