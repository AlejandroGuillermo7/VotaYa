import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import BarraLateral from "../Components/BarraLateral";
import EncabezadoUsuario from "../Components/EncabezadoUsuario";
import filtrar from "../assets/icons/filtrar.svg";

import {
  peticionApi,
  resolverUrlArchivo,
} from "../api/clienteApi";

import "./Elecciones.css";

const formateadorNumero =
  new Intl.NumberFormat("es-MX");

const COLORES_GRAFICA = [
  "#2675e5",
  "#b675eb",
  "#ff2f91",
  "#5a34dc",
  "#5bc8a5",
  "#ffb84d",
];

function normalizarLista(respuesta) {
  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  const posiblesListas = [
    respuesta?.content,
    respuesta?.contenido,
    respuesta?.data,
    respuesta?.data?.content,
    respuesta?.data?.contenido,
    respuesta?.votaciones,
    respuesta?.categorias,
    respuesta?.participaciones,
    respuesta?.items,
    respuesta?.lista,
    respuesta?.resultados,
  ];

  const listaEncontrada =
    posiblesListas.find(Array.isArray);

  return listaEncontrada || [];
}

function obtenerClaveOpcionSeleccionada(
  idUsuario,
  idVotacion,
) {
  return `opcionSeleccionada_${idUsuario}_${idVotacion}`;
}

function obtenerClaveTokenCambio(
  idUsuario,
  idVotacion,
) {
  return `tokenCambioVoto_${idUsuario}_${idVotacion}`;
}

function formatearVotos(cantidad) {
  const total = Number(cantidad || 0);

  return `${formateadorNumero.format(total)} ${
    total === 1 ? "voto" : "votos"
  }`;
}

function obtenerOpcionesConResultados(
  votacion,
) {
  const opciones = Array.isArray(
    votacion?.opciones,
  )
    ? votacion.opciones
    : [];

  const resultados = Array.isArray(
    votacion?.resultados?.opciones,
  )
    ? votacion.resultados.opciones
    : [];

  return opciones.map((opcion) => {
    const resultado = resultados.find(
      (elemento) =>
        Number(elemento.idOpcion) ===
        Number(opcion.idOpcion),
    );

    return {
      ...opcion,
      totalVotos: Number(
        resultado?.totalVotos || 0,
      ),
      porcentaje: Number(
        resultado?.porcentaje || 0,
      ),
    };
  });
}

function obtenerImagenVotacion(votacion) {
  if (votacion?.imagenPortadaUrl) {
    return resolverUrlArchivo(
      votacion.imagenPortadaUrl,
    );
  }

  const opciones = Array.isArray(
    votacion?.opciones,
  )
    ? votacion.opciones
    : [];

  const opcionConImagen = opciones.find(
    (opcion) => opcion.imagenUrl,
  );

  return resolverUrlArchivo(
    opcionConImagen?.imagenUrl ||
      "/imagenes/votar.png",
  );
}

function obtenerNombreCategoria(votacion) {
  if (
    typeof votacion?.categoria === "string"
  ) {
    return votacion.categoria;
  }

  return (
    votacion?.nombreCategoria ||
    votacion?.categoria?.nombre ||
    "Sin categoría"
  );
}

/* =========================================================
   GRÁFICA VERTICAL
========================================================= */

function GraficaVertical({
  opciones,
  alSeleccionar,
  deshabilitado,
  idOpcionSeleccionada,
}) {
  const listaOpciones = Array.isArray(
    opciones,
  )
    ? opciones
    : [];

  const mayorCantidad = Math.max(
    ...listaOpciones.map((opcion) =>
      Number(opcion.totalVotos || 0),
    ),
    0,
  );

  const ALTURA_MAXIMA = 115;

  return (
    <div className="grafica-disponible-vertical">
      {listaOpciones.map((opcion) => {
        const totalVotos = Number(
          opcion.totalVotos || 0,
        );

        const estaSeleccionada =
          Number(opcion.idOpcion) ===
          Number(idOpcionSeleccionada);

        const altura =
          mayorCantidad === 0
            ? 0
            : (totalVotos /
                mayorCantidad) *
              ALTURA_MAXIMA;

        return (
          <button
            type="button"
            key={opcion.idOpcion}
            className="grafica-disponible-vertical__elemento grafica-opcion"
            disabled={deshabilitado}
            onClick={() =>
              alSeleccionar(opcion)
            }
            title={`Votar por ${opcion.nombre}`}
          >
            <span className="grafica-disponible-vertical__cantidad">
              {formatearVotos(totalVotos)}
            </span>

            <div
              className={[
                "grafica-disponible-vertical__barra",
                estaSeleccionada
                  ? "grafica-disponible-vertical__barra--seleccionada"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                height: `${altura}px`,
              }}
            />

            <span className="grafica-disponible-vertical__nombre">
              {opcion.nombre}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   GRÁFICA HORIZONTAL
========================================================= */

function GraficaHorizontal({
  opciones,
  alSeleccionar,
  deshabilitado,
  idOpcionSeleccionada,
}) {
  const listaOpciones = Array.isArray(
    opciones,
  )
    ? opciones
    : [];

  const votosNormalizados =
    listaOpciones.map((opcion) =>
      Number(opcion.totalVotos ?? 0),
    );

  const mayorCantidad = Math.max(
    ...votosNormalizados,
    0,
  );

  return (
    <div className="grafica-disponible-horizontal">
      {listaOpciones.map((opcion) => {
        const totalVotos = Number(
          opcion.totalVotos ?? 0,
        );

        const estaSeleccionada =
          Number(opcion.idOpcion) ===
          Number(idOpcionSeleccionada);

        const anchura =
          mayorCantidad === 0
            ? 0
            : (totalVotos /
                mayorCantidad) *
              100;

        const imagen = resolverUrlArchivo(
          opcion.imagenUrl,
        );

        return (
          <button
            type="button"
            key={opcion.idOpcion}
            className={[
              "grafica-disponible-horizontal__fila",
              "grafica-opcion-horizontal",
              estaSeleccionada
                ? "grafica-disponible-horizontal__fila--seleccionada"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={deshabilitado}
            onClick={() =>
              alSeleccionar(opcion)
            }
            title={`Votar por ${opcion.nombre}`}
          >
            <span className="grafica-disponible-horizontal__nombre">
              {opcion.nombre}
            </span>

            <div className="grafica-disponible-horizontal__pista">
              <div
                className={[
                  "grafica-disponible-horizontal__barra",
                  estaSeleccionada
                    ? "grafica-disponible-horizontal__barra--seleccionada"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  width: `${anchura}%`,
                }}
              />
            </div>

            <div className="grafica-disponible-horizontal__detalle">
              {imagen && (
                <img
                  src={imagen}
                  alt={opcion.nombre}
                  className="grafica-disponible-horizontal__imagen"
                  onError={(evento) => {
                    evento.currentTarget.style.display =
                      "none";
                  }}
                />
              )}

              <span className="grafica-disponible-horizontal__cantidad">
                {formatearVotos(totalVotos)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   GRÁFICA DE PASTEL
========================================================= */

function GraficaPastel({
  opciones,
  alSeleccionar,
  deshabilitado,
  idOpcionSeleccionada,
}) {
  const listaOpciones = Array.isArray(
    opciones,
  )
    ? opciones
    : [];

  const totalVotos = listaOpciones.reduce(
    (total, opcion) =>
      total +
      Number(opcion.totalVotos || 0),
    0,
  );

  let porcentajeAcumulado = 0;

  const segmentos = listaOpciones.map(
    (opcion, indice) => {
      const votosOpcion = Number(
        opcion.totalVotos || 0,
      );

      const porcentaje =
        totalVotos === 0
          ? 0
          : (votosOpcion /
              totalVotos) *
            100;

      const inicio =
        porcentajeAcumulado;

      const final =
        porcentajeAcumulado +
        porcentaje;

      porcentajeAcumulado = final;

      const color =
        COLORES_GRAFICA[
          indice %
            COLORES_GRAFICA.length
        ];

      return `${color} ${inicio}% ${final}%`;
    },
  );

  const opcionGanadora =
    totalVotos === 0 ||
    listaOpciones.length === 0
      ? null
      : listaOpciones.reduce(
          (ganadora, opcion) =>
            Number(opcion.totalVotos || 0) >
            Number(
              ganadora.totalVotos || 0,
            )
              ? opcion
              : ganadora,
          listaOpciones[0],
        );

  const porcentajeGanador =
    !opcionGanadora ||
    totalVotos === 0
      ? 0
      : Math.round(
          (Number(
            opcionGanadora.totalVotos ||
              0,
          ) *
            100) /
            totalVotos,
        );

  return (
    <div className="grafica-disponible-pastel">
      <div
        className="grafica-disponible-pastel__circulo"
        style={{
          background:
            totalVotos === 0
              ? "#edf3ff"
              : `conic-gradient(${segmentos.join(
                  ", ",
                )})`,
        }}
      >
        <div className="grafica-disponible-pastel__centro">
          <strong>
            {porcentajeGanador}%
          </strong>

          <span>
            {opcionGanadora
              ? opcionGanadora.nombre
              : "Sin votos"}
          </span>
        </div>
      </div>

      <div className="grafica-disponible-pastel__opciones">
        {listaOpciones.map(
          (opcion, indice) => {
            const estaSeleccionada =
              Number(opcion.idOpcion) ===
              Number(
                idOpcionSeleccionada,
              );

            return (
              <button
                type="button"
                key={opcion.idOpcion}
                disabled={deshabilitado}
                onClick={() =>
                  alSeleccionar(opcion)
                }
                className={[
                  "grafica-disponible-pastel__opcion",
                  estaSeleccionada
                    ? "grafica-disponible-pastel__opcion--seleccionada"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                title={`Votar por ${opcion.nombre}`}
              >
                <span
                  className="grafica-disponible-pastel__color"
                  style={{
                    background:
                      COLORES_GRAFICA[
                        indice %
                          COLORES_GRAFICA.length
                      ],
                  }}
                />

                <span className="grafica-disponible-pastel__texto">
                  <span>
                    {opcion.nombre}
                  </span>

                  <small>
                    {formatearVotos(
                      opcion.totalVotos,
                    )}
                  </small>
                </span>
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}

/* =========================================================
   TARJETA DE ELECCIÓN
========================================================= */

function TarjetaEleccionDisponible({
  votacion,
  yaVoto,
  votando,
  bloqueado,
  idOpcionSeleccionada,
  alSeleccionarOpcion,
}) {
  const opciones =
    obtenerOpcionesConResultados(
      votacion,
    );

  const imagen =
    obtenerImagenVotacion(votacion);

  const totalVotos =
    votacion?.resultados
      ?.totalVotantes ??
    votacion?.totalVotos ??
    0;

  const puedeSeleccionar =
    !bloqueado &&
    (!yaVoto ||
      votacion.permiteCambioVoto);

  function seleccionarOpcion(opcion) {
    if (!puedeSeleccionar) {
      return;
    }

    alSeleccionarOpcion(
      votacion,
      opcion,
    );
  }

  function mostrarGrafica() {
    if (opciones.length === 0) {
      return (
        <div className="tarjeta-eleccion__sin-opciones">
          Esta elección no tiene opciones
          disponibles.
        </div>
      );
    }

    if (
      votacion.tipoGrafica === "PASTEL"
    ) {
      return (
        <GraficaPastel
          opciones={opciones}
          alSeleccionar={
            seleccionarOpcion
          }
          deshabilitado={
            !puedeSeleccionar
          }
          idOpcionSeleccionada={
            idOpcionSeleccionada
          }
        />
      );
    }

    if (opciones.length <= 3) {
      return (
        <GraficaHorizontal
          opciones={opciones}
          alSeleccionar={
            seleccionarOpcion
          }
          deshabilitado={
            !puedeSeleccionar
          }
          idOpcionSeleccionada={
            idOpcionSeleccionada
          }
        />
      );
    }

    return (
      <GraficaVertical
        opciones={opciones}
        alSeleccionar={
          seleccionarOpcion
        }
        deshabilitado={
          !puedeSeleccionar
        }
        idOpcionSeleccionada={
          idOpcionSeleccionada
        }
      />
    );
  }

  function obtenerTextoEstado() {
    if (votando) {
      return "Guardando voto...";
    }

    const opcionSeleccionada =
      opciones.find(
        (opcion) =>
          Number(opcion.idOpcion) ===
          Number(
            idOpcionSeleccionada,
          ),
      );

    if (opcionSeleccionada) {
      return `Tu voto: ${opcionSeleccionada.nombre}`;
    }

    if (
      yaVoto &&
      votacion.permiteCambioVoto
    ) {
      return "Haz clic en otra opción para cambiar tu voto";
    }

    if (yaVoto) {
      return "Ya participaste en esta elección";
    }

    return "Haz clic en una opción para votar";
  }

  return (
    <article className="tarjeta-eleccion">
      <header className="tarjeta-eleccion__encabezado">
        <div className="tarjeta-eleccion__titulo-contenedor">
          <h2>{votacion.titulo}</h2>

          <p>
            {votacion.descripcion ||
              "Participa en esta elección y elige tu opción favorita."}
          </p>
        </div>

        <div className="tarjeta-eleccion__datos-superiores">
          {imagen && (
            <img
              src={imagen}
              alt=""
              className="tarjeta-eleccion__imagen"
              onError={(evento) => {
                evento.currentTarget.style.display =
                  "none";
              }}
            />
          )}

          <span className="tarjeta-eleccion__categoria">
            {obtenerNombreCategoria(
              votacion,
            )}
          </span>
        </div>
      </header>

      <div className="tarjeta-eleccion__grafica">
        {mostrarGrafica()}
      </div>

      <footer className="tarjeta-eleccion__pie">
        <span className="tarjeta-eleccion__total">
          Total:{" "}
          {formatearVotos(totalVotos)}
        </span>

        <span
          className={[
            "tarjeta-eleccion__estado",
            yaVoto
              ? "tarjeta-eleccion__estado--participado"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {obtenerTextoEstado()}
        </span>
      </footer>
    </article>
  );
}

/* =========================================================
   PÁGINA PRINCIPAL
========================================================= */

function Elecciones({
  alCerrarSesion,
  alCrearVotacion,
}) {
  const [perfil, setPerfil] =
    useState(null);

  const [votaciones, setVotaciones] =
    useState([]);

  const [categorias, setCategorias] =
    useState([]);

  const [
    participaciones,
    setParticipaciones,
  ] = useState([]);

  const [
    opcionesSeleccionadas,
    setOpcionesSeleccionadas,
  ] = useState({});

  const [orden, setOrden] =
    useState("MAS_VOTADAS");

  const [
    categoriaSeleccionada,
    setCategoriaSeleccionada,
  ] = useState("TODAS");

  const [
    fechaSeleccionada,
    setFechaSeleccionada,
  ] = useState("TODAS");

  const [
    menuLateralAbierto,
    setMenuLateralAbierto,
  ] = useState(false);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [
    idVotacionGuardando,
    setIdVotacionGuardando,
  ] = useState(null);

  const cargarDatos =
    useCallback(async () => {
      try {
        setCargando(true);
        setError("");

        const [
          datosPerfil,
          respuestaVotaciones,
          respuestaCategorias,
        ] = await Promise.all([
          peticionApi(
            "/usuarios/perfil",
          ),
          peticionApi(
            "/votaciones/disponibles",
          ),
          peticionApi("/categorias"),
        ]);

        const listaVotaciones =
          normalizarLista(
            respuestaVotaciones,
          );

        const listaCategorias =
          normalizarLista(
            respuestaCategorias,
          );

        let listaParticipaciones = [];

        try {
          const respuestaParticipaciones =
            await peticionApi(
              "/votos/mios",
            );

          listaParticipaciones =
            normalizarLista(
              respuestaParticipaciones,
            );
        } catch (excepcion) {
          console.warn(
            "No se pudieron cargar los votos del usuario:",
            excepcion.message,
          );

          listaParticipaciones = [];
        }

        const votacionesConResultados =
          await Promise.all(
            listaVotaciones.map(
              async (votacion) => {
                try {
                  const resultados =
                    await peticionApi(
                      `/votaciones/${votacion.idVotacion}/resultados`,
                    );

                  return {
                    ...votacion,
                    resultados,
                  };
                } catch (excepcion) {
                  console.warn(
                    `No se pudieron cargar los resultados de la votación ${votacion.idVotacion}:`,
                    excepcion.message,
                  );

                  return {
                    ...votacion,
                    resultados: {
                      totalVotantes:
                        votacion.totalVotos ||
                        0,
                      opciones: [],
                    },
                  };
                }
              },
            ),
          );

        const seleccionesGuardadas =
          {};

        votacionesConResultados.forEach(
          (votacion) => {
            const clave =
              obtenerClaveOpcionSeleccionada(
                datosPerfil.idUsuario,
                votacion.idVotacion,
              );

            const idOpcionGuardada =
              localStorage.getItem(clave);

            if (idOpcionGuardada) {
              seleccionesGuardadas[
                Number(
                  votacion.idVotacion,
                )
              ] = Number(
                idOpcionGuardada,
              );
            }
          },
        );

        setPerfil(datosPerfil);

        setVotaciones(
          votacionesConResultados,
        );

        setCategorias(
          listaCategorias,
        );

        setParticipaciones(
          listaParticipaciones,
        );

        setOpcionesSeleccionadas(
          seleccionesGuardadas,
        );
      } catch (excepcion) {
        setVotaciones([]);
        setCategorias([]);
        setParticipaciones([]);
        setOpcionesSeleccionadas(
          {},
        );

        setError(excepcion.message);
      } finally {
        setCargando(false);
      }
    }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const idsVotacionesParticipadas =
    useMemo(() => {
      const listaParticipaciones =
        Array.isArray(participaciones)
          ? participaciones
          : [];

      return new Set(
        listaParticipaciones.map(
          (participacion) =>
            Number(
              participacion.idVotacion,
            ),
        ),
      );
    }, [participaciones]);

  const votacionesFiltradas =
    useMemo(() => {
      const ahora = new Date();

      const listaVotaciones =
        Array.isArray(votaciones)
          ? votaciones
          : [];

      const resultado =
        listaVotaciones.filter(
          (votacion) => {
            const coincideCategoria =
              categoriaSeleccionada ===
                "TODAS" ||
              String(
                votacion.idCategoria ??
                  votacion.categoria
                    ?.idCategoria,
              ) ===
                String(
                  categoriaSeleccionada,
                );

            if (!coincideCategoria) {
              return false;
            }

            if (
              fechaSeleccionada ===
              "TODAS"
            ) {
              return true;
            }

            const fechaFin = new Date(
              votacion.fechaFin,
            );

            if (
              Number.isNaN(
                fechaFin.getTime(),
              )
            ) {
              return false;
            }

            const diferenciaMilisegundos =
              fechaFin.getTime() -
              ahora.getTime();

            const diferenciaDias =
              diferenciaMilisegundos /
              (1000 * 60 * 60 * 24);

            if (
              fechaSeleccionada ===
              "HOY"
            ) {
              return (
                diferenciaDias >= 0 &&
                diferenciaDias <= 1
              );
            }

            if (
              fechaSeleccionada ===
              "7_DIAS"
            ) {
              return (
                diferenciaDias >= 0 &&
                diferenciaDias <= 7
              );
            }

            if (
              fechaSeleccionada ===
              "30_DIAS"
            ) {
              return (
                diferenciaDias >= 0 &&
                diferenciaDias <= 30
              );
            }

            return true;
          },
        );

      return [...resultado].sort(
        (primera, segunda) => {
          if (
            orden === "MAS_VOTADAS"
          ) {
            const votosPrimera =
              Number(
                primera.resultados
                  ?.totalVotantes ??
                  primera.totalVotos ??
                  0,
              );

            const votosSegunda =
              Number(
                segunda.resultados
                  ?.totalVotantes ??
                  segunda.totalVotos ??
                  0,
              );

            return (
              votosSegunda -
              votosPrimera
            );
          }

          if (
            orden === "RECIENTES"
          ) {
            const fechaPrimera =
              new Date(
                primera.fechaCreacion ||
                  primera.fechaInicio,
              ).getTime();

            const fechaSegunda =
              new Date(
                segunda.fechaCreacion ||
                  segunda.fechaInicio,
              ).getTime();

            return (
              fechaSegunda -
              fechaPrimera
            );
          }

          if (
            orden ===
            "CIERRAN_PRONTO"
          ) {
            const fechaPrimera =
              new Date(
                primera.fechaFin,
              ).getTime();

            const fechaSegunda =
              new Date(
                segunda.fechaFin,
              ).getTime();

            return (
              fechaPrimera -
              fechaSegunda
            );
          }

          return 0;
        },
      );
    }, [
      votaciones,
      orden,
      categoriaSeleccionada,
      fechaSeleccionada,
    ]);

  function limpiarFiltros() {
    setOrden("MAS_VOTADAS");
    setCategoriaSeleccionada(
      "TODAS",
    );
    setFechaSeleccionada("TODAS");
  }

  async function actualizarResultados(
    idVotacion,
  ) {
    try {
      const resultadosActualizados =
        await peticionApi(
          `/votaciones/${idVotacion}/resultados`,
        );

      setVotaciones(
        (votacionesAnteriores) => {
          const lista =
            Array.isArray(
              votacionesAnteriores,
            )
              ? votacionesAnteriores
              : [];

          return lista.map(
            (votacion) =>
              Number(
                votacion.idVotacion,
              ) === Number(idVotacion)
                ? {
                    ...votacion,
                    resultados:
                      resultadosActualizados,
                  }
                : votacion,
          );
        },
      );
    } catch (excepcion) {
      console.warn(
        "El voto se guardó, pero no se pudieron actualizar los resultados:",
        excepcion.message,
      );
    }
  }

  async function registrarVoto(
    votacion,
    opcion,
  ) {
    const idVotacion = Number(
      votacion.idVotacion,
    );

    const idOpcion = Number(
      opcion.idOpcion,
    );

    const tieneSeleccionLocal =
      opcionesSeleccionadas[
        idVotacion
      ] !== undefined &&
      opcionesSeleccionadas[
        idVotacion
      ] !== null;

    const yaVoto =
      idsVotacionesParticipadas.has(
        idVotacion,
      ) || tieneSeleccionLocal;

    if (
      idVotacionGuardando !== null
    ) {
      return;
    }

    if (
      yaVoto &&
      !votacion.permiteCambioVoto
    ) {
      setMensaje("");

      setError(
        "Ya participaste y esta elección no permite cambiar el voto.",
      );

      return;
    }

    const opcionAnterior =
      opcionesSeleccionadas[
        idVotacion
      ] ?? null;

    setOpcionesSeleccionadas(
      (anteriores) => ({
        ...anteriores,
        [idVotacion]: idOpcion,
      }),
    );

    try {
      setError("");
      setMensaje("");
      setIdVotacionGuardando(
        idVotacion,
      );

      const cuerpo = {
        idsOpciones: [idOpcion],
      };

      if (yaVoto) {
        if (
          votacion.tipoVoto ===
          "ANONIMO"
        ) {
          const claveToken =
            obtenerClaveTokenCambio(
              perfil.idUsuario,
              idVotacion,
            );

          const tokenCambio =
            localStorage.getItem(
              claveToken,
            );

          if (!tokenCambio) {
            throw new Error(
              "No se encontró el token necesario para cambiar este voto anónimo.",
            );
          }

          cuerpo.tokenCambio =
            tokenCambio;
        }

        await peticionApi(
          `/votaciones/${idVotacion}/votos/mi-voto`,
          {
            method: "PUT",
            body: JSON.stringify(
              cuerpo,
            ),
          },
        );

        setMensaje(
          `Tu voto fue cambiado a "${opcion.nombre}".`,
        );
      } else {
        const respuesta =
          await peticionApi(
            `/votaciones/${idVotacion}/votos`,
            {
              method: "POST",
              body: JSON.stringify(
                cuerpo,
              ),
            },
          );

        if (
          votacion.tipoVoto ===
            "ANONIMO" &&
          respuesta?.tokenCambio
        ) {
          const claveToken =
            obtenerClaveTokenCambio(
              perfil.idUsuario,
              idVotacion,
            );

          localStorage.setItem(
            claveToken,
            respuesta.tokenCambio,
          );
        }

        setParticipaciones(
          (anteriores) => {
            const lista =
              Array.isArray(
                anteriores,
              )
                ? anteriores
                : [];

            const yaExiste =
              lista.some(
                (participacion) =>
                  Number(
                    participacion.idVotacion,
                  ) === idVotacion,
              );

            if (yaExiste) {
              return lista;
            }

            return [
              ...lista,
              {
                idVotacion,
                tipoVoto:
                  votacion.tipoVoto,
              },
            ];
          },
        );

        setMensaje(
          `Tu voto por "${opcion.nombre}" fue registrado correctamente.`,
        );
      }

      const claveOpcion =
        obtenerClaveOpcionSeleccionada(
          perfil.idUsuario,
          idVotacion,
        );

      localStorage.setItem(
        claveOpcion,
        String(idOpcion),
      );

      await actualizarResultados(
        idVotacion,
      );
    } catch (excepcion) {
      setOpcionesSeleccionadas(
        (anteriores) => {
          const nuevasSelecciones = {
            ...anteriores,
          };

          if (
            opcionAnterior === null
          ) {
            delete nuevasSelecciones[
              idVotacion
            ];
          } else {
            nuevasSelecciones[
              idVotacion
            ] = opcionAnterior;
          }

          return nuevasSelecciones;
        },
      );

      const claveOpcion =
        obtenerClaveOpcionSeleccionada(
          perfil.idUsuario,
          idVotacion,
        );

      if (opcionAnterior === null) {
        localStorage.removeItem(
          claveOpcion,
        );
      } else {
        localStorage.setItem(
          claveOpcion,
          String(opcionAnterior),
        );
      }

      setMensaje("");
      setError(excepcion.message);
    } finally {
      setIdVotacionGuardando(null);
    }
  }

  function crearVotacion() {
    if (
      typeof alCrearVotacion ===
      "function"
    ) {
      alCrearVotacion();
      return;
    }

    window.location.href =
      "/crear-votacion";
  }

  if (cargando) {
    return (
      <div className="pantalla-elecciones-carga">
        <div className="pantalla-elecciones-carga__circulo" />

        <p>
          Cargando elecciones
          disponibles...
        </p>
      </div>
    );
  }

  return (
    <div className="pagina-elecciones">
      <BarraLateral
        perfil={perfil}
        seccionActiva="elecciones"
        abierta={
          menuLateralAbierto
        }
        alCerrar={() =>
          setMenuLateralAbierto(
            false,
          )
        }
        alCerrarSesion={
          alCerrarSesion
        }
      />

      {menuLateralAbierto && (
        <button
          type="button"
          className="fondo-sidebar-elecciones"
          aria-label="Cerrar menú lateral"
          onClick={() =>
            setMenuLateralAbierto(
              false,
            )
          }
        />
      )}

      <main className="contenido-elecciones">
        <EncabezadoUsuario
          perfil={perfil}
          titulo="ELECCIONES."
          alAbrirMenu={() =>
            setMenuLateralAbierto(
              true,
            )
          }
        />

        {error && (
          <div className="mensaje-elecciones-error">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="mensaje-elecciones-correcto">
            {mensaje}
          </div>
        )}

        <section className="barra-filtros-elecciones">
          <div className="barra-filtros-elecciones__icono">
            <img
              width={20}
              src={filtrar}
              alt="Filtrar"
            />
          </div>

          <div className="barra-filtros-elecciones__titulo">
            Filtrar por
          </div>

          <select
            value={orden}
            onChange={(evento) =>
              setOrden(
                evento.target.value,
              )
            }
          >
            <option value="MAS_VOTADAS">
              Más votados
            </option>

            <option value="RECIENTES">
              Más recientes
            </option>

            <option value="CIERRAN_PRONTO">
              Cierran pronto
            </option>
          </select>

          <select
            value={
              categoriaSeleccionada
            }
            onChange={(evento) =>
              setCategoriaSeleccionada(
                evento.target.value,
              )
            }
          >
            <option value="TODAS">
              Categoría
            </option>

            {(
              Array.isArray(categorias)
                ? categorias
                : []
            ).map((categoria) => (
              <option
                key={
                  categoria.idCategoria ??
                  categoria.id
                }
                value={
                  categoria.idCategoria ??
                  categoria.id
                }
              >
                {categoria.nombre}
              </option>
            ))}
          </select>

          <select
            value={
              fechaSeleccionada
            }
            onChange={(evento) =>
              setFechaSeleccionada(
                evento.target.value,
              )
            }
          >
            <option value="TODAS">
              Fecha
            </option>

            <option value="HOY">
              Terminan hoy
            </option>

            <option value="7_DIAS">
              Próximos 7 días
            </option>

            <option value="30_DIAS">
              Próximos 30 días
            </option>
          </select>

          <button
            type="button"
            className="barra-filtros-elecciones__limpiar"
            onClick={limpiarFiltros}
          >
            ↻ Limpiar filtros
          </button>

          <button
            type="button"
            className="barra-filtros-elecciones__crear"
            onClick={crearVotacion}
          >
            Crear mi elección
          </button>
        </section>

        <section className="rejilla-elecciones">
          {votacionesFiltradas.map(
            (votacion) => {
              const idVotacion =
                Number(
                  votacion.idVotacion,
                );

              const tieneSeleccionLocal =
                opcionesSeleccionadas[
                  idVotacion
                ] !== undefined &&
                opcionesSeleccionadas[
                  idVotacion
                ] !== null;

              const yaVoto =
                idsVotacionesParticipadas.has(
                  idVotacion,
                ) ||
                tieneSeleccionLocal;

              return (
                <TarjetaEleccionDisponible
                  key={idVotacion}
                  votacion={votacion}
                  yaVoto={yaVoto}
                  votando={
                    idVotacionGuardando ===
                    idVotacion
                  }
                  bloqueado={
                    idVotacionGuardando !==
                    null
                  }
                  idOpcionSeleccionada={
                    opcionesSeleccionadas[
                      idVotacion
                    ] ?? null
                  }
                  alSeleccionarOpcion={
                    registrarVoto
                  }
                />
              );
            },
          )}

          {votacionesFiltradas.length ===
            0 && (
            <div className="elecciones-sin-resultados">
              <h2>
                No hay elecciones
                disponibles
              </h2>

              <p>
                No se encontraron elecciones
                activas con los filtros
                seleccionados.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Elecciones;