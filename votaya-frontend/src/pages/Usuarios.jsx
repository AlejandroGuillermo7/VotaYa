import { useCallback, useEffect, useMemo, useState } from "react";

import BarraLateral from "../Components/BarraLateral";
import EncabezadoUsuario from "../Components/EncabezadoUsuario";
import PerfilUsuario from "./PerfilUsuario";
import iconoFiltrar from "../assets/icons/filtrar.svg";


import { peticionApi } from "../api/clienteApi";

import "./Usuarios.css";

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) {
    return "—";
  }

  const nacimiento = new Date(fechaNacimiento);

  if (Number.isNaN(nacimiento.getTime())) {
    return "—";
  }

  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();

  const diferenciaMes = hoy.getMonth() - nacimiento.getMonth();

  if (
    diferenciaMes < 0 ||
    (diferenciaMes === 0 && hoy.getDate() < nacimiento.getDate())
  ) {
    edad -= 1;
  }

  return edad;
}

function normalizarUsuarios(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  if (Array.isArray(respuesta?.content)) {
    return respuesta.content;
  }

  if (Array.isArray(respuesta?.contenido)) {
    return respuesta.contenido;
  }

  return [];
}

function Usuarios({ alCerrarSesion }) {
  const [perfil, setPerfil] = useState(null);

  const [usuarios, setUsuarios] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [filtroEdad, setFiltroEdad] = useState("TODAS");

  const [filtroRol, setFiltroRol] = useState("TODOS");

  const [menuLateralAbierto, setMenuLateralAbierto] = useState(false);

  const [vistaActiva, setVistaActiva] = useState("USUARIOS");

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [mensaje, setMensaje] = useState("");

  const [idUsuarioEliminando, setIdUsuarioEliminando] = useState(null);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const [datosPerfil, respuestaUsuarios] = await Promise.all([
        peticionApi("/usuarios/perfil"),

        peticionApi("/admin/usuarios"),
      ]);

      if (datosPerfil.rol !== "ADMINISTRADOR") {
        window.location.replace("/mis-votaciones");

        return;
      }

      setPerfil(datosPerfil);

      setUsuarios(normalizarUsuarios(respuestaUsuarios));
    } catch (excepcion) {
      setError(excepcion.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const nombreCompleto = [
        usuario.nombres,
        usuario.apellidoPaterno,
        usuario.apellidoMaterno,
        usuario.correo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const coincideBusqueda = texto === "" || nombreCompleto.includes(texto);

      const edad = calcularEdad(usuario.fechaNacimiento);

      let coincideEdad = true;

      if (filtroEdad === "MENORES_18") {
        coincideEdad = typeof edad === "number" && edad < 18;
      }

      if (filtroEdad === "18_25") {
        coincideEdad = typeof edad === "number" && edad >= 18 && edad <= 25;
      }

      if (filtroEdad === "26_40") {
        coincideEdad = typeof edad === "number" && edad >= 26 && edad <= 40;
      }

      if (filtroEdad === "MAS_40") {
        coincideEdad = typeof edad === "number" && edad > 40;
      }

      const coincideRol = filtroRol === "TODOS" || usuario.rol === filtroRol;

      return coincideBusqueda && coincideEdad && coincideRol;
    });
  }, [usuarios, busqueda, filtroEdad, filtroRol]);

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEdad("TODAS");
    setFiltroRol("TODOS");
  }

  async function eliminarUsuario(usuario) {
    const nombreUsuario = [usuario.nombres, usuario.apellidoPaterno]
      .filter(Boolean)
      .join(" ");

    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar a ${nombreUsuario}?`,
    );

    if (!confirmado) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      setIdUsuarioEliminando(usuario.idUsuario);

      await peticionApi(`/admin/usuarios/${usuario.idUsuario}`, {
        method: "DELETE",
      });

      setUsuarios((usuariosAnteriores) =>
        usuariosAnteriores.filter(
          (usuarioActual) =>
            Number(usuarioActual.idUsuario) !== Number(usuario.idUsuario),
        ),
      );

      setMensaje(`${nombreUsuario} fue eliminado correctamente.`);
    } catch (excepcion) {
      setError(excepcion.message);
    } finally {
      setIdUsuarioEliminando(null);
    }
  }

  function abrirPerfil() {
    setVistaActiva("PERFIL");
    setMenuLateralAbierto(false);
  }

  function volverAUsuarios() {
    setVistaActiva("USUARIOS");
    cargarDatos();
  }

  if (cargando) {
    return (
      <div className="pantalla-usuarios-carga">
        <div className="pantalla-usuarios-carga__circulo" />

        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="pagina-usuarios">
      <BarraLateral
        perfil={perfil}
        seccionActiva="usuarios"
        abierta={menuLateralAbierto}
        alCerrar={() => setMenuLateralAbierto(false)}
        alCerrarSesion={alCerrarSesion}
      />

      {menuLateralAbierto && (
        <button
          type="button"
          className="fondo-sidebar-usuarios"
          aria-label="Cerrar menú"
          onClick={() => setMenuLateralAbierto(false)}
        />
      )}

      <main className="contenido-usuarios">
        <EncabezadoUsuario
          perfil={perfil}
          titulo="USUARIOS."
          alAbrirMenu={() => setMenuLateralAbierto(true)}
          alIrAPerfil={abrirPerfil}
          alCerrarSesion={alCerrarSesion}
        />

        {vistaActiva === "PERFIL" && (
          <PerfilUsuario volver={volverAUsuarios} onActualizado={cargarDatos} />
        )}

        {vistaActiva === "USUARIOS" && (
          <>
            {error && (
              <div className="mensaje-usuarios mensaje-usuarios--error">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="mensaje-usuarios mensaje-usuarios--correcto">
                {mensaje}
              </div>
            )}

            <section className="filtros-usuarios">
              <div className="filtros-usuarios__icono">
                 <img width="50%"  src={iconoFiltrar}></img>
              </div>

              <div className="filtros-usuarios__titulo">Filtrar por</div>

              <label className="buscador-usuarios">
                <span>⌕</span>

                <input
                  type="search"
                  placeholder="Buscar usuario"
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                />
              </label>

              <select
                value={filtroEdad}
                onChange={(evento) => setFiltroEdad(evento.target.value)}
              >
                <option value="TODAS">Edad</option>

                <option value="MENORES_18">Menores de 18</option>

                <option value="18_25">De 18 a 25</option>

                <option value="26_40">De 26 a 40</option>

                <option value="MAS_40">Más de 40</option>
              </select>

              <select
                value={filtroRol}
                onChange={(evento) => setFiltroRol(evento.target.value)}
              >
                <option value="TODOS">Rol</option>

                <option value="USUARIO">Usuarios</option>

                <option value="ADMINISTRADOR">Administradores</option>
              </select>

              <button
                type="button"
                className="filtros-usuarios__limpiar"
                onClick={limpiarFiltros}
              >
                ↻ Limpiar filtros
              </button>

              <span className="filtros-usuarios__total">
                {usuariosFiltrados.length}{" "}
                {usuariosFiltrados.length === 1 ? "usuario" : "usuarios"}
              </span>
            </section>

            <section className="panel-tabla-usuarios">
              <div className="contenedor-tabla-usuarios">
                <table className="tabla-usuarios">
                  <thead>
                    <tr>
                      <th>ID</th>

                      <th>Nombre</th>

                      <th>
                        Apellido
                        <br />
                        paterno
                      </th>

                      <th>
                        Apellido
                        <br />
                        materno
                      </th>

                      <th>Edad</th>

                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuariosFiltrados.map((usuario) => {
                      const esUsuarioActual =
                        Number(usuario.idUsuario) === Number(perfil?.idUsuario);

                      const seEstaEliminando =
                        Number(idUsuarioEliminando) ===
                        Number(usuario.idUsuario);

                      return (
                        <tr key={usuario.idUsuario}>
                          <td>{usuario.idUsuario}</td>

                          <td>
                            <div className="usuario-tabla__nombre">
                              <strong>{usuario.nombres}</strong>

                              <span>
                                {usuario.rol === "ADMINISTRADOR"
                                  ? "Administrador"
                                  : "Usuario"}
                              </span>
                            </div>
                          </td>

                          <td>{usuario.apellidoPaterno || "—"}</td>

                          <td>{usuario.apellidoMaterno || "—"}</td>

                          <td>{calcularEdad(usuario.fechaNacimiento)}</td>

                          <td>
                            <div className="acciones-usuario">

                              <button
                                type="button"
                                className="acciones-usuario__eliminar"
                                disabled={esUsuarioActual || seEstaEliminando}
                                onClick={() => eliminarUsuario(usuario)}
                                title={
                                  esUsuarioActual
                                    ? "No puedes eliminar tu propia cuenta"
                                    : "Eliminar usuario"
                                }
                              >
                                {seEstaEliminando
                                  ? "Eliminando..."
                                  : "Eliminar"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {usuariosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan="6">
                          <div className="tabla-usuarios__vacia">
                            <strong>No se encontraron usuarios</strong>

                            <span>Cambia o limpia los filtros.</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Usuarios;
