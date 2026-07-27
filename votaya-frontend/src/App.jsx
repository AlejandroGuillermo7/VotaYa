import { useState } from "react";

import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import Elecciones from "./pages/Elecciones";
import MisVotos from "./pages/MisVotos";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

import "./App.css";

function App() {
  const [pantalla, setPantalla] = useState("login");

  const [sesionActiva, setSesionActiva] = useState(
    Boolean(localStorage.getItem("token")),
  );

  function iniciarSesion() {
    setSesionActiva(true);

    window.history.replaceState(
      {},
      "",
      "/mis-elecciones",
    );
  }

  function cerrarSesion() {
    localStorage.removeItem("token");

    setSesionActiva(false);
    setPantalla("login");

    window.history.replaceState({}, "", "/");
  }

  if (sesionActiva) {
    const rutaActual = window.location.pathname;

    if (rutaActual === "/elecciones") {
      return (
        <Elecciones
          alCerrarSesion={cerrarSesion}
        />
      );
    }

    if (rutaActual === "/mis-votos") {
      return (
        <MisVotos
          alCerrarSesion={cerrarSesion}
        />
      );
    }

    return (
      <Inicio
        alCerrarSesion={cerrarSesion}
      />
    );
  }

  if (pantalla === "registro") {
    return (
      <Register
        alRegistrar={() =>
          setPantalla("login")
        }
        irALogin={() =>
          setPantalla("login")
        }
      />
    );
  }

  if (pantalla === "recuperar") {
    return (
      <ResetPassword
        irALogin={() =>
          setPantalla("login")
        }
      />
    );
  }

  return (
    <Login
      alIniciarSesion={iniciarSesion}
      irARegistro={() =>
        setPantalla("registro")
      }
      irARecuperar={() =>
        setPantalla("recuperar")
      }
    />
  );
}

export default App;