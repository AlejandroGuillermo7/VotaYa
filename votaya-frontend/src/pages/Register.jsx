import { useState } from "react";
import iconLogo from "../assets/icons/icon-login.png";
import iconEmail from "../assets/icons/icon-email.svg";
import iconPassword from "../assets/icons/icon-password.svg";
import iconUser from "../assets/icons/icon-username.svg";
import Swal from "sweetalert2";
import "./Register.css";

function Register({ irALogin }) {
  const [nombre, setNombre] = useState("");
  const [apellidoP, setApellidoP] = useState("");
  const [apellidoM, setApellidoM] = useState("");
  const [fNacimiento, setFNacimiento] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confContraseña, setConfContraseña] = useState("");

  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [archivoFoto, setArchivoFoto] = useState(null);

  const [error, setError] = useState("");
  const [erroresCampos, setErroresCampos] = useState({});
  const [cargando, setCargando] = useState(false);

  const cambiarFoto = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setFotoPerfil(URL.createObjectURL(archivo));
      setArchivoFoto(archivo);
    }
  };

  const eliminarFoto = (e) => {
    e.stopPropagation(); 
    setFotoPerfil(null);
    setArchivoFoto(null);
    const inputElement = document.getElementById("fotoPerfilInput");
    if (inputElement) inputElement.value = "";
  };

  function validarCampos() {
    const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let nuevosErrores = {};

    if (!nombre.trim()) nuevosErrores.nombre = true;
    if (!apellidoP.trim()) nuevosErrores.apellidoP = true;
    if (!apellidoM.trim()) nuevosErrores.apellidoM = true;
    if (!fNacimiento.trim()) nuevosErrores.fNacimiento = true;
    if (!correo.trim()) nuevosErrores.correo = true;
    if (!contraseña.trim()) nuevosErrores.contraseña = true;
    if (!confContraseña.trim()) nuevosErrores.confContraseña = true;

    if (Object.keys(nuevosErrores).length > 0) {
      setError("Complete todos los campos marcados.");
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

    if (contraseña !== confContraseña) {
      setError("La contraseña confirmada no coincide.");
      setErroresCampos({ contraseña: true, confContraseña: true });
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
      const formData = new FormData();

      const usuarioData = {
        nombres: nombre,
        apellidoPaterno: apellidoP,
        apellidoMaterno: apellidoM,
        fechaNacimiento: fNacimiento,
        correo: correo,
        contrasena: contraseña,
      };

      // Adjuntamos los datos JSON
      formData.append("datos", new Blob([JSON.stringify(usuarioData)], { type: "application/json" }));

      // Si seleccionó foto, la enviamos
      if (archivoFoto) {
        formData.append("foto", archivoFoto);
      }

      const respuesta = await fetch("http://localhost:8080/api/auth/registro", {
        method: "POST",
        body: formData,
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.mensaje || "Ocurrió un error al registrar la cuenta.");
      }

      Swal.fire({
        title: "¡Cuenta creada con éxito!",
        text: "Ya puedes iniciar sesión con tus credenciales.",
        icon: "success",
        confirmButtonText: "Ir al Login",
        confirmButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed && irALogin) {
          irALogin();
        }
      });

    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.message || "No se pudo conectar con el servidor.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#d33",
      });
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
    <div className="registro-fondo-pantalla">
      <div className="tarjeta-registro">

        <div className="contenedor-logo">
          <img src={iconLogo} alt="Logo VotaYa" />
        </div>

        <h2>Crea tu cuenta</h2>
        <span className="subtitulo">Únete a VotaYa</span>
        <hr className="linea-divisora" />

        <form onSubmit={enviar}>
          
          {/* FOTO DE PERFIL DECORADA */}
          <div className="contenedor-foto-perfil">
            <div className="wrapper-foto">
              <label htmlFor="fotoPerfilInput" className="marco-foto-perfil">
                {fotoPerfil ? (
                  <img src={fotoPerfil} alt="Foto de perfil" className="foto-perfil-imagen" />
                ) : (
                  <div className="place-holder-foto">
                    <svg className="icono-avatar-svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <span className="icono-agregar-foto">+</span>
                  </div>
                )}
              </label>

              {fotoPerfil && (
                <button 
                  type="button" 
                  className="btn-eliminar-foto" 
                  onClick={eliminarFoto}
                  title="Quitar foto"
                >
                  ✕
                </button>
              )}
            </div>

            <input
              type="file"
              id="fotoPerfilInput"
              accept="image/*"
              hidden
              onChange={cambiarFoto}
            />
            <p className="texto-subir-foto">
              {fotoPerfil ? "Cambiar fotografía" : "Subir fotografía"}
            </p>
          </div>

          <div className="formulario-campo">
            <label htmlFor="nombre">Nombre(s)</label>
            <div className={`campo-con-icono ${erroresCampos.nombre ? "campo-error" : ""}`}>
              <img src={iconUser} className="icono-campo-entrada" alt="" />
              <input
                type="text"
                id="nombre"
                value={nombre}
                placeholder="Sofia Valeria"
                onChange={(e) => {
                  setNombre(e.target.value);
                  limpiarError("nombre");
                }}
              />
            </div>
          </div>

          <div className="fila-doble-campo">
            <div className="formulario-campo">
              <label htmlFor="apellidoP">Apellido Paterno</label>
              <div className={`campo-con-icono ${erroresCampos.apellidoP ? "campo-error" : ""}`}>
                <img src={iconUser} className="icono-campo-entrada" alt="" />
                <input
                  type="text"
                  id="apellidoP"
                  value={apellidoP}
                  placeholder="Riquelme"
                  onChange={(e) => {
                    setApellidoP(e.target.value);
                    limpiarError("apellidoP");
                  }}
                />
              </div>
            </div>

            <div className="formulario-campo">
              <label htmlFor="apellidoM">Apellido Materno</label>
              <div className={`campo-con-icono ${erroresCampos.apellidoM ? "campo-error" : ""}`}>
                <img src={iconUser} className="icono-campo-entrada" alt="" />
                <input
                  type="text"
                  id="apellidoM"
                  value={apellidoM}
                  placeholder="Martínez"
                  onChange={(e) => {
                    setApellidoM(e.target.value);
                    limpiarError("apellidoM");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="formulario-campo">
            <label htmlFor="fNacimiento">Fecha de nacimiento</label>
            <div className={`campo-con-icono ${erroresCampos.fNacimiento ? "campo-error" : ""}`}>
              <input
                type="date"
                id="fNacimiento"
                value={fNacimiento}
                onChange={(e) => {
                  setFNacimiento(e.target.value);
                  limpiarError("fNacimiento");
                }}
              />
            </div>
          </div>

          <div className="formulario-campo">
            <label htmlFor="correo">Correo electrónico</label>
            <div className={`campo-con-icono ${erroresCampos.correo ? "campo-error" : ""}`}>
              <img src={iconEmail} className="icono-campo-entrada" alt="" />
              <input
                type="email"
                id="correo"
                value={correo}
                placeholder="ejemplo@correo.com"
                onChange={(e) => {
                  setCorreo(e.target.value);
                  limpiarError("correo");
                }}
              />
            </div>
          </div>

          <div className="formulario-campo">
            <label htmlFor="contraseña">Contraseña</label>
            <div className={`campo-con-icono ${erroresCampos.contraseña ? "campo-error" : ""}`}>
              <img src={iconPassword} className="icono-campo-entrada" alt="" />
              <input
                type="password"
                id="contraseña"
                value={contraseña}
                placeholder="Mínimo 8 caracteres"
                onChange={(e) => {
                  setContraseña(e.target.value);
                  limpiarError("contraseña");
                }}
              />
            </div>
          </div>

          <div className="formulario-campo">
            <label htmlFor="confContraseña">Confirme contraseña</label>
            <div className={`campo-con-icono ${erroresCampos.confContraseña ? "campo-error" : ""}`}>
              <img src={iconPassword} className="icono-campo-entrada" alt="" />
              <input
                type="password"
                id="confContraseña"
                value={confContraseña}
                placeholder="Mínimo 8 caracteres"
                onChange={(e) => {
                  setConfContraseña(e.target.value);
                  limpiarError("confContraseña");
                }}
              />
            </div>
          </div>

          {error && <p className="mensaje-error-global">{error}</p>}

          <button type="submit" className="boton-crear-cuenta" disabled={cargando}>
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div className="contenedor-iniciar-sesion">
            <span>¿Ya tienes cuenta? </span>
            <span className="enlace-iniciar-sesion" onClick={irALogin}>Inicia sesión</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;