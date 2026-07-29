import { useEffect, useMemo, useState } from "react";

import { peticionApi, resolverUrlArchivo } from "../api/clienteApi";

import "./VotarVotacion.css";

const numeros = new Intl.NumberFormat("es-MX");

function normalizarLista(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  const posibles = [
    respuesta?.content,
    respuesta?.contenido,
    respuesta?.data,
    respuesta?.data?.content,
    respuesta?.votos,
    respuesta?.participaciones,
  ];

  return posibles.find(Array.isArray) || [];
}

function obtenerIdVotacion() {
  const parametros = new URLSearchParams(window.location.search);
  const id = Number(parametros.get("votacion"));

  return Number.isInteger(id) && id > 0 ? id : null;
}

function claveOpcion(idUsuario, idVotacion) {
  return `opcionSeleccionada_${idUsuario}_${idVotacion}`;
}

function claveToken(idUsuario, idVotacion) {
  return `tokenCambioVoto_${idUsuario}_${idVotacion}`;
}

function extraerToken(respuesta) {
  return (
    respuesta?.tokenCambio ||
    respuesta?.tokenCambioVoto ||
    respuesta?.data?.tokenCambio ||
    respuesta?.data?.tokenCambioVoto ||
    null
  );
}

function combinarOpciones(detalle, resultados) {
  const opciones = Array.isArray(detalle?.opciones)
    ? detalle.opciones
    : [];

  const resultadosOpciones = Array.isArray(resultados?.opciones)
    ? resultados.opciones
    : [];

  return opciones.map((opcion) => {
    const resultado = resultadosOpciones.find(
      (item) =>
        Number(item.idOpcion ?? item.id) ===
        Number(opcion.idOpcion ?? opcion.id),
    );

    return {
      ...opcion,
      totalVotos: Number(
        resultado?.totalVotos ??
          resultado?.votos ??
          opcion.totalVotos ??
          0,
      ),
    };
  });
}

function crearResultadosVacios(detalle) {
  return {
    totalVotantes: Number(detalle?.totalVotos ?? 0),
    opciones: [],
  };
}

function obtenerMensajeCarga(excepcion) {
  const texto = String(excepcion?.message || "");
  const textoMinusculas = texto.toLowerCase();

  if (
    texto.includes("403") ||
    textoMinusculas.includes("acceso") ||
    textoMinusculas.includes("invit")
  ) {
    return "Esta elección es privada. El creador debe invitar a esta cuenta antes de que pueda votar.";
  }

  if (
    texto.includes("401") ||
    textoMinusculas.includes("autentic")
  ) {
    return "Debes iniciar sesión para abrir esta elección.";
  }

  return texto || "No se pudo cargar la elección.";
}

function VotarVotacion() {
  const idVotacion = useMemo(obtenerIdVotacion, []);

  const [perfil, setPerfil] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [resultados, setResultados] = useState(null);

  const [resultadosDisponibles, setResultadosDisponibles] =
    useState(true);

  const [yaVoto, setYaVoto] = useState(false);
  const [seleccionada, setSeleccionada] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function recargarResultados() {
    try {
      const nuevos = await peticionApi(
        `/votaciones/${idVotacion}/resultados`,
      );

      setResultados(nuevos);
      setResultadosDisponibles(true);
    } catch (excepcion) {
      console.warn(
        "El voto se guardó, pero esta cuenta no puede consultar los resultados:",
        excepcion,
      );

      setResultadosDisponibles(false);
    }
  }

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      if (!idVotacion) {
        setError("El enlace de la elección no es válido.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");
        setMensaje("");

        const [datosPerfil, datosDetalle] = await Promise.all([
          peticionApi("/usuarios/perfil"),
          peticionApi(`/votaciones/${idVotacion}`),
        ]);

        let datosResultados = crearResultadosVacios(datosDetalle);
        let puedeVerResultados = true;

        try {
          datosResultados = await peticionApi(
            `/votaciones/${idVotacion}/resultados`,
          );
        } catch (excepcion) {
          puedeVerResultados = false;

          console.warn(
            "Los resultados de esta elección están restringidos:",
            excepcion,
          );
        }

        let votos = [];

        try {
          const respuestaVotos = await peticionApi("/votos/mios");
          votos = normalizarLista(respuestaVotos);
        } catch (excepcion) {
          console.warn(
            "No se pudo cargar el historial de votos:",
            excepcion,
          );
        }

        const participacionEncontrada = votos.some(
          (voto) =>
            Number(voto.idVotacion) === Number(idVotacion),
        );

        const opcionGuardada = localStorage.getItem(
          claveOpcion(datosPerfil.idUsuario, idVotacion),
        );

        if (cancelado) {
          return;
        }

        setPerfil(datosPerfil);
        setDetalle(datosDetalle);
        setResultados(datosResultados);
        setResultadosDisponibles(puedeVerResultados);

        setYaVoto(participacionEncontrada);

        setSeleccionada(
          participacionEncontrada && opcionGuardada
            ? Number(opcionGuardada)
            : null,
        );


        if (!participacionEncontrada) {
          localStorage.removeItem(
            claveOpcion(datosPerfil.idUsuario, idVotacion),
          );

          localStorage.removeItem(
            claveToken(datosPerfil.idUsuario, idVotacion),
          );
        }
      } catch (excepcion) {
        if (!cancelado) {
          setError(obtenerMensajeCarga(excepcion));
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => {
      cancelado = true;
    };
  }, [idVotacion]);

  const opciones = useMemo(
    () => combinarOpciones(detalle, resultados),
    [detalle, resultados],
  );

  const mayorCantidad = useMemo(
    () =>
      Math.max(
        ...opciones.map((opcion) =>
          Number(opcion.totalVotos || 0),
        ),
        0,
      ),
    [opciones],
  );

  async function votar(opcion) {
    if (!perfil || !detalle || guardando) {
      return;
    }

    if (yaVoto && !detalle.permiteCambioVoto) {
      setError("Esta elección no permite cambiar el voto.");
      setMensaje("");
      return;
    }

    const idOpcion = Number(opcion.idOpcion ?? opcion.id);

    if (!Number.isInteger(idOpcion) || idOpcion <= 0) {
      setError("La opción seleccionada no es válida.");
      setMensaje("");
      return;
    }

    const seleccionAnterior = seleccionada;

    try {
      setGuardando(true);
      setError("");
      setMensaje("");
      setSeleccionada(idOpcion);

      const cuerpo = {
        idsOpciones: [idOpcion],
      };

      if (yaVoto === true) {
        if (detalle.tipoVoto === "ANONIMO") {
          const token = localStorage.getItem(
            claveToken(perfil.idUsuario, idVotacion),
          );

          if (!token) {
            throw new Error(
              "Este voto anónimo solo puede cambiarse desde el navegador donde se emitió.",
            );
          }

          cuerpo.tokenCambio = token;
        }

        await peticionApi(
          `/votaciones/${idVotacion}/votos/mi-voto`,
          {
            method: "PUT",
            body: JSON.stringify(cuerpo),
          },
        );

        setMensaje(
          `Tu voto fue cambiado a "${opcion.nombre}".`,
        );
      } else {
        const respuesta = await peticionApi(
          `/votaciones/${idVotacion}/votos`,
          {
            method: "POST",
            body: JSON.stringify(cuerpo),
          },
        );

        if (detalle.tipoVoto === "ANONIMO") {
          const token = extraerToken(respuesta);

          if (token) {
            localStorage.setItem(
              claveToken(perfil.idUsuario, idVotacion),
              token,
            );
          }
        }

        setYaVoto(true);

        setMensaje(
          `Tu voto por "${opcion.nombre}" fue registrado.`,
        );
      }

      localStorage.setItem(
        claveOpcion(perfil.idUsuario, idVotacion),
        String(idOpcion),
      );

      await recargarResultados();
    } catch (excepcion) {
      setSeleccionada(seleccionAnterior);
      setMensaje("");
      setError(
        excepcion.message || "No se pudo guardar el voto.",
      );
    } finally {
      setGuardando(false);
    }
  }

  function volver() {
    window.location.href = "/";
  }

  function iniciarSesion() {
    window.location.href = "/login";
  }

  if (cargando) {
    return (
      <main className="votar-link votar-link--centrado">
        <div className="votar-link__carga" />
        <p>Cargando elección...</p>
      </main>
    );
  }

  if (error && !detalle) {
    const requiereSesion = error
      .toLowerCase()
      .includes("iniciar sesión");

    return (
      <main className="votar-link votar-link--centrado">
        <section className="votar-link__error">
          <h1>No se pudo abrir la elección</h1>

          <p>{error}</p>

          <div>
            <button type="button" onClick={volver}>
              Volver
            </button>

            {requiereSesion && (
              <button
                type="button"
                className="votar-link__principal"
                onClick={iniciarSesion}
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </section>
      </main>
    );
  }

  const portada = resolverUrlArchivo(
    detalle?.imagenPortadaUrl,
  );

  const totalVotos = Number(
    resultados?.totalVotantes ??
      resultados?.totalVotos ??
      detalle?.totalVotos ??
      0,
  );

  return (
    <main className="votar-link">
      <header className="votar-link__header">
        
      </header>

      <section className="votar-link__tarjeta">
        <div className="votar-link__titulo">
          <div>
           
            <h1>{detalle.titulo}</h1>

            <p>
              {detalle.descripcion ||
                "Selecciona una opción para votar."}
            </p>
          </div>

          {portada && (
            <img
              src={portada}
              alt=""
              onError={(evento) => {
                evento.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>

        {error && (
          <div className="votar-link__mensaje-error">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="votar-link__mensaje-correcto">
            {mensaje}
          </div>
        )}

        <div className="votar-link__resumen">

          <span>
            {resultadosDisponibles
              ? `Total: ${numeros.format(totalVotos)} votos`
              : "Resultados ocultos para participantes"}
          </span>
        </div>

        <div className="votar-link__opciones">
          {opciones.map((opcion) => {
            const idOpcion = Number(
              opcion.idOpcion ?? opcion.id,
            );

            const votos = Number(opcion.totalVotos || 0);

            const proporcion =
              mayorCantidad === 0
                ? 0
                : votos / mayorCantidad;

            const activa =
              Number(seleccionada) === idOpcion;

            const imagen = resolverUrlArchivo(
              opcion.imagenUrl,
            );

            return (
              <button
                type="button"
                key={idOpcion}
                className={[
                  "votar-link__opcion",
                  activa
                    ? "votar-link__opcion--activa"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={
                  guardando ||
                  (yaVoto &&
                    !detalle.permiteCambioVoto)
                }
                onClick={() => votar(opcion)}
              >
                <div className="votar-link__opcion-arriba">
                  <div>
                    {imagen && (
                      <img
                        src={imagen}
                        alt=""
                        onError={(evento) => {
                          evento.currentTarget.style.display =
                            "none";
                        }}
                      />
                    )}

                    <strong>{opcion.nombre}</strong>
                  </div>

                  {resultadosDisponibles && (
                    <span>
                      {numeros.format(votos)} votos
                    </span>
                  )}
                </div>

                {resultadosDisponibles && (
                  <div className="votar-link__pista">
                    <div
                      style={{
                        transform: `scaleX(${proporcion})`,
                      }}
                    />
                  </div>
                )}

                <small>
                  {guardando && activa
                    ? "Guardando voto..."
                    : activa
                      ? "Tu opción seleccionada"
                      : yaVoto &&
                          detalle.permiteCambioVoto
                        ? "Haz clic para cambiar tu voto"
                        : "Haz clic para votar"}
                </small>
              </button>
            );
          })}
        </div>

        {opciones.length === 0 && (
          <div className="votar-link__mensaje-error">
            Esta elección no tiene opciones disponibles.
          </div>
        )}
      </section>
    </main>
  );
}

export default VotarVotacion;