import { useCallback, useEffect, useMemo, useState } from "react";

import BarraLateral from "../Components/BarraLateral";
import EncabezadoUsuario from "../Components/EncabezadoUsuario";
import PerfilUsuario from "./PerfilUsuario";

import { peticionApi } from "../api/clienteApi";

import "./TodasElecciones.css";
import iconoFiltrar from "../assets/icons/filtrar.svg";


const formateadorNumero = new Intl.NumberFormat("es-MX");

const formateadorFecha = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function normalizarVotaciones(respuesta) {
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

function convertirFecha(fecha) {
  if (!fecha) {
    return null;
  }

  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return null;
  }

  return fechaConvertida;
}

function formatearFecha(fecha) {
  const fechaConvertida = convertirFecha(fecha);

  if (!fechaConvertida) {
    return "—";
  }

  return formateadorFecha.format(fechaConvertida);
}

function obtenerFechaPublicacion(votacion) {
  return votacion.fechaCreacion || votacion.fechaInicio || null;
}

function obtenerTotalVotos(votacion) {
  return Number(
    votacion.totalVotos ??
      votacion.totalVotantes ??
      votacion.resultados?.totalVotantes ??
      0,
  );
}

function obtenerCreador(votacion) {
  if (votacion.nombreCreador) {
    return votacion.nombreCreador;
  }

  if (votacion.creador?.nombres) {
    return [votacion.creador.nombres, votacion.creador.apellidoPaterno]
      .filter(Boolean)
      .join(" ");
  }

  return "Sin información";
}

function traducirEstado(estado) {
  const estados = {
    BORRADOR: "Borrador",
    PROGRAMADA: "Programada",
    ACTIVA: "Activa",
    FINALIZADA: "Finalizada",
    CANCELADA: "Cancelada",
  };

  return estados[estado] || estado || "—";
}

function formatearFechaCierre(votacion) {
  if (!votacion.fechaFin) {
    return "Aún activa";
  }

  return formatearFecha(votacion.fechaFin);
}

function TodasElecciones({ alCerrarSesion }) {
  const [perfil, setPerfil] = useState(null);

  const [votaciones, setVotaciones] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [orden, setOrden] = useState("MAS_VOTADAS");

  const [filtroEstado, setFiltroEstado] = useState("TODAS");

  const [menuLateralAbierto, setMenuLateralAbierto] = useState(false);

  const [vistaActiva, setVistaActiva] = useState("TODAS_ELECCIONES");

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [mensaje, setMensaje] = useState("");

  const [idVotacionEliminando, setIdVotacionEliminando] = useState(null);

  const [votacionDetalle, setVotacionDetalle] = useState(null);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const [datosPerfil, respuestaVotaciones] = await Promise.all([
        peticionApi("/usuarios/perfil"),
        peticionApi("/admin/votaciones"),
      ]);

      if (datosPerfil.rol !== "ADMINISTRADOR") {
        window.location.replace("/mis-elecciones");

        return;
      }

      setPerfil(datosPerfil);

      setVotaciones(normalizarVotaciones(respuestaVotaciones));
    } catch (excepcion) {
      setError(excepcion.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const votacionesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    const resultado = votaciones.filter((votacion) => {
      const contenido = [
        votacion.titulo,
        votacion.descripcion,
        votacion.nombreCategoria,
        votacion.categoria?.nombre,
        obtenerCreador(votacion),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const coincideBusqueda = texto === "" || contenido.includes(texto);

      const coincideEstado =
        filtroEstado === "TODAS" || votacion.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });

    return [...resultado].sort((primera, segunda) => {
      if (orden === "MAS_VOTADAS") {
        return obtenerTotalVotos(segunda) - obtenerTotalVotos(primera);
      }

      if (orden === "RECIENTES") {
        const fechaPrimera =
          convertirFecha(obtenerFechaPublicacion(primera))?.getTime() || 0;

        const fechaSegunda =
          convertirFecha(obtenerFechaPublicacion(segunda))?.getTime() || 0;

        return fechaSegunda - fechaPrimera;
      }

      if (orden === "CIERRAN_PRONTO") {
        const fechaPrimera =
          convertirFecha(primera.fechaFin)?.getTime() ||
          Number.MAX_SAFE_INTEGER;

        const fechaSegunda =
          convertirFecha(segunda.fechaFin)?.getTime() ||
          Number.MAX_SAFE_INTEGER;

        return fechaPrimera - fechaSegunda;
      }

      return 0;
    });
  }, [votaciones, busqueda, orden, filtroEstado]);

  function limpiarFiltros() {
    setBusqueda("");
    setOrden("MAS_VOTADAS");
    setFiltroEstado("TODAS");
  }

  async function abrirDetalle(votacion) {
    try {
      setError("");

      const detalle = await peticionApi(`/votaciones/${votacion.idVotacion}`);

      setVotacionDetalle({
        ...votacion,
        ...detalle,
      });
    } catch (excepcion) {
      setError(excepcion.message);
    }
  }

  async function eliminarVotacion(votacion) {
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar la elección "${votacion.titulo}"?`,
    );

    if (!confirmado) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      setIdVotacionEliminando(votacion.idVotacion);

      await peticionApi(`/admin/votaciones/${votacion.idVotacion}`, {
        method: "DELETE",
      });

      setVotaciones((votacionesAnteriores) =>
        votacionesAnteriores.filter(
          (votacionActual) =>
            Number(votacionActual.idVotacion) !== Number(votacion.idVotacion),
        ),
      );

      setMensaje(
        `La elección "${votacion.titulo}" fue eliminada correctamente.`,
      );
    } catch (excepcion) {
      setError(excepcion.message);
    } finally {
      setIdVotacionEliminando(null);
    }
  }

  function abrirPerfil() {
    setVotacionDetalle(null);
    setVistaActiva("PERFIL");
    setMenuLateralAbierto(false);
  }

  function volverATodasElecciones() {
    setVistaActiva("TODAS_ELECCIONES");
    cargarDatos();
  }

  if (cargando) {
    return (
      <div className="pantalla-todas-elecciones-carga">
        <div className="pantalla-todas-elecciones-carga__circulo" />

        <p>Cargando todas las votaciones...</p>
      </div>
    );
  }

  return (
    <div className="pagina-todas-elecciones">
      <BarraLateral
        perfil={perfil}
        seccionActiva="todas-las-elecciones"
        abierta={menuLateralAbierto}
        alCerrar={() => setMenuLateralAbierto(false)}
        alCerrarSesion={alCerrarSesion}
      />

      {menuLateralAbierto && (
        <button
          type="button"
          className="fondo-sidebar-todas-elecciones"
          aria-label="Cerrar menú lateral"
          onClick={() => setMenuLateralAbierto(false)}
        />
      )}

      <main className="contenido-todas-elecciones">
        <EncabezadoUsuario
          perfil={perfil}
          titulo="TODAS LAS VOTACIONES"
          alAbrirMenu={() => setMenuLateralAbierto(true)}
          alIrAPerfil={abrirPerfil}
          alCerrarSesion={alCerrarSesion}
        />

        {vistaActiva === "PERFIL" && (
          <PerfilUsuario
            volver={volverATodasElecciones}
            onActualizado={cargarDatos}
          />
        )}

        {vistaActiva === "TODAS_ELECCIONES" && (
          <>
            {error && (
              <div className="mensaje-todas-elecciones mensaje-todas-elecciones--error">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="mensaje-todas-elecciones mensaje-todas-elecciones--correcto">
                {mensaje}
              </div>
            )}

            <section className="filtros-todas-elecciones">
              <div className="filtros-todas-elecciones__icono">
                 <img width="50%"  src={iconoFiltrar}></img>
              </div>

              <div className="filtros-todas-elecciones__titulo">
                Filtrar por
              </div>

              <label className="buscador-todas-elecciones">
                <span>⌕</span>

                <input
                  type="search"
                  placeholder="Buscar elección"
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                />
              </label>

              <select
                value={orden}
                onChange={(evento) => setOrden(evento.target.value)}
              >
                <option value="MAS_VOTADAS">Más votada</option>

                <option value="RECIENTES">Más reciente</option>

                <option value="CIERRAN_PRONTO">Cierran pronto</option>
              </select>

              <select
                value={filtroEstado}
                onChange={(evento) => setFiltroEstado(evento.target.value)}
              >
                <option value="TODAS">Estado</option>

                <option value="ACTIVA">Activas</option>

                <option value="PROGRAMADA">Programadas</option>

                <option value="FINALIZADA">Finalizadas</option>

                <option value="BORRADOR">Borradores</option>
              </select>

              <button
                type="button"
                className="filtros-todas-elecciones__limpiar"
                onClick={limpiarFiltros}
              >
                ↻ Limpiar filtros
              </button>

              <span className="filtros-todas-elecciones__total">
                {votacionesFiltradas.length}{" "}
                {votacionesFiltradas.length === 1 ? "elección" : "elecciones"}
              </span>
            </section>

            <section className="panel-todas-elecciones">
              <div className="contenedor-tabla-todas-elecciones">
                <table className="tabla-todas-elecciones">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Fecha de publicación</th>
                      <th>Fecha de cierre</th>
                      <th>Total votaciones</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {votacionesFiltradas.map((votacion) => {
                      const eliminando =
                        Number(idVotacionEliminando) ===
                        Number(votacion.idVotacion);

                      return (
                        <tr key={votacion.idVotacion}>
                          <td>{votacion.idVotacion}</td>

                          <td>
                            <div className="informacion-eleccion-admin">
                              <strong>{votacion.titulo}</strong>

                              <span>
                                {obtenerCreador(votacion)}
                                {" · "}
                                {traducirEstado(votacion.estado)}
                              </span>
                            </div>
                          </td>

                          <td>
                            {formatearFecha(obtenerFechaPublicacion(votacion))}
                          </td>

                          <td>{formatearFechaCierre(votacion)}</td>

                          <td>
                            {formateadorNumero.format(
                              obtenerTotalVotos(votacion),
                            )}
                          </td>

                          <td>
                            <div className="acciones-eleccion-admin">
                              <button
                                type="button"
                                className="acciones-eleccion-admin__detalle"
                                onClick={() => abrirDetalle(votacion)}
                              >
                                Detalle
                              </button>

                              <button
                                type="button"
                                className="acciones-eleccion-admin__eliminar"
                                disabled={eliminando}
                                onClick={() => eliminarVotacion(votacion)}
                              >
                                {eliminando ? "Eliminando..." : "Eliminar"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {votacionesFiltradas.length === 0 && (
                      <tr>
                        <td colSpan="6">
                          <div className="tabla-todas-elecciones__vacia">
                            <strong>No se encontraron votaciones</strong>

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

      {vistaActiva === "TODAS_ELECCIONES" && votacionDetalle && (
        <div
          className="modal-detalle-eleccion"
          role="presentation"
          onClick={() => setVotacionDetalle(null)}
        >
          <div
            className="modal-detalle-eleccion__contenido"
            role="dialog"
            aria-modal="true"
            onClick={(evento) => evento.stopPropagation()}
          >
            <button
              type="button"
              className="modal-detalle-eleccion__cerrar"
              onClick={() => setVotacionDetalle(null)}
            >
              ×
            </button>

            <h2>{votacionDetalle.titulo}</h2>

            <p>{votacionDetalle.descripcion || "Sin descripción."}</p>

            <div className="modal-detalle-eleccion__datos">
              <div>
                <span>Estado</span>
                <strong>{traducirEstado(votacionDetalle.estado)}</strong>
              </div>

              <div>
                <span>Creador</span>
                <strong>{obtenerCreador(votacionDetalle)}</strong>
              </div>

              <div>
                <span>Privacidad</span>
                <strong>{votacionDetalle.privacidad || "—"}</strong>
              </div>

              <div>
                <span>Tipo de voto</span>
                <strong>{votacionDetalle.tipoVoto || "—"}</strong>
              </div>

              <div>
                <span>Publicación</span>
                <strong>
                  {formatearFecha(obtenerFechaPublicacion(votacionDetalle))}
                </strong>
              </div>

              <div>
                <span>Cierre</span>
                <strong>{formatearFechaCierre(votacionDetalle)}</strong>
              </div>
            </div>

            <div className="modal-detalle-eleccion__opciones">
              <h3>Opciones</h3>

              {(votacionDetalle.opciones || []).map((opcion) => (
                <div
                  key={opcion.idOpcion}
                  className="modal-detalle-eleccion__opcion"
                >
                  {opcion.nombre}
                </div>
              ))}

              {!votacionDetalle.opciones?.length && (
                <p>No hay opciones disponibles.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodasElecciones;
