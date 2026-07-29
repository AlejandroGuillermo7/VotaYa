import { useEffect, useMemo, useState } from "react";

import { peticionApi, resolverUrlArchivo } from "../api/clienteApi";

import "./DetalleVotacion.css";

const formateadorNumero = new Intl.NumberFormat("es-MX");

const formateadorFecha = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formateadorHora = new Intl.DateTimeFormat("es-MX", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const formateadorFechaHora = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function normalizarLista(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  const posiblesListas = [
    respuesta?.participantes,
    respuesta?.content,
    respuesta?.contenido,
    respuesta?.data,
    respuesta?.data?.participantes,
    respuesta?.data?.content,
  ];

  return posiblesListas.find(Array.isArray) || [];
}

function convertirFecha(fecha) {
  if (!fecha) {
    return null;
  }

  const convertida = new Date(fecha);

  return Number.isNaN(convertida.getTime()) ? null : convertida;
}

function formatearFecha(fecha) {
  const convertida = convertirFecha(fecha);

  return convertida ? formateadorFecha.format(convertida) : "—";
}

function formatearHora(fecha) {
  const convertida = convertirFecha(fecha);

  return convertida ? formateadorHora.format(convertida) : "—";
}

function formatearFechaHora(fecha) {
  const convertida = convertirFecha(fecha);

  return convertida ? formateadorFechaHora.format(convertida) : "—";
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

function obtenerImagenPortada(votacion) {
  if (votacion?.imagenPortadaUrl) {
    return resolverUrlArchivo(votacion.imagenPortadaUrl);
  }

  const opciones = Array.isArray(votacion?.opciones) ? votacion.opciones : [];

  const opcionConImagen = opciones.find((opcion) => opcion.imagenUrl);

  return resolverUrlArchivo(opcionConImagen?.imagenUrl);
}

function combinarOpciones(detalle, resultados) {
  const opcionesDetalle = Array.isArray(detalle?.opciones)
    ? detalle.opciones
    : [];

  const opcionesResultado = Array.isArray(resultados?.opciones)
    ? resultados.opciones
    : [];

  return opcionesDetalle
    .map((opcion) => {
      const resultado = opcionesResultado.find(
        (elemento) =>
          Number(elemento.idOpcion ?? elemento.id) ===
          Number(opcion.idOpcion ?? opcion.id),
      );

      return {
        ...opcion,
        totalVotos: Number(
          resultado?.totalVotos ?? resultado?.votos ?? opcion.totalVotos ?? 0,
        ),
        porcentaje: Number(resultado?.porcentaje ?? 0),
      };
    })
    .sort(
      (primera, segunda) =>
        Number(primera.ordenVisual ?? 0) - Number(segunda.ordenVisual ?? 0),
    );
}

function obtenerTotalVotos(detalle, resultados) {
  return Number(
    resultados?.totalVotantes ??
      resultados?.totalVotos ??
      detalle?.totalVotos ??
      0,
  );
}

function obtenerTiempoRestante(fechaFin, ahora) {
  const cierre = convertirFecha(fechaFin);

  if (!cierre) {
    return "Sin fecha de cierre";
  }

  const diferencia = cierre.getTime() - ahora.getTime();

  if (diferencia <= 0) {
    return "Finalizada";
  }

  const minutosTotales = Math.floor(diferencia / 60000);
  const dias = Math.floor(minutosTotales / 1440);
  const horas = Math.floor((minutosTotales % 1440) / 60);
  const minutos = minutosTotales % 60;

  if (dias > 0) {
    return `${dias} ${dias === 1 ? "día" : "días"} ${horas} h`;
  }

  if (horas > 0) {
    return `${horas} h ${minutos} min`;
  }

  return `${Math.max(minutos, 1)} min`;
}

function GraficaDetalle({ opciones }) {
  const lista = Array.isArray(opciones) ? opciones : [];

  const mayorCantidad = Math.max(
    ...lista.map((opcion) => Number(opcion.totalVotos || 0)),
    0,
  );

  const opcionGanadora =
    mayorCantidad === 0
      ? null
      : lista.find(
          (opcion) => Number(opcion.totalVotos || 0) === mayorCantidad,
        );

  if (lista.length === 0) {
    return (
      <div className="detalle-votacion__grafica-vacia">
        No se encontraron opciones para esta elección.
      </div>
    );
  }

  return (
    <div className="detalle-votacion__grafica-scroll">
      <div className="detalle-votacion__grafica">
        {lista.map((opcion) => {
          const totalVotos = Number(opcion.totalVotos || 0);
          const proporcion =
            mayorCantidad === 0 ? 0 : totalVotos / mayorCantidad;
          const esGanadora =
            Number(opcion.idOpcion ?? opcion.id) ===
              Number(opcionGanadora?.idOpcion ?? opcionGanadora?.id) &&
            totalVotos > 0;

          return (
            <div
              className="detalle-votacion__barra-elemento"
              key={opcion.idOpcion ?? opcion.id ?? opcion.nombre}
            >
              <span className="detalle-votacion__barra-cantidad">
                {formateadorNumero.format(totalVotos)}
              </span>

              <div className="detalle-votacion__barra-contenedor">
                <div
                  className={[
                    "detalle-votacion__barra",
                    esGanadora ? "detalle-votacion__barra--ganadora" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    height: `${proporcion * 100}%`,
                  }}
                >
                  {esGanadora && (
                    <span className="detalle-votacion__barra-ganadora-texto">
                      Más votado
                    </span>
                  )}
                </div>
              </div>

              <span
                className="detalle-votacion__barra-nombre"
                title={opcion.nombre}
              >
                {opcion.nombre}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TablaParticipantes({ participantes, tipoVoto, totalVotos }) {
  const lista = Array.isArray(participantes) ? participantes : [];
  const esAnonima = tipoVoto === "ANONIMO";

  if (esAnonima) {
    return (
      <section className="detalle-votacion__participantes">
        <div className="detalle-votacion__seccion-titulo">
          <div>
            <h2>Participación anónima</h2>
            <p>
              Esta elección protege completamente la identidad de quienes
              votaron. No se muestran nombres, correos, fotografías ni la opción
              elegida por cada persona.
            </p>
          </div>

          <span>{formateadorNumero.format(Number(totalVotos || 0))}</span>
        </div>

        <div className="detalle-votacion__anonimato-aviso">
          <strong>Identidades protegidas</strong>
          <p>
            Solo se presenta el total general de votos y los resultados
            acumulados por opción.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="detalle-votacion__participantes">
      <div className="detalle-votacion__seccion-titulo">
        <div>
          <h2>Personas publicas que han votado</h2>
          <p>Aquí se muestra cada participante y la opción que seleccionó.</p>
        </div>

        <span>{formateadorNumero.format(lista.length)}</span>
      </div>

      {lista.length === 0 ? (
        <div className="detalle-votacion__participantes-vacio">
          Todavía no hay participantes registrados.
        </div>
      ) : (
        <div className="detalle-votacion__tabla-contenedor">
          <table className="detalle-votacion__tabla">
            <thead>
              <tr>
                <th>Participante</th>
                <th>Correo</th>
                <th>Fecha del voto</th>
                <th>Votó por</th>
              </tr>
            </thead>

            <tbody>
              {lista.map((participante, indice) => {
                const foto = resolverUrlArchivo(participante.fotoUrl);

                return (
                  <tr
                    key={`${participante.idUsuario ?? "participante"}-${participante.fechaVoto ?? indice}`}
                  >
                    <td data-label="Participante">
                      <div className="detalle-votacion__participante-identidad">
                        {foto ? (
                          <img
                            src={foto}
                            alt=""
                            onError={(evento) => {
                              evento.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="detalle-votacion__avatar-placeholder">
                            {(participante.nombreCompleto || "P")
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}

                        <strong>
                          {participante.nombreCompleto || "Participante"}
                        </strong>
                      </div>
                    </td>

                    <td data-label="Correo">{participante.correo || "—"}</td>

                    <td data-label="Fecha del voto">
                      {formatearFechaHora(participante.fechaVoto)}
                    </td>

                    <td data-label="Votó por">
                      <span className="detalle-votacion__opcion-votada">
                        {participante.opcionSeleccionada || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function DetalleVotacion({ idVotacion, alVolver }) {
  const [detalle, setDetalle] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [participantes, setParticipantes] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ahora, setAhora] = useState(new Date());

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setAhora(new Date());
    }, 60000);

    return () => window.clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (!idVotacion) {
      setError("No se encontró el identificador de la elección.");
      setCargando(false);
      return;
    }

    let cancelado = false;

    async function cargarDetalle() {
      try {
        setCargando(true);
        setError("");

        const [respuestaDetalle, respuestaResultados] = await Promise.all([
          peticionApi(`/votaciones/${idVotacion}`),
          peticionApi(`/votaciones/${idVotacion}/resultados`),
        ]);

        let listaParticipantes = [];

        if (respuestaDetalle?.tipoVoto === "IDENTIFICADO") {
          const respuestaParticipantes = await peticionApi(
            `/votaciones/${idVotacion}/participantes`,
          );

          listaParticipantes = normalizarLista(respuestaParticipantes);
        }

        if (cancelado) {
          return;
        }

        setDetalle(respuestaDetalle);
        setResultados(respuestaResultados);
        setParticipantes(listaParticipantes);
      } catch (excepcion) {
        if (!cancelado) {
          setError(excepcion.message);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarDetalle();

    return () => {
      cancelado = true;
    };
  }, [idVotacion]);

  const opciones = useMemo(
    () => combinarOpciones(detalle, resultados),
    [detalle, resultados],
  );

  if (cargando) {
    return (
      <section className="detalle-votacion detalle-votacion--cargando">
        <div className="detalle-votacion__carga-circulo" />
        <p>Cargando detalle de la elección...</p>
      </section>
    );
  }

  if (error || !detalle) {
    return (
      <section className="detalle-votacion detalle-votacion--error">
        <h1>No se pudo cargar el detalle</h1>
        <p>{error || "La elección no existe."}</p>
        <button type="button" onClick={alVolver}>
          Volver
        </button>
      </section>
    );
  }

  const imagenPortada = obtenerImagenPortada(detalle);
  const totalVotos = obtenerTotalVotos(detalle, resultados);
  const tiempoRestante = obtenerTiempoRestante(detalle.fechaFin, ahora);

  return (
    <section className="detalle-votacion">
      <div className="detalle-votacion__cabecera-pagina">
        <div>
          <h1>Detalle de votacion.</h1>
        </div>
      </div>

      <div className="detalle-votacion__pregunta">
        <h2>{detalle.titulo}</h2>

        {imagenPortada && (
          <img
            src={imagenPortada}
            alt=""
            onError={(evento) => {
              evento.currentTarget.style.display = "none";
            }}
          />
        )}
      </div>

      <article className="detalle-votacion__tarjeta-principal">
        <div className="detalle-votacion__metadatos">
          <div>
            <span>Estado:</span>
            <strong>{traducirEstado(detalle.estado)}</strong>
          </div>

          <div>
            <span>Creado por:</span>
            <strong>{detalle.nombreCreador || "—"}</strong>
          </div>

          <div>
            <span>Hora inicio:</span>
            <strong>{formatearHora(detalle.fechaInicio)}</strong>
          </div>

          <div>
            <span>Hora cierre:</span>
            <strong>{formatearHora(detalle.fechaFin)}</strong>
          </div>

          <div>
            <span>Tipo de voto:</span>
            <strong
              className={
                detalle.tipoVoto === "ANONIMO"
                  ? "detalle-votacion__valor-alerta"
                  : ""
              }
            >
              {traducirTipoVoto(detalle.tipoVoto)}
            </strong>
          </div>

          <div>
            <span>Categoría:</span>
            <strong>{detalle.nombreCategoria || "Sin categoría"}</strong>
          </div>

          <div>
            <span>Fecha inicio:</span>
            <strong>{formatearFecha(detalle.fechaInicio)}</strong>
          </div>

          <div>
            <span>Fecha cierre:</span>
            <strong>{formatearFecha(detalle.fechaFin)}</strong>
          </div>

          <div>
            <span>Privacidad:</span>
            <strong>{traducirPrivacidad(detalle.privacidad)}</strong>
          </div>
        </div>

        <p className="detalle-votacion__descripcion">
          {detalle.descripcion || "Esta elección no tiene descripción."}
        </p>

        <div className="detalle-votacion__contenido-principal">
          <GraficaDetalle opciones={opciones} />

          <aside className="detalle-votacion__estadisticas">
            <h2>Estadísticas:</h2>

            <div className="detalle-votacion__estadisticas-tarjeta">
              <div>
                <span>Total de votos:</span>
                <strong>{formateadorNumero.format(totalVotos)}</strong>
              </div>

              <div>
                <span>Tiempo restante:</span>
                <strong>{tiempoRestante}</strong>
              </div>

              <div>
                <span>Opciones:</span>
                <strong>{formateadorNumero.format(opciones.length)}</strong>
              </div>
            </div>
          </aside>
        </div>
      </article>

      <TablaParticipantes
        participantes={participantes}
        tipoVoto={detalle.tipoVoto}
        totalVotos={totalVotos}
      />
    </section>
  );
}

export default DetalleVotacion;
