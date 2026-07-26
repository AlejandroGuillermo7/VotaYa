import { useState } from "react";

import Login from "./pages/Login";
import Inicio from "./pages/Inicio";

import "./App.css";

function App() {
  const [sesionActiva, setSesionActiva] = useState(
    Boolean(localStorage.getItem("token")),
  );

  function cerrarSesion() {
    localStorage.removeItem("token");
    setSesionActiva(false);
  }

  return sesionActiva ? (
    <Inicio alCerrarSesion={cerrarSesion} />
  ) : (
    <Login
      alIniciarSesion={() => {
        setSesionActiva(true);
      }}
    />
  );
}

export default App;
