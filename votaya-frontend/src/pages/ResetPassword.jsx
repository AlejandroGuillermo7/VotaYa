import { useState } from "react";

import iconLogo from "../assets/icons/icon-login.png";
import iconEmail from "../assets/icons/icon-email.svg";
import iconPassword from "../assets/icons/icon-password.svg";

import { peticionApi } from "../api/clienteApi";

import "./ResetPassword.css";

function ResetPassword({ irALogin }) {
  const [paso, setPaso] =
    useState("solicitar");

  const [correo, setCorreo] =
    useState("");

  const [codigo, setCodigo] =
    useState("");

  const [
    nuevaContrasena,
    setNuevaContrasena,
  ] = useState("");

  const [
    confirmarContrasena,
    setConfirmarContrasena,
  ] = useState("");

  const [mensajeExito, setMensajeExito] =
    useState("");

  const [error, setError] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

  async function manejarSolicitud(evento) {
    evento.preventDefault();

    setError("");
    setMensajeExito("");

    if (!correo.trim()) {
      setError(
        "Ingresa tu correo electrónico."
      );
      return;
    }

    setCargando(true);

    try {
      const respuesta = await peticionApi(
        "/recuperacion/solicitar",
        {
          method: "POST",
          body: JSON.stringify({
            correo: correo.trim(),
          }),
        }
      );

      setCodigo("");

      setMensajeExito(
        respuesta?.mensaje ||
          "Código enviado por WhatsApp."
      );

      setPaso("restablecer");
    } catch (excepcion) {
      setError(
        excepcion.message ||
          "No se pudo enviar el código."
      );
    } finally {
      setCargando(false);
    }
  }

  async function manejarRestablecer(
    evento
  ) {
    evento.preventDefault();

    setError("");
    setMensajeExito("");

    const codigoLimpio =
      codigo.replace(/\D/g, "");

    if (!/^\d{6}$/.test(codigoLimpio)) {
      setError(
        "Ingresa el código de 6 dígitos."
      );
      return;
    }

    if (nuevaContrasena.length < 8) {
      setError(
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (
      nuevaContrasena !==
      confirmarContrasena
    ) {
      setError(
        "Las contraseñas no coinciden."
      );
      return;
    }

    setCargando(true);

    try {
      const respuesta = await peticionApi(
        "/recuperacion/restablecer",
        {
          method: "POST",
          body: JSON.stringify({
            token: codigoLimpio,
            nuevaContrasena,
          }),
        }
      );

      setMensajeExito(
        respuesta?.mensaje ||
          "Contraseña actualizada correctamente."
      );

      setTimeout(() => {
        irALogin();
      }, 2000);
    } catch (excepcion) {
      setError(
        excepcion.message ||
          "El código es inválido o expiró."
      );
    } finally {
      setCargando(false);
    }
  }

  function cambiarCodigo(evento) {
    const valor = evento.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setCodigo(valor);

    if (error) {
      setError("");
    }
  }

  return (
    <div className="loginFondo">
      <div className="loginCard">
        <div className="loginIconoTop">
          <img
            src={iconLogo}
            alt="Logo VotaYa"
            className="loginIconoTopImg"
          />
        </div>

        <h2 className="LoginTitulo">
          Recuperar contraseña
        </h2>

        {paso === "solicitar" ? (
          <form onSubmit={manejarSolicitud}>
            <p className="instruccionesTexto">
              Ingresa tu correo y enviaremos
              un código al WhatsApp registrado
              en tu cuenta.
            </p>

            <div className="loginCampo">
              <label htmlFor="correo">
                Correo electrónico
              </label>

              <div className="loginInputConIcono">
                <img
                  src={iconEmail}
                  alt=""
                  className="loginIcono"
                />

                <input
                  type="email"
                  id="correo"
                  value={correo}
                  placeholder="nombre@correo.com"
                  onChange={(evento) => {
                    setCorreo(
                      evento.target.value
                    );

                    setError("");
                  }}
                />
              </div>
            </div>

            {error && (
              <p className="loginError">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="loginBoton"
              disabled={cargando}
            >
              {cargando
                ? "Enviando..."
                : "Continuar"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={manejarRestablecer}
          >
            <p className="instruccionesTexto">
              {mensajeExito ||
                "Ingresa el código enviado por WhatsApp."}
            </p>

            <div className="loginCampo">
              <label htmlFor="codigo">
                Código de recuperación
              </label>

              <div className="loginInputConIcono">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  id="codigo"
                  value={codigo}
                  placeholder="000000"
                  maxLength={6}
                  className="entradaCodigoWhatsApp"
                  onChange={cambiarCodigo}
                />
              </div>
            </div>

            <div className="loginCampo">
              <label htmlFor="nuevaContrasena">
                Nueva contraseña
              </label>

              <div className="loginInputConIcono">
                <img
                  src={iconPassword}
                  alt=""
                  className="loginIcono"
                />

                <input
                  type="password"
                  id="nuevaContrasena"
                  value={nuevaContrasena}
                  placeholder="Mínimo 8 caracteres"
                  maxLength={72}
                  onChange={(evento) => {
                    setNuevaContrasena(
                      evento.target.value
                    );

                    setError("");
                  }}
                />
              </div>
            </div>

            <div className="loginCampo">
              <label htmlFor="confirmarContrasena">
                Confirmar contraseña
              </label>

              <div className="loginInputConIcono">
                <img
                  src={iconPassword}
                  alt=""
                  className="loginIcono"
                />

                <input
                  type="password"
                  id="confirmarContrasena"
                  value={confirmarContrasena}
                  placeholder="Repite la contraseña"
                  maxLength={72}
                  onChange={(evento) => {
                    setConfirmarContrasena(
                      evento.target.value
                    );

                    setError("");
                  }}
                />
              </div>
            </div>

            {mensajeExito && (
              <p className="mensajeExito">
                {mensajeExito}
              </p>
            )}

            {error && (
              <p className="loginError">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="loginBoton botonRestablecer"
              disabled={cargando}
            >
              {cargando
                ? "Guardando..."
                : "Restablecer contraseña"}
            </button>
          </form>
        )}

        <div className="loginRegistrate contenedorVolver">
          <p
            className="registrate volverLink"
            onClick={irALogin}
          >
            Volver al inicio de sesión
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;