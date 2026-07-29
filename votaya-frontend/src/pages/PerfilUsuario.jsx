import { useState, useEffect } from "react";
import { FiUser, FiPlus, FiX } from "react-icons/fi";
import logo from "../assets/icons/icon-logo-offletters.png";
import user from "../assets/icons/icon-username.svg";
import email from "../assets/icons/icon-email.svg";
import password from "../assets/icons/icon-password.svg";
import "./PerfilUsuario.css";

const resolverUrlArchivo = (ruta) => {
  if (!ruta) return null;
  if (ruta.startsWith("http") || ruta.startsWith("blob:")) return ruta;
  return `http://localhost:8080${ruta.startsWith("/") ? "" : "/"}${ruta}`;
};

function PerfilUsuario({ volver, onActualizado }) {
  const [nombre, setNombre] = useState("");
  const [apellidoP, setApellidoP] = useState("");
  const [apellidoM, setApellidoM] = useState("");
  const [fechaN, setFechaN] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [fotoFallo, setFotoFallo] = useState(false);

  const [contraseñaActual, setContraseñaActual] = useState("");
  const [contraseñaNueva, setContraseñaNueva] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [isVerificada, setIsVerificada] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const token = localStorage.getItem("token");

  const obtenerPerfil = async () => {
    try {
      const respuesta = await fetch("http://localhost:8080/api/usuarios/perfil", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!respuesta.ok) throw new Error("No se pudieron obtener los datos.");

      const data = await respuesta.json();

      setNombre(data.nombres || "");
      setApellidoP(data.apellidoPaterno || "");
      setApellidoM(data.apellidoMaterno || "");
      setFechaN(data.fechaNacimiento || "");
      setCorreo(data.correo || "");
      setTelefono(data.telefono || "");
      setFotoFallo(false);
      setFotoPerfil(data.fotoUrl ? resolverUrlArchivo(data.fotoUrl) : null);
    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error al cargar la información del perfil." });
    }
  };

  useEffect(() => {
    if (token) obtenerPerfil();
  }, [token]);

  const cambiarFoto = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setFotoFallo(false);
      setArchivoFoto(archivo);
      const previewUrl = URL.createObjectURL(archivo);
      setFotoPerfil(previewUrl);
    }
  };

  const eliminarFotoNueva = () => {
    if (fotoPerfil && fotoPerfil.startsWith("blob:")) {
      URL.revokeObjectURL(fotoPerfil);
    }
    setArchivoFoto(null);
    obtenerPerfil();
  };

  const handleVerificar = async (e) => {
    e.preventDefault();
    if (!contraseñaActual) {
      setMensaje({ tipo: "error", texto: "Ingresa tu contraseña actual." });
      return;
    }

    setCargando(true);
    setMensaje({ tipo: "", texto: "" });

    try {
      const respuesta = await fetch("http://localhost:8080/api/usuarios/verificar-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passwordActual: contraseñaActual }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.mensaje || "La contraseña ingresada no es correcta.");
      }

      setIsVerificada(true);
      setMensaje({ tipo: "exito", texto: "Contraseña verificada. Puedes ingresar la nueva." });
    } catch (error) {
      setIsVerificada(false);
      setMensaje({ tipo: "error", texto: error.message || "Error al verificar la contraseña." });
    } finally {
      setCargando(false);
    }
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: "", texto: "" });

    if (isVerificada && contraseñaNueva && contraseñaNueva !== confirmarContraseña) {
      setMensaje({ tipo: "error", texto: "La confirmación de la nueva contraseña no coincide." });
      return;
    }

    setGuardando(true);

    try {
      const formData = new FormData();

      const datosUsuario = {
        nombres: nombre,
        apellidoPaterno: apellidoP,
        apellidoMaterno: apellidoM || null,
        fechaNacimiento: fechaN,
        correo: correo,
        telefono: telefono
        .replace(/\s/g, "")
        .replace(/-/g, "")
        .replace(/[()]/g, ""),
        nuevaContrasena: isVerificada && contraseñaNueva ? contraseñaNueva : null,
      };

      formData.append(
        "datos",
        new Blob([JSON.stringify(datosUsuario)], {
          type: "application/json",
        })
      );

      if (archivoFoto) {
        formData.append("foto", archivoFoto);
      }

      const respuesta = await fetch("http://localhost:8080/api/usuarios/perfil", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.mensaje || "Error al actualizar el perfil.");
      }

      const dataActualizada = await respuesta.json();

      setMensaje({ tipo: "exito", texto: "Perfil actualizado correctamente." });
      setArchivoFoto(null);

      if (dataActualizada.fotoUrl) {
        setFotoPerfil(resolverUrlArchivo(dataActualizada.fotoUrl));
      }

      if (onActualizado) {
        onActualizado();
      }
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "error", texto: err.message || "Ocurrió un error interno en el servidor." });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="perfil-contenedor-principal">
      <header className="encabezado">
        <img src={logo} alt="VotaYa Logo" className="icon-logo-oficial" />
        <h1>Perfil de Usuario</h1>

        <div className="contenedor-foto-perfil">
          <div className="wrapper-foto">
            <label htmlFor="fotoPerfilInput" className="marco-foto-perfil">
              {fotoPerfil && !fotoFallo ? (
                <img
                  src={fotoPerfil}
                  alt="Foto de perfil"
                  className="foto-perfil-imagen"
                  onError={() => setFotoFallo(true)}
                />
              ) : (
                <div className="place-holder-foto">
                  <FiUser className="icono-avatar-svg" />
                  <div className="icono-agregar-foto">
                    <FiPlus size={12} />
                  </div>
                </div>
              )}
            </label>

            {archivoFoto && (
              <button
                type="button"
                className="btn-eliminar-foto"
                onClick={eliminarFotoNueva}
                title="Quitar imagen seleccionada"
              >
                <FiX size={14} />
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
      </header>

      <form className="perfil-formulario" onSubmit={handleActualizar}>
        <section className="seccion-form">
          <h2>Editar datos generales</h2>

          <div className="fila-datos-cuatro">
            <div className="formulario-campo">
              <label htmlFor="nombre">Nombre(s)</label>
              <div className="campo-con-icono">
                <img src={user} alt="Icono usuario" />
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
            </div>

            <div className="formulario-campo">
              <label htmlFor="apellidoP">Apellido Paterno</label>
              <div className="campo-con-icono">
                <img src={user} alt="Icono usuario" />
                <input
                  type="text"
                  id="apellidoP"
                  value={apellidoP}
                  onChange={(e) => setApellidoP(e.target.value)}
                />
              </div>
            </div>

            <div className="formulario-campo">
              <label htmlFor="apellidoM">Apellido Materno</label>
              <div className="campo-con-icono">
                <img src={user} alt="Icono usuario" />
                <input
                  type="text"
                  id="apellidoM"
                  value={apellidoM}
                  onChange={(e) => setApellidoM(e.target.value)}
                />
              </div>
            </div>

            <div className="formulario-campo">
              <label htmlFor="fechaN">Fecha de nacimiento</label>
              <input
                type="date"
                id="fechaN"
                className="entrada-fecha"
                value={fechaN}
                onChange={(e) => setFechaN(e.target.value)}
              />
            </div>
          </div>

          <div className="fila-correo-unico">
            <div className="formulario-campo">
              <label htmlFor="correo">Correo electrónico</label>
              <div className="campo-con-icono">
                <img src={email} alt="Icono correo" />
                <input
                  type="email"
                  id="correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>
        
        <div className="fila-correo-unico">
          <div className="formulario-campo">
            <label htmlFor="telefono">
              Teléfono con WhatsApp
            </label>

            <div className="campo-con-icono">
              <span className="icono-telefono-perfil">
                ☎
              </span>

              <input
                type="tel"
                id="telefono"
                value={telefono}
                placeholder="+529511234567"
                maxLength={16}
                onChange={(e) =>
                  setTelefono(e.target.value)
                }
              />
            </div>

            <small className="ayuda-telefono">
              Incluye el código de país. Para México usa +52.
            </small>
          </div>
        </div>

        <section className="seccion-form">
          <h2>Cambiar contraseña</h2>

          {mensaje.texto && (
            <div className={`mensaje-alerta ${mensaje.tipo}`}>
              {mensaje.texto}
            </div>
          )}

          {/* FILA 1: Input + Botón en la Columna 1 */}
          <div className="fila-cambio-clave">
            <div className="formulario-campo">
              <label htmlFor="pass-verificar">Contraseña Actual</label>
              <div className="campo-con-boton">
                <div className="campo-con-icono">
                  <img src={password} alt="Icono contraseña" />
                  <input
                    type="password"
                    id="pass-verificar"
                    value={contraseñaActual}
                    onChange={(e) => {
                      setContraseñaActual(e.target.value);
                      setIsVerificada(false);
                    }}
                    placeholder="********"
                  />
                </div>
                <button
                  type="button"
                  className="btn-verificar"
                  onClick={handleVerificar}
                  disabled={cargando || isVerificada}
                >
                  {cargando ? "Verificando..." : isVerificada ? "Verificada ✓" : "Verificar"}
                </button>
              </div>
            </div>

            {/* Columna 2 vacía para mantener la simetría del Grid */}
            <div></div>
          </div>

          {/* FILA 2: Nueva Contraseña + Confirmación */}
          <div className="fila-cambio-clave" style={{ marginTop: "16px" }}>
            <div className="formulario-campo">
              <label htmlFor="contraseñaN">Nueva Contraseña</label>
              <div className="campo-con-icono">
                <img src={password} alt="Icono contraseña" />
                <input
                  type="password"
                  id="contraseñaN"
                  value={contraseñaNueva}
                  onChange={(e) => setContraseñaNueva(e.target.value)}
                  placeholder="********"
                  disabled={!isVerificada}
                />
              </div>
            </div>

            <div className="formulario-campo">
              <label htmlFor="confirmarPass">Confirmación Nueva Contraseña</label>
              <div className="campo-con-icono">
                <img src={password} alt="Icono contraseña" />
                <input
                  type="password"
                  id="confirmarPass"
                  value={confirmarContraseña}
                  onChange={(e) => setConfirmarContraseña(e.target.value)}
                  placeholder="********"
                  disabled={!isVerificada}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="acciones-finales">
          <button type="submit" className="btn-actualizar" disabled={guardando}>
            {guardando ? "Actualizando..." : "Actualizar"}
          </button>
          <p className="Editar-volver">
            ¿Deseas regresar?{" "}
            <span className="Editar-volver-click" onClick={volver}>
              Volver
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}

export default PerfilUsuario;