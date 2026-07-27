import { useState } from "react";

import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import Elecciones from "./pages/Elecciones";
import MisVotos from "./pages/MisVotos";
import CrearVotacion from "./pages/CrearVotacion";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

import "./App.css";

function App() {
  const [pantalla, setPantalla] = useState("login");

  const [sesionActiva, setSesionActiva] = useState(
    Boolean(localStorage.getItem("token")),
  );

  const [ruta, setRuta] = useState(window.location.pathname);

  function navegarA(nuevaRuta) {
    window.history.pushState({}, "", nuevaRuta);
    setRuta(nuevaRuta);
  }

  function iniciarSesion() {
    setSesionActiva(true);

    window.history.replaceState(
      {},
      "",
      "/mis-elecciones",
    );

    setRuta("/mis-elecciones");
  }

  function cerrarSesion() {
    localStorage.removeItem("token");

    setSesionActiva(false);
    setPantalla("login");

    window.history.replaceState({}, "", "/");
    setRuta("/");
  }

  if (sesionActiva) {
    if (ruta === "/elecciones") {
      return (
        <Elecciones
          alCerrarSesion={cerrarSesion}
          alCrearVotacion={() => navegarA("/crear-votacion")}
        />
      );
    }

    if (ruta === "/mis-votos") {
      return (
        <MisVotos
          alCerrarSesion={cerrarSesion}
        />
      );
    }

    if (ruta === "/crear-votacion") {
      return (
        <CrearVotacion
          alVolver={() => navegarA("/elecciones")}
          alCrearExitosa={() => navegarA("/elecciones")}
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