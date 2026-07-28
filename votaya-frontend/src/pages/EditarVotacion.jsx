import { useEffect, useState } from "react";
import logo from "../assets/icons/icon-logo-offletters.png";
import imgBarras from "../assets/icons/icon-grafico-barras.webp";
import imgPastel from "../assets/icons/icon-grafico-pastel.webp";
import {
  peticionApi,
  resolverUrlArchivo,
} from "../api/clienteApi";
import "./EditarVotacion.css";

function EditarVotacion({ idVotacion, alVolver }) {
  const [titulo, setTitulo] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [estado, setEstado] = useState("ACTIVA");
  const [categoriasLista, setCategoriasLista] = useState([]);

  const [fechaC, setFechaC] = useState("");
  const [horaC, setHoraC] = useState("");
  const [fechaF, setFechaF] = useState("");
  const [horaF, setHoraF] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [imagenPortadaArchivo, setImagenPortadaArchivo] =
    useState(null);

  const [imagenPortadaVista, setImagenPortadaVista] =
    useState("");

  const [
    imagenPortadaUrlOriginal,
    setImagenPortadaUrlOriginal,
  ] = useState("");

  const [eliminarPortada, setEliminarPortada] =
    useState(false);

  const [opciones, setOpciones] = useState([
    {
      id: 1,
      idOpcion: null,
      nombre: "",
      imagen_url: "",
      archivo: null,
      orden_visual: 1,
    },
    {
      id: 2,
      idOpcion: null,
      nombre: "",
      imagen_url: "",
      archivo: null,
      orden_visual: 2,
    },
  ]);

  const [privacidad, setPrivacidad] =
    useState("PUBLICA");

  const [tipoVoto, setTipoVoto] =
    useState("ANONIMO");

  const [tipoSeleccion, setTipoSeleccion] =
    useState("UNICA");

  const [maxSelecciones, setMaxSelecciones] =
    useState(1);

  const [
    permiteCambioVoto,
    setPermiteCambioVoto,
  ] = useState(false);

  const [restriccionEdad, setRestriccionEdad] =
    useState("todos");

  const [tipoGrafica, setTipoGrafica] =
    useState("BARRAS");
const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] =
    useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarTodo() {
      const idActual =
        idVotacion ||
        sessionStorage.getItem("idVotacionEditar");

      if (!idActual) {
        setError(
          "No se especifica qué votación deseas editar."
        );
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const [categorias, votacion] =
          await Promise.all([
            peticionApi("/categorias").catch(() => [
              {
                id_categoria: 1,
                nombre: "Escolar / Académico",
              },
              {
                id_categoria: 2,
                nombre: "Política y Elecciones",
              },
              {
                id_categoria: 3,
                nombre: "Deportes",
              },
              {
                id_categoria: 4,
                nombre: "Entretenimiento",
              },
            ]),

            peticionApi(
              `/votaciones/${idActual}`
            ),
          ]);

        const listaCategorias = Array.isArray(
          categorias
        )
          ? categorias
          : categorias?.datos || [];

        setCategoriasLista(listaCategorias);

        if (!votacion) {
          throw new Error(
            "No se encontraron los datos de la votación."
          );
        }

        setTitulo(votacion.titulo || "");

        setIdCategoria(
          votacion.idCategoria ||
            votacion.id_categoria ||
            ""
        );

        setEstado(votacion.estado || "ACTIVA");

        setDescripcion(
          votacion.descripcion || ""
        );

        const portadaGuardada =
          votacion.imagenPortadaUrl ||
          votacion.imagen_portada_url ||
          "";

        setImagenPortadaUrlOriginal(
          portadaGuardada
        );

        setImagenPortadaVista(
          portadaGuardada
            ? resolverUrlArchivo(
                portadaGuardada
              )
            : ""
        );

        setImagenPortadaArchivo(null);
        setEliminarPortada(false);

        if (votacion.fechaInicio) {
          const [fechaInicio, horaInicio] =
            votacion.fechaInicio.split("T");

          setFechaC(fechaInicio || "");

          setHoraC(
            horaInicio
              ? horaInicio.substring(0, 5)
              : ""
          );
        }

        if (votacion.fechaFin) {
          const [fechaFin, horaFin] =
            votacion.fechaFin.split("T");

          setFechaF(fechaFin || "");

          setHoraF(
            horaFin
              ? horaFin.substring(0, 5)
              : ""
          );
        }

        setPrivacidad(
          votacion.privacidad || "PUBLICA"
        );

        setTipoVoto(
          votacion.tipoVoto ||
            votacion.tipo_voto ||
            "ANONIMO"
        );

        setTipoSeleccion(
          votacion.tipoSeleccion ||
            votacion.tipo_seleccion ||
            "UNICA"
        );

        setMaxSelecciones(
          votacion.maxSelecciones ||
            votacion.max_selecciones ||
            1
        );

        setPermiteCambioVoto(
          Boolean(
            votacion.permiteCambioVoto ??
              votacion.permite_cambio_voto
          )
        );

        setRestriccionEdad(
          votacion.edadMinima === 18 ||
            votacion.edad_minima === 18
            ? "18"
            : "todos"
        );

        setTipoGrafica(
          votacion.tipoGrafica ||
            votacion.tipo_grafica ||
            "BARRAS"
        );
if (
          Array.isArray(votacion.opciones) &&
          votacion.opciones.length > 0
        ) {
          setOpciones(
            votacion.opciones.map(
              (opcion, index) => {
                const imagenOpcion =
                  opcion.imagenUrl ||
                  opcion.imagen_url ||
                  "";

                return {
                  id:
                    opcion.idOpcion ||
                    opcion.id_opcion ||
                    opcion.id ||
                    index + 1,

                  idOpcion:
                    opcion.idOpcion ||
                    opcion.id_opcion ||
                    opcion.id ||
                    null,

                  nombre:
                    opcion.nombre || "",

                  imagen_url: imagenOpcion
                    ? resolverUrlArchivo(
                        imagenOpcion
                      )
                    : "",

                  imagen_url_original:
                    imagenOpcion,

                  archivo: null,

                  orden_visual:
                    opcion.ordenVisual ||
                    opcion.orden_visual ||
                    index + 1,
                };
              }
            )
          );
        }
      } catch (err) {
        console.error(
          "Error al cargar la votación:",
          err
        );

        setError(
          err.message ||
            "Error al cargar los datos."
        );
      } finally {
        setCargando(false);
      }
    }

    cargarTodo();
  }, [idVotacion]);

  useEffect(() => {
    return () => {
      if (
        imagenPortadaVista?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          imagenPortadaVista
        );
      }
    };
  }, [imagenPortadaVista]);

  const cambiarImagenPortada = (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith("image/")) {
      setError(
        "El archivo seleccionado debe ser una imagen."
      );

      e.target.value = "";
      return;
    }

    const limiteBytes = 5 * 1024 * 1024;

    if (archivo.size > limiteBytes) {
      setError(
        "La imagen de portada no debe superar los 5 MB."
      );

      e.target.value = "";
      return;
    }

    if (
      imagenPortadaVista?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        imagenPortadaVista
      );
    }

    const nuevaVistaPrevia =
      URL.createObjectURL(archivo);

    setImagenPortadaArchivo(archivo);
    setImagenPortadaVista(
      nuevaVistaPrevia
    );
    setEliminarPortada(false);
    setError("");
    setMensajeExito("");
  };

  const quitarImagenPortada = () => {
    if (
      imagenPortadaVista?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        imagenPortadaVista
      );
    }

    setImagenPortadaArchivo(null);
    setImagenPortadaVista("");
    setEliminarPortada(true);
    setError("");
    setMensajeExito("");

    const inputImagen =
      document.getElementById(
        "imagen-portada-editar"
      );

    if (inputImagen) {
      inputImagen.value = "";
    }
  };

  const agregarOpcion = () => {
    const nuevoOrden =
      opciones.length + 1;

    setOpciones([
      ...opciones,
      {
        id: Date.now(),
        idOpcion: null,
        nombre: "",
        imagen_url: "",
        imagen_url_original: "",
        archivo: null,
        orden_visual: nuevoOrden,
      },
    ]);

    setError("");
  };

  const eliminarOpcion = (id) => {
    if (opciones.length <= 2) {
      setError(
        "La votación requiere al menos 2 opciones."
      );
      return;
    }

    const opcionEliminada =
      opciones.find(
        (opcion) => opcion.id === id
      );

    if (
      opcionEliminada?.imagen_url?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        opcionEliminada.imagen_url
      );
    }

    const opcionesFiltradas =
      opciones.filter(
        (opcion) => opcion.id !== id
      );

    const opcionesReordenadas =
      opcionesFiltradas.map(
        (opcion, index) => ({
          ...opcion,
          orden_visual: index + 1,
        })
      );

    setOpciones(opcionesReordenadas);
    setError("");
  };

  const cambiarNombreOpcion = (
    id,
    nombre
  ) => {
    setOpciones((opcionesActuales) =>
      opcionesActuales.map((opcion) =>
        opcion.id === id
          ? {
              ...opcion,
              nombre,
            }
          : opcion
      )
    );
  };

  const cambiarImagenOpcion = (
    id,
    e
  ) => {
    const archivo = e.target.files?.[0];

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith("image/")) {
      setError(
        "El archivo seleccionado debe ser una imagen."
      );

      e.target.value = "";
      return;
    }

    const limiteBytes = 5 * 1024 * 1024;

    if (archivo.size > limiteBytes) {
      setError(
        "La imagen no debe superar los 5 MB."
      );

      e.target.value = "";
      return;
    }

    setOpciones((opcionesActuales) =>
      opcionesActuales.map((opcion) => {
        if (opcion.id !== id) {
          return opcion;
        }

        if (
          opcion.imagen_url?.startsWith(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            opcion.imagen_url
          );
        }

        return {
          ...opcion,
          archivo,
          imagen_url:
            URL.createObjectURL(archivo),
        };
      })
    );

    setError("");
    setMensajeExito("");
  };

  const quitarImagenOpcion = (id) => {
    setOpciones((opcionesActuales) =>
      opcionesActuales.map((opcion) => {
        if (opcion.id !== id) {
          return opcion;
        }

        if (
          opcion.imagen_url?.startsWith(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            opcion.imagen_url
          );
        }

        return {
          ...opcion,
          archivo: null,
          imagen_url: "",
          imagen_url_original: "",
        };
      })
    );

    const inputImagen =
      document.getElementById(
        `archivo-${id}`
      );

    if (inputImagen) {
      inputImagen.value = "";
    }

    setError("");
    setMensajeExito("");
  };

  const volver = () => {
    sessionStorage.removeItem(
      "idVotacionEditar"
    );

    if (alVolver) {
      alVolver();
    } else {
      window.location.href = "/";
    }
  };

  const enviar = async (e) => {
    e.preventDefault();

    setError("");
    setMensajeExito("");

    const idActual =
      idVotacion ||
      sessionStorage.getItem(
        "idVotacionEditar"
      );

    if (!idActual) {
      setError(
        "No se encontró la votación que deseas editar."
      );
      return;
    }

    if (
      !titulo.trim() ||
      !idCategoria ||
      !fechaC ||
      !horaC ||
      !fechaF ||
      !horaF
    ) {
      setError(
        "Completa todos los campos obligatorios de Datos Generales."
      );
      return;
    }

    if (
      opciones.some(
        (opcion) =>
          !opcion.nombre.trim()
      )
    ) {
      setError(
        "Todas las opciones deben tener un nombre."
      );
      return;
    }

    const fechaInicio = new Date(
      `${fechaC}T${horaC}:00`
    );

    const fechaFin = new Date(
      `${fechaF}T${horaF}:00`
    );

    if (fechaFin <= fechaInicio) {
      setError(
        "La fecha de finalización debe ser posterior a la fecha de comienzo."
      );
      return;
    }

    if (
      tipoSeleccion === "MULTIPLE" &&
      Number(maxSelecciones) < 2
    ) {
      setError(
        "Debes permitir al menos 2 selecciones."
      );
      return;
    }

    if (
      tipoSeleccion === "MULTIPLE" &&
      Number(maxSelecciones) >
        opciones.length
    ) {
      setError(
        "El máximo de selecciones no puede superar el número de opciones."
      );
      return;
    }

    setGuardando(true);

    const payload = {
      idCategoria:
        Number(idCategoria),

      titulo: titulo.trim(),

      estado,

      descripcion:
        descripcion.trim() || null,

      imagenPortadaUrl:
        eliminarPortada
          ? null
          : imagenPortadaUrlOriginal ||
            null,

      fechaInicio:
        `${fechaC}T${horaC}:00`,

      fechaFin:
        `${fechaF}T${horaF}:00`,

      privacidad,

      tipoVoto,

      tipoSeleccion,

      maxSelecciones:
        tipoSeleccion === "MULTIPLE"
          ? Number(maxSelecciones)
          : 1,

      permiteCambioVoto:
        Boolean(permiteCambioVoto),

      tipoGrafica,

      edadMinima:
        restriccionEdad === "18"
          ? 18
          : null,

      comentariosPermitidos: false,

      opciones: opciones.map((opcion) => ({
        nombre: opcion.nombre.trim(),
        imagenUrl: opcion.imagen_url_original || null,
      })),
    };

    try {
      const formulario = new FormData();

      formulario.append(
        "votacion",
        new Blob([JSON.stringify(payload)], {
          type: "application/json",
        })
      );

      if (imagenPortadaArchivo) {
        formulario.append("imagenPortada", imagenPortadaArchivo);
      }

      opciones.forEach((opcion, index) => {
        if (opcion.archivo) {
          formulario.append(`imagenOpcion_${index}`, opcion.archivo);
        }
      });

      await peticionApi(`/votaciones/${idActual}`, {
        method: "PUT",
        body: formulario,
      });

      setMensajeExito(
        "¡La votación fue actualizada exitosamente!"
      );

      setTimeout(() => {
        volver();
      }, 1500);
    } catch (err) {
      console.error(
        "Error al actualizar la votación:",
        err
      );

      setError(
        err.message ||
          "No se pudo actualizar la votación."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="pantalla-carga">
        <div className="pantalla-carga__circulo" />

        <p>
          Cargando información de la elección...
        </p>
      </div>
    );
  }

  return (
    <div className="editar-votacion-contenedor">
      <div className="encabezado-seccion">
        <img
          src={logo}
          alt="Logo de VotaYa"
          className="logo-oficial-icono"
        />
<div className="contenedor-imagen-portada">
          <label
            htmlFor="imagen-portada-editar"
            className={`selector-imagen-portada ${
              imagenPortadaVista
                ? "con-imagen"
                : ""
            }`}
            title={
              imagenPortadaVista
                ? "Cambiar imagen de portada"
                : "Agregar imagen de portada"
            }
          >
            {imagenPortadaVista ? (
              <img
                src={imagenPortadaVista}
                alt="Portada de la votación"
                className="vista-previa-portada"
              />
            ) : (
              <div className="silueta-imagen-portada">
                <span className="icono-imagen-portada">🖼️</span>

                <span>
                  Agregar imagen de portada
                </span>

                <small>
                  PNG, JPG o WEBP · Máximo 5 MB
                </small>
              </div>
            )}
          </label>

          <input
            id="imagen-portada-editar"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={
              cambiarImagenPortada
            }
            hidden
          />

          {imagenPortadaVista && (
            <div className="acciones-imagen-portada">
              <label
                htmlFor="imagen-portada-editar"
                className="boton-cambiar-portada"
              >
                Cambiar imagen
              </label>

              <button
                type="button"
                className="boton-eliminar-portada"
                onClick={
                  quitarImagenPortada
                }
              >
                Quitar imagen
              </button>
            </div>
          )}
        </div>

        <h1>Editar votación</h1>

        <h3>
          Actualiza la información de tu votación
        </h3>
      </div>

      <form
        onSubmit={enviar}
        className="formulario-edicion"
      >
<section className="bloque-formulario">
          <h2>Datos Generales</h2>

          <div className="cuadrícula-datos-generales">
            <div className="campo-formulario columna-doble">
              <label htmlFor="titulo">
                Título o Asunto *
              </label>

              <input
                id="titulo"
                type="text"
                placeholder="Ej: Elección de Mesa Directiva"
                value={titulo}
                onChange={(e) =>
                  setTitulo(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="categoria">
                Categoría *
              </label>

              <select
                id="categoria"
                value={idCategoria}
                onChange={(e) =>
                  setIdCategoria(
                    e.target.value
                  )
                }
              >
                <option value="">
                  -- Selecciona una categoría --
                </option>

                {categoriasLista.map(
                  (categoria) => {
                    const id =
                      categoria.id_categoria ||
                      categoria.idCategoria ||
                      categoria.id;

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {
                          categoria.nombre
                        }
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            <div className="campo-formulario">
              <label htmlFor="estado">
                Estado de la Votación *
              </label>

              <select
                id="estado"
                value={estado}
                onChange={(e) =>
                  setEstado(
                    e.target.value
                  )
                }
              >
                <option value="ACTIVA">
                  Activa
                </option>

                <option value="PROGRAMADA">
                  Programada
                </option>

                <option value="BORRADOR">
                  Borrador
                </option>

                <option value="FINALIZADA">
                  Finalizada
                </option>

                <option value="CANCELADA">
                  Cancelada
                </option>
              </select>
            </div>

            <div className="campo-formulario">
              <label htmlFor="fechaC">
                Fecha de comienzo *
              </label>

              <input
                id="fechaC"
                type="date"
                value={fechaC}
                onChange={(e) =>
                  setFechaC(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="horaC">
                Hora de comienzo *
              </label>

              <input
                id="horaC"
                type="time"
                value={horaC}
                onChange={(e) =>
                  setHoraC(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="fechaF">
                Fecha de finalización *
              </label>

              <input
                id="fechaF"
                type="date"
                value={fechaF}
                onChange={(e) =>
                  setFechaF(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="horaF">
                Hora de finalización *
              </label>

              <input
                id="horaF"
                type="time"
                value={horaF}
                onChange={(e) =>
                  setHoraF(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="campo-formulario columna-doble">
              <label htmlFor="descripcion">
                Descripción
              </label>

              <textarea
                id="descripcion"
                placeholder="Describe los detalles de esta votación..."
                value={descripcion}
                onChange={(e) =>
                  setDescripcion(
                    e.target.value
                  )
                }
                rows={3}
              />
            </div>
          </div>
        </section>
<section className="bloque-formulario">
          <h2>Editar Opciones</h2>

          <div className="cuadrícula-opciones">
            {opciones.map(
              (opcion, index) => (
                <div
                  key={opcion.id}
                  className="tarjeta-opcion"
                >
                  <button
                    type="button"
                    className="boton-eliminar-opcion"
                    onClick={() =>
                      eliminarOpcion(
                        opcion.id
                      )
                    }
                    aria-label={`Eliminar opción ${
                      index + 1
                    }`}
                  >
                    &times;
                  </button>

                  <div className="caja-subir-imagen">
                    <label
                      htmlFor={`archivo-${opcion.id}`}
                      className="etiqueta-imagen-opcion"
                    >
                      {opcion.imagen_url ? (
                        <img
                          src={
                            opcion.imagen_url
                          }
                          alt={`Imagen de la opción ${
                            index + 1
                          }`}
                          className="imagen-vista-previa"
                        />
                      ) : (
                        <div className="marcador-posicion-imagen">
                          <span>
                            🖼️
                          </span>

                          <small>
                            Subir imagen
                          </small>
                        </div>
                      )}
                    </label>

                    <input
                      id={`archivo-${opcion.id}`}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) =>
                        cambiarImagenOpcion(
                          opcion.id,
                          e
                        )
                      }
                      hidden
                    />
                  </div>

                  {opcion.imagen_url && (
                    <button
                      type="button"
                      className="boton-quitar-imagen-opcion"
                      onClick={() =>
                        quitarImagenOpcion(
                          opcion.id
                        )
                      }
                    >
                      Quitar imagen
                    </button>
                  )}

                  <span className="numero-opcion">
                    Opción {index + 1}
                  </span>

                  <input
                    type="text"
                    placeholder={`Ej: Opción ${
                      index + 1
                    }`}
                    value={
                      opcion.nombre
                    }
                    onChange={(e) =>
                      cambiarNombreOpcion(
                        opcion.id,
                        e.target.value
                      )
                    }
                  />
                </div>
              )
            )}

            <button
              type="button"
              className="tarjeta-opcion boton-agregar-tarjeta"
              onClick={agregarOpcion}
            >
              <span>
                Agregar
              </span>

              <span className="icono-mas">
                +
              </span>
            </button>
          </div>
        </section>
<section className="bloque-formulario">
          <h2>Reglas de Votación</h2>

          <div className="cuadrícula-reglas">
            <div className="grupo-regla">
              <label>
                Privacidad
              </label>

              <div className="grupo-conmutador">
                <button
                  type="button"
                  className={
                    privacidad ===
                    "PUBLICA"
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setPrivacidad(
                      "PUBLICA"
                    )
                  }
                >
                  Pública
                </button>

                <button
                  type="button"
                  className={
                    privacidad ===
                    "PRIVADA"
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setPrivacidad(
                      "PRIVADA"
                    )
                  }
                >
                  Privada
                </button>
              </div>
            </div>

            <div className="grupo-regla">
              <label>
                Identificación de Voto
              </label>

              <div className="grupo-conmutador">
                <button
                  type="button"
                  className={
                    tipoVoto ===
                    "ANONIMO"
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setTipoVoto(
                      "ANONIMO"
                    )
                  }
                >
                  Anónimo
                </button>

                <button
                  type="button"
                  className={
                    tipoVoto ===
                    "IDENTIFICADO"
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setTipoVoto(
                      "IDENTIFICADO"
                    )
                  }
                >
                  Identificado
                </button>
              </div>
            </div>

            <div className="grupo-regla">
              <label>
                Tipo de Selección
              </label>

              <div className="grupo-conmutador">
                <button
                  type="button"
                  className={
                    tipoSeleccion ===
                    "UNICA"
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setTipoSeleccion(
                      "UNICA"
                    )
                  }
                >
                  Opción única
                </button>

                <button
                  type="button"
                  className={
                    tipoSeleccion ===
                    "MULTIPLE"
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setTipoSeleccion(
                      "MULTIPLE"
                    )
                  }
                >
                  Opción múltiple
                </button>
              </div>
            </div>

            {tipoSeleccion ===
              "MULTIPLE" && (
              <div className="grupo-regla">
                <label>
                  Máx. Selecciones
                </label>

                <input
                  type="number"
                  min="2"
                  max={opciones.length}
                  value={maxSelecciones}
                  onChange={(e) =>
                    setMaxSelecciones(
                      e.target.value
                    )
                  }
                  className="entrada-max-selecciones"
                />
              </div>
            )}

            <div className="grupo-regla">
              <label>
                ¿Permitir cambiar voto?
              </label>

              <div className="grupo-conmutador">
                <button
                  type="button"
                  className={
                    !permiteCambioVoto
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setPermiteCambioVoto(
                      false
                    )
                  }
                >
                  No
                </button>

                <button
                  type="button"
                  className={
                    permiteCambioVoto
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setPermiteCambioVoto(
                      true
                    )
                  }
                >
                  Sí
                </button>
              </div>
            </div>

            <div className="grupo-regla">
              <label>
                Restricción de Edad
              </label>

              <div className="grupo-conmutador">
                <button
                  type="button"
                  className={
                    restriccionEdad ===
                    "todos"
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setRestriccionEdad(
                      "todos"
                    )
                  }
                >
                  Todos
                </button>

                <button
                  type="button"
                  className={
                    restriccionEdad ===
                    "18"
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setRestriccionEdad(
                      "18"
                    )
                  }
                >
                  +18 años
                </button>
              </div>
            </div>

            <div className="grupo-regla columna-completa">
              <label>
                Tipo de gráfica
              </label>

              <div className="cuadrícula-seleccion-grafica">
                <div
                  className={`tarjeta-grafica-opcion ${
                    tipoGrafica ===
                    "BARRAS"
                      ? "seleccionada"
                      : ""
                  }`}
                  onClick={() =>
                    setTipoGrafica(
                      "BARRAS"
                    )
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                        "Enter" ||
                      e.key === " "
                    ) {
                      setTipoGrafica(
                        "BARRAS"
                      );
                    }
                  }}
                >
                  <img
                    src={imgBarras}
                    alt="Gráfico de barras"
                    className="imagen-icono-grafica"
                  />

                  <div>
                    <strong>
                      Gráfica Barras
                    </strong>

                    <small>
                      Comparativa vertical
                    </small>
                  </div>
                </div>

                <div
                  className={`tarjeta-grafica-opcion ${
                    tipoGrafica ===
                    "PASTEL"
                      ? "seleccionada"
                      : ""
                  }`}
                  onClick={() =>
                    setTipoGrafica(
                      "PASTEL"
                    )
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                        "Enter" ||
                      e.key === " "
                    ) {
                      setTipoGrafica(
                        "PASTEL"
                      );
                    }
                  }}
                >
                  <img
                    src={imgPastel}
                    alt="Gráfico circular"
                    className="imagen-icono-grafica"
                  />

                  <div>
                    <strong>
                      Gráfica Circular
                    </strong>

                    <small>
                      Porcentajes y proporciones
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <p className="mensaje-error-servidor">
            {error}
          </p>
        )}

        {mensajeExito && (
          <p className="mensaje-exito-servidor">
            {mensajeExito}
          </p>
        )}

        <div className="contenedor-acciones-finales">
          <button
            type="submit"
            className="boton-editar-formulario"
            disabled={guardando}
          >
            {guardando
              ? "Guardando cambios..."
              : "Guardar cambios"}
          </button>

          <div className="contenedor-regresar">
            <span>
              ¿Deseas regresar?{" "}
            </span>

            <button
              type="button"
              className="enlace-regresar"
              onClick={volver}
            >
              Volver
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditarVotacion;