import { useState } from "react";
import Swal from "sweetalert2";
import iconLogo from "../assets/icons/icon-login.png";
import iconEmail from "../assets/icons/icon-email.svg";
import iconPassword from "../assets/icons/icon-password.svg";
import "./Login.css";

function Login({alIniciarSesion, irARegistro, irARecuperar}) {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [erroresCampos, setErroresCampos] = useState({});
  const [cargando, setCargando] = useState(false);

  
  function validarCampos() {
    const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let nuevosErrores = {};

    if (correo.trim() === "") nuevosErrores.correo = true;
    if (contraseña.trim() === "") nuevosErrores.contraseña = true;

    if (correo.trim() === "" || contraseña.trim() === "") {
      setError("Complete todos los campos requeridos.");
      setErroresCampos(nuevosErrores);
      return false;
    }

    if (!formato.test(correo)) {
      setError("Ingresa un correo electrónico válido, ej: user@correo.com");
      setErroresCampos({ correo: true });
      return false;
    }

    if (contraseña.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setErroresCampos({ contraseña: true });
      return false;
    }

    setErroresCampos({});
    return true;
  }

async function enviar(e) {
    e.preventDefault();
    setError("");

    if (!validarCampos()) return;

    setCargando(true);

    try {
      // 1. Petición de autenticación
      const respuesta = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: correo,
          contrasena: contraseña, 
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.mensaje || "Correo o contraseña incorrectos.");
      }

      // Guardamos token de autenticación
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // 2. ⚡ PETICIÓN EXTRA: Obtener el perfil completo (incluyendo la foto de la BD)
      let usuarioCompleto = { ...data };

      try {
        const resPerfil = await fetch("http://localhost:8080/api/usuarios/perfil", {
          headers: { 
            "Authorization": `Bearer ${data.token}` 
          },
        });

        if (resPerfil.ok) {
          const perfilBD = await resPerfil.json();
          // Unimos los datos del perfil con los del login
          usuarioCompleto = { ...data, ...perfilBD };
        }
      } catch (errPerfil) {
        console.warn("No se pudo cargar la foto en el login, se usarán datos básicos:", errPerfil);
      }

      // 3. Notificamos al componente padre con la foto lista
      if (alIniciarSesion) alIniciarSesion(usuarioCompleto);

    } catch (err) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  const limpiarError = (campo) => {
    if (error) setError("");
    if (erroresCampos[campo]) {
      setErroresCampos((prev) => ({ ...prev, [campo]: false }));
    }
  };

  return (
    <div className="loginFondo">
      <div className="loginCard">
        <div className="loginIconoTop">
          <img src={iconLogo} alt="Logo" className="loginIconoTopImg" />
        </div>
        <h2 className="LoginTitulo">Inicia sesión</h2>

        <form onSubmit={enviar}>
          <div className="loginCampo">
            <label htmlFor="correo">Correo Electrónico</label>
            <div className={`loginInputConIcono ${erroresCampos.correo ? "campo-error" : ""}`}>
              <img src={iconEmail} alt="" className="loginIcono" />
              <input
                type="email"
                id="correo"
                value={correo}
                placeholder="nombre@correo.com"
                onChange={(e) => {
                  setCorreo(e.target.value);
                  limpiarError("correo");
                }}
              />
            </div>
          </div>

          <div className="loginCampo">
            <label htmlFor="contraseña">Contraseña</label>
            <div className={`loginInputConIcono ${erroresCampos.contraseña ? "campo-error" : ""}`}>
              <img src={iconPassword} alt="" className="loginIcono" />
              <input
                type="password"
                id="contraseña"
                value={contraseña}
                placeholder="********"
                onChange={(e) => {
                  setContraseña(e.target.value);
                  limpiarError("contraseña");
                }}
              />
            </div>
          </div>

          <p className="loginContraseña" onClick={irARecuperar}>
            ¿Olvidaste tu contraseña?
          </p>
          
          {error && <p className="loginError">{error}</p>}

          <button type="submit" className="loginBoton" disabled={cargando}>
            {cargando ? "Entrando..." : "Entrar"}
          </button>

          <div className="loginRegistrate">
            <label>¿No tienes cuenta?</label>
            <p className="registrate" onClick={irARegistro} style={{ cursor: "pointer" }}>
              Regístrate
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;