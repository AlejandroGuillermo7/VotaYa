import { useState } from "react";
import iconLogo from "../assets/icons/icon-login.png";
import iconEmail from "../assets/icons/icon-email.svg";
import iconPassword from "../assets/icons/icon-password.svg";
import "./Login.css";

function Login({ onLoginExitoso }) {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  function validarCampos() {
    const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (correo.trim() === "" || contraseña.trim() === "") {
      setError("Complete el correo y la contraseña.");
      return false;
    }
    if (!formato.test(correo)) {
      setError("Ingresa un correo electrónico válido, ej: user@correo.com");
      return false;
    }
    return true;
  }

  async function enviar(e) {
    e.preventDefault();
    setError("");

    if (!validarCampos()) return;

    setCargando(true);
    try {
      /*
       * Aqui agregaremos lo que traigamos del backend
       */
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="loginFondo">
      <div className="loginCard">
        <div className="loginIconoTop">
          <img src={iconLogo} alt="" className="loginIconoTopImg" />
        </div>
        <h2 className="LoginTitulo">Inicia sesión para continuar.</h2>

        <form onSubmit={enviar}>
          <div className="loginCampo">
            <label htmlFor="correo">Correo Electrónico</label>
            <div className="loginInputConIcono">
              <img src={iconEmail} alt="" className="loginIcono" />
              <input
                type="email"
                name="email"
                id="correo"
                value={correo}
                placeholder="nombre@correo.com"
                onChange={(e) => {
                  setCorreo(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>
          </div>

          <div className="loginCampo">
            <label htmlFor="contraseña">Contraseña</label>
            <div className="loginInputConIcono">
              <img src={iconPassword} alt="" className="loginIcono" />
              <input
                type="password"
                id="contraseña"
                value={contraseña}
                placeholder="********"
                onChange={(e) => {
                  setContraseña(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>
          </div>
          <p className="loginContraseña">¿Olvidaste tu contraseña?</p>
          {error && <p className="loginError">{error}</p>}
          <button type="submit" className="loginBoton" disabled={cargando}>
            {cargando ? "Entrando" : "Entrar"}
          </button>
          <div className="loginRegistrate">
            <label>¿No tienes cuenta?</label>
            <p className="registrate">Registrate</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;