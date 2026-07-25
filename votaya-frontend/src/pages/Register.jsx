import { useState } from "react";
import iconLogo from "../assets/icons/icon-login.png";
import iconEmail from "../assets/icons/icon-email.svg";
import iconPassword from "../assets/icons/icon-password.svg";
import iconUser from "../assets/icons/icon-username.svg";
import iconVotante from "../assets/icons/icon-votante.svg";
import iconOrganizing from "../assets/icons/icon-notes.svg";
import "./Register.css";

function Register() {
  const [participar, setParticipar] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidoP, setApellidoP] = useState("");
  const [apellidoM, setApellidoM] = useState("");
  const [fNacimiento, setFNacimiento] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confContraseña, setConfContraseña] = useState("");

  const [error, setError] = useState("");
  const [erroresCampos, setErroresCampos] = useState({});
  const [cargando, setCargando] = useState(false);

  function validarCampos() {
    const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let nuevosErrores = {};

    if (!participar) nuevosErrores.participar = true;
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

  function enviar(e) {
    e.preventDefault();
    setError("");

    if (!validarCampos()) return;

    setCargando(true);
    try {
      console.log("Datos", {
        participar,
        nombre,
        apellidoP,
        apellidoM,
        fNacimiento,
        correo,
        contraseña,
      });
    } catch (err) {
      setError(err.message);
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
    <div className="registerFondo">
      <div className="registerCarta">
        <span className="register-close">&times;</span>

        <div className="register-logo">
          <img src={iconLogo} alt="Logo VotaYa" />
        </div>

        <h2>Crea tu cuenta</h2>
        <span className="subtitulo">Únete a VotaYa</span>
        <hr className="divider" />

        <form onSubmit={enviar}>
          <div className="registerCampo">
            <label className="register-label-titulo">¿Cómo quieres participar?</label>
            <div className={`opciones-participar ${erroresCampos.participar ? "campo-error-opciones" : ""}`}>
              <div
                className={`opcion-card ${participar === "organizador" ? "activa" : ""}`}
                onClick={() => {
                  setParticipar("organizador");
                  limpiarError("participar");
                }}
              >
                <img src={iconOrganizing} alt="Organizador" />
                <span className="opcion-titulo">Organizador</span>
                <span className="opcion-sub">Crear votaciones</span>
              </div>

              <div
                className={`opcion-card ${participar === "votante" ? "activa" : ""}`}
                onClick={() => {
                  setParticipar("votante");
                  limpiarError("participar");
                }}
              >
                <img src={iconVotante} alt="Votante" />
                <span className="opcion-titulo">Votante</span>
                <span className="opcion-sub">Participe y vota</span>
              </div>
            </div>
          </div>

          <div className="registerCampo">
            <label htmlFor="nombre">Nombre(s)</label>
            <div className={`register-icon-input ${erroresCampos.nombre ? "campo-error" : ""}`}>
              <img src={iconUser} className="RegisterIcono" alt="" />
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

          <div className="register-row">
            <div className="registerCampo">
              <label htmlFor="apellidoP">Apellido Paterno</label>
              <div className={`register-icon-input ${erroresCampos.apellidoP ? "campo-error" : ""}`}>
                <img src={iconUser} className="RegisterIcono" alt="" />
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

            <div className="registerCampo">
              <label htmlFor="apellidoM">Apellido Materno</label>
              <div className={`register-icon-input ${erroresCampos.apellidoM ? "campo-error" : ""}`}>
                <img src={iconUser} className="RegisterIcono" alt="" />
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

          <div className="registerCampo">
            <label htmlFor="fNacimiento">Fecha de nacimiento</label>
            <div className={`register-icon-input ${erroresCampos.fNacimiento ? "campo-error" : ""}`}>
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

          <div className="registerCampo">
            <label htmlFor="correo">Correo electrónico</label>
            <div className={`register-icon-input ${erroresCampos.correo ? "campo-error" : ""}`}>
              <img src={iconEmail} className="RegisterIcono" alt="" />
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

          <div className="registerCampo">
            <label htmlFor="contraseña">Contraseña</label>
            <div className={`register-icon-input ${erroresCampos.contraseña ? "campo-error" : ""}`}>
              <img src={iconPassword} className="RegisterIcono" alt="" />
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

          <div className="registerCampo">
            <label htmlFor="confContraseña">Confirme contraseña</label>
            <div className={`register-icon-input ${erroresCampos.confContraseña ? "campo-error" : ""}`}>
              <img src={iconPassword} className="RegisterIcono" alt="" />
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

          {error && <p className="registerError">{error}</p>}

          <button type="submit" className="loginBoton" disabled={cargando}>
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div className="loginRegistrate">
            <span>¿Ya tienes cuenta? </span>
            <span className="iniciarsesion">Inicia sesión</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;