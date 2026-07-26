import { useState } from "react";
import iconLogo from "../assets/icons/icon-login.png";
import iconEmail from "../assets/icons/icon-email.svg";
import iconPassword from "../assets/icons/icon-password.svg";
import "./ResetPassword.css";

function ResetPassword({ irALogin }) {
  const [paso, setPaso] = useState("solicitar");

  const [correo, setCorreo] = useState("");
  const [token, setToken] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");

  const [mensajeExito, setMensajeExito] = useState("");
  const [error, setError] = useState("");
  const [errorPasswordInput, setErrorPasswordInput] = useState("");
  const [cargando, setCargando] = useState(false);

  const validarContrasenaRealTime = (val) => {
    setNuevaContrasena(val);
    if (!val) {
      setErrorPasswordInput("La contraseña es requerida.");
    } else if (val.length < 8) {
      setErrorPasswordInput("Debe tener mínimo 8 caracteres.");
    } else {
      setErrorPasswordInput("");
    }
  };

  async function manejarSolicitud(e) {
    e.preventDefault();
    setError("");
    setMensajeExito("");

    if (!correo.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch("http://localhost:8080/api/recuperacion/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.mensaje || "No se pudo enviar la solicitud.");
      }

      setToken(""); 
      setMensajeExito("Código enviado a tu correo. Por favor revísalo e ingresa los datos.");
      setPaso("restablecer");

    } catch (err) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  async function manejarRestablecer(e) {
    e.preventDefault();
    setError("");
    setMensajeExito("");

    if (!token.trim()) {
      setError("Por favor ingresa el token recibido por correo.");
      return;
    }

    if (nuevaContrasena.length < 8) {
      setErrorPasswordInput("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch("http://localhost:8080/api/recuperacion/restablecer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          nuevaContrasena: nuevaContrasena,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.mensaje || "El token es inválido o ha expirado.");
      }

      setMensajeExito("¡Contraseña actualizada correctamente! Redirigiendo al Login...");
      setTimeout(() => {
        irALogin();
      }, 2500);

    } catch (err) {
      setError(err.message || "Error al restablecer la contraseña.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="loginFondo">
      <div className="loginCard">
        <div className="loginIconoTop">
          <img src={iconLogo} alt="Logo VotaYa" className="loginIconoTopImg" />
        </div>

        <h2 className="LoginTitulo">Recuperar contraseña</h2>

        {paso === "solicitar" ? (
          <form onSubmit={manejarSolicitud}>
            <p className="instruccionesTexto">
              Ingresa tu correo y te enviaremos las instrucciones.
            </p>

            <div className="loginCampo">
              <label htmlFor="correo">Correo Electrónico</label>
              <div className="loginInputConIcono">
                <img src={iconEmail} alt="" className="loginIcono" />
                <input
                  type="email"
                  id="correo"
                  value={correo}
                  placeholder="nombre@correo.com"
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="loginError">{error}</p>}

            <button type="submit" className="loginBoton" disabled={cargando}>
              {cargando ? "Enviando..." : "Continuar"}
            </button>
          </form>
        ) : (
          <form onSubmit={manejarRestablecer}>
            <p className="instruccionesTexto">
              Revisa tu correo. Ingresa el token recibido y tu nueva contraseña.
            </p>

            <div className="loginCampo">
              <label htmlFor="token">Token / Código</label>
              <div className="loginInputConIcono">
                <input
                  type="text"
                  id="token"
                  value={token}
                  placeholder="Pega tu token enviado al correo"
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
            </div>

            <div className="loginCampo">
              <label htmlFor="nuevaContrasena">Nueva Contraseña</label>
              <div className={`loginInputConIcono ${errorPasswordInput ? "campo-error" : ""}`}>
                <img src={iconPassword} alt="" className="loginIcono" />
                <input
                  type="password"
                  id="nuevaContrasena"
                  value={nuevaContrasena}
                  placeholder="Mínimo 8 caracteres"
                  onChange={(e) => validarContrasenaRealTime(e.target.value)}
                />
              </div>
              {errorPasswordInput && (
                <span className="mensajeErrorCampo">
                  {errorPasswordInput}
                </span>
              )}
            </div>

            {mensajeExito && <p className="mensajeExito">{mensajeExito}</p>}
            {error && <p className="loginError">{error}</p>}

            <button 
              type="submit" 
              className="loginBoton botonRestablecer" 
              disabled={cargando || !!errorPasswordInput}
            >
              {cargando ? "Guardando..." : "Restablecer contraseña"}
            </button>
          </form>
        )}

        <div className="loginRegistrate contenedorVolver">
          <p className="registrate volverLink" onClick={irALogin}>
            Volver al inicio de sesión
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;