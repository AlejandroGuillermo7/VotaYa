import { useState } from "react";

import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import Register from "./pages/Register";

import "./App.css";

function App() {
  const [pantalla, setPantalla] = useState("login");
  const [sesionActiva, setSesionActiva] = useState(
    Boolean(localStorage.getItem("token")),
  );

  function cerrarSesion() {
    localStorage.removeItem("token");
    setSesionActiva(false);
  }

  if (sesionActiva) {
    return <Inicio alCerrarSesion={cerrarSesion} />;
  }

  return pantalla === "login" ? (
    <Login
      alIniciarSesion={() => setSesionActiva(true)}
      irARegistro={() => setPantalla("registro")}
    />
  ) : (
    <Register
      alRegistrar={() => setPantalla("login")}
      irALogin={() => setPantalla("login")}
    />
  );
}

export default App;
