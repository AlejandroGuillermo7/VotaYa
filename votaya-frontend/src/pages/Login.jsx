import {
  useEffect,
  useRef,
  useState,
} from "react";

import iconLogo from "../assets/icons/icon-login.png";
import iconEmail from "../assets/icons/icon-email.svg";
import iconPassword from "../assets/icons/icon-password.svg";

import { peticionApi } from "../api/clienteApi";

import "./Login.css";

function Login({
  alIniciarSesion,
  irARegistro,
  irARecuperar,
}) {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [erroresCampos, setErroresCampos] =
    useState({});
  const [cargando, setCargando] =
    useState(false);

  const contenedorGoogle = useRef(null);

  useEffect(() => {
    let temporizador;
    let intentos = 0;

    function cargarBotonGoogle() {
      const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId) {
        setError(
          "No se configuró VITE_GOOGLE_CLIENT_ID."
        );
        return;
      }

      if (
        !window.google?.accounts?.id ||
        !contenedorGoogle.current
      ) {
        intentos += 1;

        if (intentos < 40) {
          temporizador = setTimeout(
            cargarBotonGoogle,
            200
          );
        }

        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: manejarRespuestaGoogle,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      contenedorGoogle.current.innerHTML = "";

      window.google.accounts.id.renderButton(
        contenedorGoogle.current,
        {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 316,
          locale: "es",
        }
      );
    }

    cargarBotonGoogle();

    return () => {
      clearTimeout(temporizador);
    };
  }, []);

  async function manejarRespuestaGoogle(
    respuestaGoogle
  ) {
    if (!respuestaGoogle?.credential) {
      setError(
        "Google no devolvió una credencial válida."
      );
      return;
    }

    setCargando(true);
    setError("");

    try {
      const datos = await peticionApi(
        "/auth/google",
        {
          method: "POST",
          body: JSON.stringify({
            credential:
              respuestaGoogle.credential,
          }),
        }
      );

      if (!datos?.token) {
        throw new Error(
          "El servidor no devolvió el token de sesión."
        );
      }

      localStorage.setItem(
        "token",
        datos.token
      );

      let usuarioCompleto = {
        ...datos,
      };

      try {
        const perfil = await peticionApi(
          "/usuarios/perfil"
        );

        usuarioCompleto = {
          ...datos,
          ...perfil,
        };
      } catch (errorPerfil) {
        console.warn(
          "No se pudo cargar el perfil:",
          errorPerfil
        );
      }

      if (alIniciarSesion) {
        alIniciarSesion(
          usuarioCompleto
        );
      }
    } catch (excepcion) {
      setError(
        excepcion.message ||
          "No se pudo iniciar sesión con Google."
      );
    } finally {
      setCargando(false);
    }
  }

  function validarCampos() {
    const formato =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const nuevosErrores = {};

    if (correo.trim() === "") {
      nuevosErrores.correo = true;
    }

    if (contraseña.trim() === "") {
      nuevosErrores.contraseña = true;
    }

    if (
      correo.trim() === "" ||
      contraseña.trim() === ""
    ) {
      setError(
        "Complete todos los campos requeridos."
      );

      setErroresCampos(nuevosErrores);

      return false;
    }

    if (!formato.test(correo)) {
      setError(
        "Ingresa un correo electrónico válido."
      );

      setErroresCampos({
        correo: true,
      });

      return false;
    }

    if (contraseña.length < 8) {
      setError(
        "La contraseña debe tener al menos 8 caracteres."
      );

      setErroresCampos({
        contraseña: true,
      });

      return false;
    }

    setErroresCampos({});

    return true;
  }

  async function enviar(evento) {
    evento.preventDefault();

    setError("");

    if (!validarCampos()) {
      return;
    }

    setCargando(true);

    try {
      const datos = await peticionApi(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            correo,
            contrasena: contraseña,
          }),
        }
      );

      if (datos.token) {
        localStorage.setItem(
          "token",
          datos.token
        );
      }

      let usuarioCompleto = {
        ...datos,
      };

      try {
        const perfil = await peticionApi(
          "/usuarios/perfil"
        );

        usuarioCompleto = {
          ...datos,
          ...perfil,
        };
      } catch (errorPerfil) {
        console.warn(
          "No se pudo cargar el perfil:",
          errorPerfil
        );
      }

      if (alIniciarSesion) {
        alIniciarSesion(
          usuarioCompleto
        );
      }
    } catch (excepcion) {
      setError(
        excepcion.message ||
          "Error al conectar con el servidor."
      );
    } finally {
      setCargando(false);
    }
  }

  function limpiarError(campo) {
    if (error) {
      setError("");
    }

    if (erroresCampos[campo]) {
      setErroresCampos(
        (anteriores) => ({
          ...anteriores,
          [campo]: false,
        })
      );
    }
  }

  return (
    <div className="loginFondo">
      <div className="loginCard">
        <div className="loginIconoTop">
          <img
            src={iconLogo}
            alt="Logo de VotaYa"
            className="loginIconoTopImg"
          />
        </div>

        <h2 className="LoginTitulo">
          Inicia sesión
        </h2>

        <form onSubmit={enviar}>
          <div className="loginCampo">
            <label htmlFor="correo">
              Correo Electrónico
            </label>

            <div
              className={`loginInputConIcono ${
                erroresCampos.correo
                  ? "campo-error"
                  : ""
              }`}
            >
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

                  limpiarError("correo");
                }}
              />
            </div>
          </div>

          <div className="loginCampo">
            <label htmlFor="contraseña">
              Contraseña
            </label>

            <div
              className={`loginInputConIcono ${
                erroresCampos.contraseña
                  ? "campo-error"
                  : ""
              }`}
            >
              <img
                src={iconPassword}
                alt=""
                className="loginIcono"
              />

              <input
                type="password"
                id="contraseña"
                value={contraseña}
                placeholder="********"
                onChange={(evento) => {
                  setContraseña(
                    evento.target.value
                  );

                  limpiarError(
                    "contraseña"
                  );
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
              ? "Entrando..."
              : "Entrar"}
          </button>

          <div className="loginSeparador">
            <span>o</span>
          </div>

          <div
            ref={contenedorGoogle}
            className="loginGoogle"
          />

          <div className="loginRegistrate">
            <label>
              ¿No tienes cuenta?
            </label>

            <p
              className="registrate"
              onClick={irARegistro}
            >
              Regístrate
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;