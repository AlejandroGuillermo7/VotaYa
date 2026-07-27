import { useCallback, useEffect, useMemo, useState } from "react";
import BarraLateral from "../Components/BarraLateral";
import EncabezadoUsuario from "../Components/EncabezadoUsuario";
import TarjetaVotacion from "../Components/TarjetaVotacion";
import { peticionApi, resolverUrlArchivo } from "../api/clienteApi";

import "./Inicio.css";

const formateadorNumero = new Intl.NumberFormat("es-MX");

const formateadorFecha = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatearFecha(fecha) {
  if (!fecha) {
    return "—";
  }

  return formateadorFecha.format(new Date(fecha));
}

function traducirEstado(estado) {
  const estados = {
    BORRADOR: "Borrador",
    PROGRAMADA: "Programada",
    ACTIVA: "Activa",
    FINALIZADA: "Terminada",
    CANCELADA: "Cancelada",
  };

  return estados[estado] || estado;
}

function traducirPrivacidad(privacidad) {
  return privacidad === "PRIVADA" ? "Privada" : "Pública";
}

function obtenerImagenEleccion(votacion) {
  if (votacion.imagenPortadaUrl) {
    return resolverUrlArchivo(votacion.imagenPortadaUrl);
  }

  const primeraOpcionConImagen = votacion.opciones?.find(
    (opcion) => opcion.imagenUrl,
  );

  return resolverUrlArchivo(primeraOpcionConImagen?.imagenUrl);
}

function Inicio({ alCerrarSesion }) {
  const [perfil, setPerfil] = useState(null);
  const [votacionesDestacadas, setVotacionesDestacadas] = useState([]);
  const [misElecciones, setMisElecciones] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [periodo, setPeriodo] = useState("TODAS");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [menuLateralAbierto, setMenuLateralAbierto] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const [datosPerfil, eleccionesPropias] = await Promise.all([
        peticionApi("/usuarios/perfil"),
        peticionApi("/votaciones/mias"),
      ]);

      const elecciones = eleccionesPropias || [];

      setPerfil(datosPerfil);
      setMisElecciones(elecciones);

      const eleccionesActivasPropias = elecciones
        .filter((votacion) => votacion.estado === "ACTIVA")
        .slice(0, 2);

      const destacadasConResultados = await Promise.all(
        eleccionesActivasPropias.map(async (votacion) => {
          try {
            const resultados = await peticionApi(
              `/votaciones/${votacion.idVotacion}/resultados`,
            );

            return {
              ...votacion,
              resultados,
            };
          } catch {
            return {
              ...votacion,
              resultados: null,
            };
          }
        }),
      );

      setVotacionesDestacadas(destacadasConResultados);
    } catch (excepcion) {
      setError(excepcion.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const eleccionesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return misElecciones.filter((votacion) => {
      const coincideTexto =
        !texto || votacion.titulo?.toLowerCase().includes(texto);

      if (!coincideTexto) {
        return false;
      }

      if (periodo === "TODAS") {
        return true;
      }

      const dias = Number(periodo);
      const fechaInicio = new Date(votacion.fechaInicio);
      const fechaLimite = new Date();

      fechaLimite.setDate(fechaLimite.getDate() - dias);

      return fechaInicio >= fechaLimite;
    });
  }, [misElecciones, busqueda, periodo]);

  async function eliminarVotacion(idVotacion) {
    const confirmado = window.confirm(
      "¿Seguro que deseas eliminar esta elección?",
    );

    if (!confirmado) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      await peticionApi(`/votaciones/${idVotacion}`, {
        method: "DELETE",
      });

      setMensaje("La elección fue eliminada correctamente.");
      await cargarDatos();
    } catch (excepcion) {
      setError(excepcion.message);
    }
  }

  function editarVotacion(idVotacion) {
    sessionStorage.setItem("idVotacionEditar", String(idVotacion));

    window.location.href = `/editar-votacion?id=${idVotacion}`;
  }

  if (cargando) {
    return (
      <div className="pantalla-carga">
        <div className="pantalla-carga__circulo" />
        <p>Cargando panel de VotaYa...</p>
      </div>
    );
  }

  return (
    <div className="pagina-inicio">
      <BarraLateral
        alCerrarSesion={alCerrarSesion}
        abierta={menuLateralAbierto}
        alCerrar={() => setMenuLateralAbierto(false)}
        seccionActiva="mis-elecciones"
      />

      {menuLateralAbierto && (
        <button
          type="button"
          className="fondo-sidebar-movil"
          aria-label="Cerrar menú lateral"
          onClick={() => setMenuLateralAbierto(false)}
        />
      )}

      <main className="contenido-inicio">
        <EncabezadoUsuario
          perfil={perfil}
          alAbrirMenu={() => setMenuLateralAbierto(true)}
        />

        {error && <div className="mensaje mensaje--error">{error}</div>}

        {mensaje && <div className="mensaje mensaje--correcto">{mensaje}</div>}

        <section className="bienvenida-panel">
          <p>Aquí puedes consultar tus votaciones activas.</p>
        </section>

        <section className="votaciones-destacadas">
          {votacionesDestacadas.length > 0 ? (
            votacionesDestacadas.map((votacion) => (
              <TarjetaVotacion key={votacion.idVotacion} votacion={votacion} />
            ))
          ) : (
            <div className="estado-vacio estado-vacio--grande">
              <h2>No hay elecciones activas</h2>
              <p>Las votaciones activas aparecerán en esta sección.</p>
            </div>
          )}
        </section>

        <section className="seccion-elecciones">
          <div className="seccion-elecciones__superior">
            <h2>Todas tus elecciones.</h2>

            <div className="seccion-elecciones__filtros">
              <label className="campo-busqueda">
                <span>⌕</span>

                <input
                  type="search"
                  placeholder="Buscar"
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                />
              </label>

              <select
                className="selector-periodo"
                value={periodo}
                onChange={(evento) => setPeriodo(evento.target.value)}
              >
                <option value="TODAS">Todas</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 90 días</option>
                <option value="365">Último año</option>
              </select>
            </div>
          </div>

          <div className="contenedor-tabla">
            <table className="tabla-elecciones">
              <thead>
                <tr>
                  <th>Nombre elección</th>
                  <th>Total votos</th>
                  <th>Fecha inicio</th>
                  <th>Fecha de cierre</th>
                  <th>Privacidad</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>

              <tbody>
                {eleccionesFiltradas.map((votacion) => {
                  const imagen = obtenerImagenEleccion(votacion);

                  return (
                    <tr key={votacion.idVotacion}>
                      <td>
                        <div className="informacion-eleccion">
                          {imagen ? (
                            <img
                              src={imagen}
                              alt=""
                              className="informacion-eleccion__imagen"
                            />
                          ) : (
                            <div className="informacion-eleccion__icono">
                              🗳️
                            </div>
                          )}

                          <div>
                            <strong>{traducirEstado(votacion.estado)}</strong>

                            <span>{votacion.titulo}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {formateadorNumero.format(votacion.totalVotos || 0)}
                      </td>

                      <td>{formatearFecha(votacion.fechaInicio)}</td>

                      <td>
                        {votacion.estado === "ACTIVA"
                          ? "Aún activa"
                          : formatearFecha(votacion.fechaFin)}
                      </td>

                      <td>{traducirPrivacidad(votacion.privacidad)}</td>

                      <td>
                        <div className="acciones-eleccion">
                          <button
                            type="button"
                            className="boton-accion boton-accion--editar"
                            onClick={() => editarVotacion(votacion.idVotacion)}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="boton-accion boton-accion--eliminar"
                            onClick={() =>
                              eliminarVotacion(votacion.idVotacion)
                            }
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {eleccionesFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      <div className="tabla-elecciones__vacia">
                        No se encontraron elecciones.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Inicio;
