import { useCallback, useEffect, useMemo, useState } from "react";

import BarraLateral from "../Components/BarraLateral";
import EncabezadoUsuario from "../Components/EncabezadoUsuario";
import TarjetaVotacion from "../Components/TarjetaVotacion";

import PerfilUsuario from "./PerfilUsuario";
import EditarVotacion from "./EditarVotacion";
import DetalleVotacion from "./DetalleVotacion";

import logovotar from "../assets/icons/votar.png";

import { peticionApi, resolverUrlArchivo } from "../api/clienteApi";

import "./Inicio.css";

const formateadorNumero = new Intl.NumberFormat("es-MX");

const formateadorFecha = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const CLAVE_VOTACIONES_OCULTAS = "votaya_votaciones_ocultas";

function normalizarVotaciones(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  const posiblesListas = [
    respuesta?.content,
    respuesta?.contenido,
    respuesta?.votaciones,
    respuesta?.data,
    respuesta?.data?.content,
    respuesta?.data?.contenido,
  ];

  return posiblesListas.find(Array.isArray) || [];
}

function obtenerIdVotacion(votacion) {
  return votacion?.idVotacion ?? votacion?.id ?? null;
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "—";
  }

  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return "—";
  }

  return formateadorFecha.format(fechaConvertida);
}

function traducirEstado(estado) {
  const estados = {
    BORRADOR: "Borrador",
    PROGRAMADA: "Programada",
    ACTIVA: "Activa",
    FINALIZADA: "Terminada",
    CANCELADA: "Cancelada",
  };

  return estados[estado] || estado || "—";
}

function traducirPrivacidad(privacidad) {
  const valores = {
    PUBLICA: "Pública",
    PRIVADA: "Privada",
  };

  return valores[privacidad] || privacidad || "—";
}

function traducirTipoVoto(tipoVoto) {
  const valores = {
    ANONIMO: "Anónimo",
    IDENTIFICADO: "Identificado",
  };

  return valores[tipoVoto] || tipoVoto || "—";
}

function traducirTipoSeleccion(tipoSeleccion) {
  const valores = {
    UNICA: "Única",
    MULTIPLE: "Múltiple",
  };

  return valores[tipoSeleccion] || tipoSeleccion || "—";
}

function traducirTipoGrafica(tipoGrafica) {
  const valores = {
    BARRAS: "Barras",
    PASTEL: "Pastel",
  };

  return valores[tipoGrafica] || tipoGrafica || "—";
}

function traducirBooleano(valor) {
  return valor ? "Sí" : "No";
}

function obtenerTotalVotos(votacion) {
  return Number(
    votacion?.totalVotos ??
      votacion?.resultados?.totalVotantes ??
      votacion?.resultados?.totalVotos ??
      0,
  );
}

function obtenerImagenEleccion(votacion) {
  if (votacion?.imagenPortadaUrl) {
    return resolverUrlArchivo(votacion.imagenPortadaUrl);
  }

  const opciones = Array.isArray(votacion?.opciones) ? votacion.opciones : [];

  const primeraOpcionConImagen = opciones.find((opcion) => opcion.imagenUrl);

  return resolverUrlArchivo(primeraOpcionConImagen?.imagenUrl);
}

function obtenerOpcionesOrdenadas(votacion) {
  const opciones = Array.isArray(votacion?.opciones) ? votacion.opciones : [];

  return [...opciones].sort(
    (primera, segunda) =>
      Number(primera.ordenVisual ?? 0) - Number(segunda.ordenVisual ?? 0),
  );
}

function obtenerVotacionesOcultas() {
  try {
    const guardadas = localStorage.getItem(CLAVE_VOTACIONES_OCULTAS);
    const ids = guardadas ? JSON.parse(guardadas) : [];

    return Array.isArray(ids) ? ids.map(Number) : [];
  } catch {
    return [];
  }
}

function guardarVotacionesOcultas(ids) {
  localStorage.setItem(CLAVE_VOTACIONES_OCULTAS, JSON.stringify(ids));
}

async function copiarTexto(texto) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(texto);
    return;
  }

  const campoTemporal = document.createElement("textarea");

  campoTemporal.value = texto;
  campoTemporal.setAttribute("readonly", "");
  campoTemporal.style.position = "fixed";
  campoTemporal.style.left = "-9999px";
  campoTemporal.style.opacity = "0";

  document.body.appendChild(campoTemporal);
  campoTemporal.select();

  const copiado = document.execCommand("copy");

  document.body.removeChild(campoTemporal);

  if (!copiado) {
    throw new Error("No se pudo copiar el enlace.");
  }
}

function Inicio({ alCerrarSesion }) {
  const [idVotacionEditar, setIdVotacionEditar] = useState(null);
  const [idVotacionDetalle, setIdVotacionDetalle] = useState(null);

  const [perfil, setPerfil] = useState(null);
  const [votacionesDestacadas, setVotacionesDestacadas] = useState([]);
  const [misElecciones, setMisElecciones] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [periodo, setPeriodo] = useState("TODAS");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [menuLateralAbierto, setMenuLateralAbierto] = useState(false);
  const [vistaActiva, setVistaActiva] = useState("INICIO");

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const [datosPerfil, respuestaElecciones] = await Promise.all([
        peticionApi("/usuarios/perfil"),
        peticionApi("/votaciones/mias"),
      ]);

      const elecciones = normalizarVotaciones(respuestaElecciones);
      const idsOcultos = obtenerVotacionesOcultas();

      const eleccionesVisibles = elecciones.filter((votacion) => {
        const idVotacion = Number(obtenerIdVotacion(votacion));

        return !idsOcultos.includes(idVotacion);
      });

      setPerfil(datosPerfil);
      setMisElecciones(eleccionesVisibles);

      const eleccionesActivasPropias = eleccionesVisibles
        .filter((votacion) => votacion.estado === "ACTIVA")
        .slice(0, 2);

      const destacadasConResultados = await Promise.all(
        eleccionesActivasPropias.map(async (votacion) => {
          const idVotacion = obtenerIdVotacion(votacion);

          try {
            const resultados = await peticionApi(
              `/votaciones/${idVotacion}/resultados`,
            );

            return {
              ...votacion,
              resultados,
            };
          } catch (excepcion) {
            console.warn(
              `No se pudieron cargar los resultados de la votación ${idVotacion}:`,
              excepcion.message,
            );

            return {
              ...votacion,
              resultados: null,
            };
          }
        }),
      );

      setVotacionesDestacadas(destacadasConResultados);
    } catch (excepcion) {
      setMisElecciones([]);
      setVotacionesDestacadas([]);
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

    const listaElecciones = Array.isArray(misElecciones) ? misElecciones : [];

    return listaElecciones.filter((votacion) => {
      const contenidoBuscable = [
        votacion.titulo,
        votacion.descripcion,
        votacion.nombreCategoria,
        votacion.categoria?.nombre,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const coincideTexto = texto === "" || contenidoBuscable.includes(texto);

      if (!coincideTexto) {
        return false;
      }

      if (periodo === "TODAS") {
        return true;
      }

      const dias = Number(periodo);
      const fechaInicio = new Date(votacion.fechaInicio);

      if (Number.isNaN(fechaInicio.getTime())) {
        return false;
      }

      const fechaLimite = new Date();

      fechaLimite.setDate(fechaLimite.getDate() - dias);

      return fechaInicio >= fechaLimite;
    });
  }, [misElecciones, busqueda, periodo]);

  function eliminarVotacion(idVotacion) {
    const confirmado = window.confirm(
      "¿Seguro que deseas quitar esta elección de tu pantalla?",
    );

    if (!confirmado) {
      return;
    }

    setError("");
    setMensaje("");

    const idNumerico = Number(idVotacion);
    const idsOcultos = obtenerVotacionesOcultas();

    guardarVotacionesOcultas([...new Set([...idsOcultos, idNumerico])]);

    setMisElecciones((eleccionesAnteriores) => {
      const lista = Array.isArray(eleccionesAnteriores)
        ? eleccionesAnteriores
        : [];

      return lista.filter(
        (votacion) => Number(obtenerIdVotacion(votacion)) !== idNumerico,
      );
    });

    setVotacionesDestacadas((eleccionesAnteriores) => {
      const lista = Array.isArray(eleccionesAnteriores)
        ? eleccionesAnteriores
        : [];

      return lista.filter(
        (votacion) => Number(obtenerIdVotacion(votacion)) !== idNumerico,
      );
    });

    setMensaje("La elección fue quitada de tu pantalla.");
  }

  function editarVotacion(idVotacion) {
    setIdVotacionEditar(idVotacion);
    setVistaActiva("EDITAR");
    setError("");
    setMensaje("");
  }

  function abrirDetalle(votacion) {
    const idVotacion = obtenerIdVotacion(votacion);

    if (!idVotacion) {
      setError("No se encontró el identificador de la elección.");
      return;
    }

    setIdVotacionDetalle(Number(idVotacion));
    setVistaActiva("DETALLE");
    setError("");
    setMensaje("");
  }

  async function copiarLinkVotacion(idVotacion) {
    const idNumerico = Number(idVotacion);

    if (!idNumerico) {
      setMensaje("");
      setError("No se encontró el identificador de la elección.");
      return;
    }

    const enlace = `${window.location.origin}/elecciones?votacion=${idNumerico}`;

    try {
      await copiarTexto(enlace);

      setError("");
      setMensaje("El link de la elección fue copiado.");
    } catch (excepcion) {
      setMensaje("");
      setError(excepcion.message || "No se pudo copiar el link.");
    }
  }

  function volverAlInicio() {
    setVistaActiva("INICIO");
    setIdVotacionEditar(null);
    setIdVotacionDetalle(null);
    setError("");
    setMensaje("");
    cargarDatos();
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
        perfil={perfil}
        seccionActiva="mis-elecciones"
        abierta={menuLateralAbierto}
        alCerrar={() => setMenuLateralAbierto(false)}
        alCerrarSesion={alCerrarSesion}
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
          alIrAPerfil={() => setVistaActiva("PERFIL")}
          alCerrarSesion={alCerrarSesion}
        />

        {error && <div className="mensaje mensaje--error">{error}</div>}

        {mensaje && <div className="mensaje mensaje--correcto">{mensaje}</div>}

        {vistaActiva === "PERFIL" && (
          <PerfilUsuario volver={volverAlInicio} onActualizado={cargarDatos} />
        )}

        {vistaActiva === "EDITAR" && (
          <EditarVotacion
            idVotacion={idVotacionEditar}
            alVolver={volverAlInicio}
          />
        )}

        {vistaActiva === "DETALLE" && (
          <DetalleVotacion
            idVotacion={idVotacionDetalle}
            alVolver={volverAlInicio}
          />
        )}

        {vistaActiva === "INICIO" && (
          <>
            <section className="bienvenida-panel">
              <p>Aquí puedes consultar tus votaciones activas.</p>
            </section>

            <section className="votaciones-destacadas">
              {votacionesDestacadas.length > 0 ? (
                votacionesDestacadas.map((votacion) => (
                  <TarjetaVotacion
                    key={obtenerIdVotacion(votacion)}
                    votacion={votacion}
                  />
                ))
              ) : (
                <div className="estado-vacio estado-vacio--grande">
                  <div>
                    <h2>No hay elecciones activas</h2>
                    <p>Las votaciones activas aparecerán en esta sección.</p>
                  </div>
                </div>
              )}
            </section>

            <section className="seccion-elecciones">
              <div className="seccion-elecciones__superior">
                <h2>Todas tus elecciones.</h2>

                <div className="seccion-elecciones__filtros">
                  <label className="campo-busqueda">
                    <span aria-hidden="true">⌕</span>

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
                    aria-label="Filtrar por periodo"
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
                      const idVotacion = obtenerIdVotacion(votacion);
                      return (
                        <tr key={idVotacion}>
                          <td data-label="Elección">
                            <div className="informacion-eleccion">
                              {imagen ? (
                                <img
                                  src={imagen}
                                  alt=""
                                  className="informacion-eleccion__imagen"
                                  onError={(evento) => {
                                    evento.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="informacion-eleccion__icono">
                                  <img src={logovotar} alt="" />
                                </div>
                              )}

                              <div>
                                <strong>
                                  {traducirEstado(votacion.estado)}
                                </strong>
                                <span>{votacion.titulo}</span>
                              </div>
                            </div>
                          </td>

                          <td data-label="Total votos">
                            {formateadorNumero.format(
                              obtenerTotalVotos(votacion),
                            )}
                          </td>

                          <td data-label="Fecha inicio">
                            {formatearFecha(votacion.fechaInicio)}
                          </td>

                          <td data-label="Fecha de cierre">
                            {votacion.estado === "ACTIVA"
                              ? "Aún activa"
                              : formatearFecha(votacion.fechaFin)}
                          </td>

                          <td data-label="Privacidad">
                            {traducirPrivacidad(votacion.privacidad)}
                          </td>

                          <td data-label="Acciones">
                            <div className="acciones-eleccion">
                              <button
                                type="button"
                                className="boton-accion boton-accion--editar"
                                onClick={() => editarVotacion(idVotacion)}
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                className="boton-accion boton-accion--detalle"
                                onClick={() => abrirDetalle(votacion)}
                              >
                                Detalle
                              </button>

                              <button
                                type="button"
                                className="boton-accion boton-accion--copiar"
                                onClick={() => copiarLinkVotacion(idVotacion)}
                              >
                                Copiar link
                              </button>

                              <button
                                type="button"
                                className="boton-accion boton-accion--eliminar"
                                onClick={() => eliminarVotacion(idVotacion)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {eleccionesFiltradas.length === 0 && (
                      <tr className="tabla-elecciones__fila-vacia">
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
          </>
        )}
      </main>
    </div>
  );
}

export default Inicio;
