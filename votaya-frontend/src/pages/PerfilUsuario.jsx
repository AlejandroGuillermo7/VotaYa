import { useState } from "react";
import logo from "../assets/icons/icon-logo-offletters.png";
import user from "../assets/icons/icon-username.svg";
import email from "../assets/icons/icon-email.svg";
import password from "../assets/icons/icon-password.svg";
import "./PerfilUsuario.css";

function PerfilUsuario() {
  const [nombre, setNombre] = useState("");
  const [apellidoP, setApellidoP] = useState("");
  const [apellidoM, setApellidoM] = useState("");
  const [fechaN, setFechaN] = useState("");
  const [correo, setCorreo] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState(null);

  // para contraseñas
  const [contraseñaActual, setContraseñaActual] = useState("");
  const [contraseñaNueva, setContraseñaNueva] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [isVerificada, setIsVerificada] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const cambiarFoto = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setFotoPerfil(URL.createObjectURL(archivo));
    }
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

    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error al conectar con el servidor." });
    } finally {
      setCargando(false);
    }
  };

  const handleActualizar = async (e) => {
    e.preventDefault();

    if (isVerificada || contraseñaNueva) {
      if (contraseñaNueva !== confirmarContraseña) {
        setMensaje({ tipo: "error", texto: "Las nuevas contraseñas no coinciden." });
        return;
      }
      if (contraseñaNueva.length < 6) {
        setMensaje({ tipo: "error", texto: "La nueva contraseña debe tener al menos 6 caracteres." });
        return;
      }
    }

    try {
      /* BACKEND */
      setMensaje({ tipo: "exito", texto: "Perfil actualizado correctamente." });
    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error al actualizar los datos." });
    }
  };

  return (
    <div className="perfil-contenedor-principal">
      <header className="encabezado">
        <img src={logo} alt="VotaYa Logo" className="icon-logo-oficial" />
        <h1>Perfil de Usuario</h1>

        <div className="contenedor-foto-perfil">
          <label htmlFor="fotoPerfilInput" className="marco-foto-perfil">
            {fotoPerfil ? (
              <img src={fotoPerfil} alt="Foto de perfil" className="foto-perfil-imagen" />
            ) : (
              <>
                <span className="icono-usuario-base">👤</span>
                <span className="icono-agregar-foto">+</span>
              </>
            )}
          </label>
          <input
            type="file"
            id="fotoPerfilInput"
            accept="image/*"
            hidden
            onChange={cambiarFoto}
          />
          <p className="texto-subir-foto">Subir fotografía</p>
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

        <section className="seccion-form">
          <h2>Cambiar contraseña</h2>

          {mensaje.texto && (
            <div className={`mensaje-alerta ${mensaje.tipo}`}>
              {mensaje.texto}
            </div>
          )}

          <div className="fila-cambio-clave">
            <div className="formulario-campo">
              <label htmlFor="pass-verificar">Contraseña Actual</label>
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
            </div>

            <div className="contenedor-boton-verificar">
              <button
                type="button"
                className="btn-verificar"
                onClick={handleVerificar}
                disabled={cargando || isVerificada}
              >
                {cargando ? "Verificando..." : isVerificada ? "Verificada ✓" : "Verificar"}
              </button>
            </div>

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
          <button type="submit" className="btn-actualizar">
            Actualizar
          </button>
          <p className="Editar-volver">
            ¿Deseas regresar? <span className="Editar-volver-click">Volver</span>
          </p>
        </div>
      </form>
    </div>
  );
}

export default PerfilUsuario;