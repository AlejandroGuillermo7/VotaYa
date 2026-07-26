import { useState } from "react"; 
import Login from "./pages/Login"; 
import Inicio from "./pages/Inicio"; 
import Register from "./pages/Register"; 
import ResetPassword from "./pages/ResetPassword"; 
import "./App.css"; 

function App() { 
  const [pantalla, setPantalla] = useState("login"); 
  const [sesionActiva, setSesionActiva] = useState(
    Boolean(localStorage.getItem("token"))
  ); 

  function cerrarSesion() { 
    localStorage.removeItem("token"); 
    setSesionActiva(false); 
    setPantalla("login");
  } 

  if (sesionActiva) { 
    return <Inicio alCerrarSesion={cerrarSesion} />; 
  } 

  if (pantalla === "registro") {
    return (
      <Register 
        alRegistrar={() => setPantalla("login")} 
        irALogin={() => setPantalla("login")} 
      />
    );
  }

  if (pantalla === "recuperar") {
    return (
      <ResetPassword 
        irALogin={() => setPantalla("login")} 
      />
    );
  }

  return (
    <Login 
      alIniciarSesion={() => setSesionActiva(true)} 
      irARegistro={() => setPantalla("registro")} 
      irARecuperar={() => setPantalla("recuperar")}
    />
  );
} 

export default App;