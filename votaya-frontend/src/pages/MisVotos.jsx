import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import BarraLateral from "../Components/BarraLateral";
import EncabezadoUsuario from "../Components/EncabezadoUsuario";

import {
  peticionApi,
  resolverUrlArchivo,
} from "../api/clienteApi";

import "./MisVotos.css";

const formateadorFecha = new Intl.DateTimeFormat(
  "es-MX",
  {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
);

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

function traducirTipoVoto(tipoVoto) {
  const tipos = {
    ANONIMO: "Anónimo",
    IDENTIFICADO: "Identificado",
  };

  return tipos[tipoVoto] || tipoVoto || "—";
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

function traducirPrivacidad(privacidad) {
  return privacidad === "PRIVADA"
    ? "Privada"
    : "Pública";
}

function obtenerNombreCategoria(votacion) {
  if (typeof votacion.categoria === "string") {
    return votacion.categoria;
  }

  return (
    votacion.nombreCategoria ||
    votacion.categoria?.nombre ||
    "Sin categoría"
  );
}

function obtenerImagenVotacion(votacion) {
  if (votacion.imagenPortadaUrl) {
    return resolverUrlArchivo(
      votacion.imagenPortadaUrl,
    );
  }

  const opcionConImagen =
    votacion.opciones?.find(
      (opcion) => opcion.imagenUrl,
    );

  return resolverUrlArchivo(
    opcionConImagen?.imagenUrl,
  );
}

function normalizarParticipaciones(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  if (Array.isArray(respuesta?.contenido)) {
    return respuesta.contenido;
  }

  if (Array.isArray(respuesta?.content)) {
    return respuesta.content;
  }

  return [];
}

function MisVotos({ alCerrarSesion }) {
  const [perfil, setPerfil] = useState(null);
  const [votos, setVotos] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [tipoSeleccionado, setTipoSeleccionado] =
    useState("TODOS");

  const [
    menuLateralAbierto,
    setMenuLateralAbierto,
  ] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError("");

      const [datosPerfil, respuestaVotos] =
        await Promise.all([
          peticionApi("/usuarios/perfil"),
          peticionApi("/votos/mios"),
        ]);

      const participaciones =
        normalizarParticipaciones(respuestaVotos);

      /*
       * Consultamos los datos completos de cada
       * elección en la que participó el usuario.
       */
      const votosConDetalles = await Promise.all(
        participaciones.map(
          async (participacion) => {
            try {
              const detalleVotacion =
                await peticionApi(
                  `/votaciones/${participacion.idVotacion}`,
                );

              return {
                ...participacion,
                ...detalleVotacion,

                idParticipacion:
                  participacion.idParticipacion,

                idVotacion:
                  participacion.idVotacion,

                fechaVoto:
                  participacion.fechaVoto,

                tipoVoto:
                  participacion.tipoVoto ||
                  detalleVotacion.tipoVoto,

                titulo:
                  detalleVotacion.titulo ||
                  participacion.titulo,
              };
            } catch {
              /*
               * Si no se puede consultar el detalle,
               * conservamos lo que regresó /votos/mios.
               */
              return participacion;
            }
          },
        ),
      );

      /*
       * Mostramos primero los votos más recientes.
       */
      votosConDetalles.sort(
        (primero, segundo) =>
          new Date(segundo.fechaVoto).getTime() -
          new Date(primero.fechaVoto).getTime(),
      );

      setPerfil(datosPerfil);
      setVotos(votosConDetalles);
    } catch (excepcion) {
      setError(excepcion.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const votosFiltrados = useMemo(() => {
    const texto = busqueda
      .trim()
      .toLowerCase();

    return votos.filter((voto) => {
      const titulo =
        voto.titulo?.toLowerCase() || "";

      const categoria =
        obtenerNombreCategoria(voto)
          .toLowerCase();

      const coincideBusqueda =
        !texto ||
        titulo.includes(texto) ||
        categoria.includes(texto);

      const coincideTipo =
        tipoSeleccionado === "TODOS" ||
        voto.tipoVoto === tipoSeleccionado;

      return coincideBusqueda && coincideTipo;
    });
  }, [votos, busqueda, tipoSeleccionado]);

  if (cargando) {
    return (
      <div className="pantalla-mis-votos-carga">
        <div className="pantalla-mis-votos-carga__circulo" />

        <p>Cargando tus votos...</p>
      </div>
    );
  }

  return (
    <div className="pagina-mis-votos">
      <BarraLateral
        alCerrarSesion={alCerrarSesion}
        abierta={menuLateralAbierto}
        alCerrar={() =>
          setMenuLateralAbierto(false)
        }
        seccionActiva="mis-votos"
      />

      {menuLateralAbierto && (
        <button
          type="button"
          className="fondo-sidebar-mis-votos"
          aria-label="Cerrar menú lateral"
          onClick={() =>
            setMenuLateralAbierto(false)
          }
        />
      )}

      <main className="contenido-mis-votos">
        <EncabezadoUsuario
          perfil={perfil}
          titulo="MIS VOTOS."
          alAbrirMenu={() =>
            setMenuLateralAbierto(true)
          }
        />

        {error && (
          <div className="mensaje-mis-votos-error">
            {error}
          </div>
        )}

        <section className="panel-mis-votos">
          <div className="panel-mis-votos__superior">
            <div>
              <h2>Historial de votos.</h2>

              <p>
                Has participado en{" "}
                <strong>{votos.length}</strong>{" "}
                {votos.length === 1
                  ? "elección"
                  : "elecciones"}
                .
              </p>
            </div>

            <div className="panel-mis-votos__filtros">
              <label className="buscador-mis-votos">
                <span>⌕</span>

                <input
                  type="search"
                  placeholder="Buscar elección"
                  value={busqueda}
                  onChange={(evento) =>
                    setBusqueda(
                      evento.target.value,
                    )
                  }
                />
              </label>

              <select
                className="selector-tipo-voto"
                value={tipoSeleccionado}
                onChange={(evento) =>
                  setTipoSeleccionado(
                    evento.target.value,
                  )
                }
              >
                <option value="TODOS">
                  Todos
                </option>

                <option value="ANONIMO">
                  Anónimos
                </option>

                <option value="IDENTIFICADO">
                  Identificados
                </option>
              </select>
            </div>
          </div>

          <div className="contenedor-tabla-mis-votos">
            <table className="tabla-mis-votos">
              <thead>
                <tr>
                  <th>Elección</th>
                  <th>Fecha del voto</th>
                  <th>Tipo de voto</th>
                  <th>Estado</th>
                  <th>Privacidad</th>
                </tr>
              </thead>

              <tbody>
                {votosFiltrados.map((voto) => {
                  const imagen =
                    obtenerImagenVotacion(voto);

                  return (
                    <tr
                      key={
                        voto.idParticipacion ||
                        voto.idVotacion
                      }
                    >
                      <td>
                        <div className="informacion-voto">
                          {imagen ? (
                            <img
                              src={imagen}
                              alt=""
                              className="informacion-voto__imagen"
                            />
                          ) : (
                            <div className="informacion-voto__icono">
                              🗳️
                            </div>
                          )}

                          <div className="informacion-voto__texto">
                            <strong>
                              {voto.titulo ||
                                "Elección"}
                            </strong>

                            <span>
                              {obtenerNombreCategoria(
                                voto,
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {formatearFecha(
                          voto.fechaVoto,
                        )}
                      </td>

                      <td>
                        <span
                          className={[
                            "etiqueta-tipo-voto",
                            voto.tipoVoto ===
                            "ANONIMO"
                              ? "etiqueta-tipo-voto--anonimo"
                              : "etiqueta-tipo-voto--identificado",
                          ].join(" ")}
                        >
                          {traducirTipoVoto(
                            voto.tipoVoto,
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={[
                            "estado-votacion",
                            `estado-votacion--${(
                              voto.estado ||
                              "activa"
                            ).toLowerCase()}`,
                          ].join(" ")}
                        >
                          {traducirEstado(
                            voto.estado,
                          )}
                        </span>
                      </td>

                      <td>
                        {traducirPrivacidad(
                          voto.privacidad,
                        )}
                      </td>
                    </tr>
                  );
                })}

                {votosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      <div className="tabla-mis-votos__vacia">
                        <span>🗳️</span>

                        <strong>
                          No se encontraron votos
                        </strong>

                        <p>
                          Las elecciones donde
                          participes aparecerán aquí.
                        </p>
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

export default MisVotos;