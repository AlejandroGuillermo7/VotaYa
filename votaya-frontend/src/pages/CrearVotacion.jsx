import { useEffect, useState } from "react";
import logo from "../assets/icons/icon-logo-offletters.png";
import imgBarras from "../assets/icons/icon-grafico-barras.webp";
import imgPastel from "../assets/icons/icon-grafico-pastel.webp";
import { peticionApi } from "../api/clienteApi";
import "./EditarVotacion.css";

function CrearVotacion({ alVolver, alCrearExitosa }) {
  const [titulo, setTitulo] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [categoriasLista, setCategoriasLista] = useState([]);

  const [estado, setEstado] = useState("ACTIVA");

  const [fechaC, setFechaC] = useState("");
  const [horaC, setHoraC] = useState("");
  const [fechaF, setFechaF] = useState("");
  const [horaF, setHoraF] = useState("");
  const [descripcion, setDescripcion] = useState("");

  /*
   * Imagen principal o portada de la votación.
   *
   * imagenPortada guarda el archivo real.
   * vistaPreviaPortada guarda una URL temporal para mostrarla.
   */
  const [imagenPortada, setImagenPortada] = useState(null);
  const [vistaPreviaPortada, setVistaPreviaPortada] = useState("");

  const [opciones, setOpciones] = useState([
    {
      id: 1,
      nombre: "",
      imagen_url: "",
      archivo: null,
      orden_visual: 1,
    },
    {
      id: 2,
      nombre: "",
      imagen_url: "",
      archivo: null,
      orden_visual: 2,
    },
  ]);

  const [privacidad, setPrivacidad] = useState("PUBLICA");
  const [tipoVoto, setTipoVoto] = useState("ANONIMO");
  const [tipoSeleccion, setTipoSeleccion] = useState("UNICA");
  const [maxSelecciones, setMaxSelecciones] = useState(1);
  const [permiteCambioVoto, setPermiteCambioVoto] = useState(false);
  const [restriccionEdad, setRestriccionEdad] = useState("todos");
  const [tipoGrafica, setTipoGrafica] = useState("BARRAS");
  const [comentariosPermitidos, setComentariosPermitidos] =
    useState(false);

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const respuesta = await peticionApi("/categorias", {
          method: "GET",
        });

        if (Array.isArray(respuesta)) {
          setCategoriasLista(respuesta);
        } else if (
          respuesta?.datos &&
          Array.isArray(respuesta.datos)
        ) {
          setCategoriasLista(respuesta.datos);
        }
      } catch (err) {
        console.error(
          "Error al cargar categorías desde la BD:",
          err
        );
      }
    };

    cargarCategorias();
  }, []);

  /*
   * Limpia las URL temporales cuando el componente se desmonta.
   */
  useEffect(() => {
    return () => {
      if (vistaPreviaPortada?.startsWith("blob:")) {
        URL.revokeObjectURL(vistaPreviaPortada);
      }

      opciones.forEach((opcion) => {
        if (opcion.imagen_url?.startsWith("blob:")) {
          URL.revokeObjectURL(opcion.imagen_url);
        }
      });
    };
  }, []);

  const cambiarImagenPortada = (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith("image/")) {
      setError("El archivo seleccionado debe ser una imagen.");
      e.target.value = "";
      return;
    }

    const limiteBytes = 5 * 1024 * 1024;

    if (archivo.size > limiteBytes) {
      setError("La imagen de portada no debe superar los 5 MB.");
      e.target.value = "";
      return;
    }

    if (vistaPreviaPortada?.startsWith("blob:")) {
      URL.revokeObjectURL(vistaPreviaPortada);
    }

    const nuevaVistaPrevia = URL.createObjectURL(archivo);

    setImagenPortada(archivo);
    setVistaPreviaPortada(nuevaVistaPrevia);
    setError("");
  };

  const eliminarImagenPortada = () => {
    if (vistaPreviaPortada?.startsWith("blob:")) {
      URL.revokeObjectURL(vistaPreviaPortada);
    }

    setImagenPortada(null);
    setVistaPreviaPortada("");

    const inputImagen = document.getElementById("imagen-portada");

    if (inputImagen) {
      inputImagen.value = "";
    }
  };

  const agregarOpcion = () => {
    const nuevoOrden = opciones.length + 1;

    setOpciones([
      ...opciones,
      {
        id: Date.now(),
        nombre: "",
        imagen_url: "",
        archivo: null,
        orden_visual: nuevoOrden,
      },
    ]);
  };

  const eliminarOpcion = (id) => {
    if (opciones.length <= 2) {
      setError("La votación requiere al menos 2 opciones.");
      return;
    }

    const opcionEliminada = opciones.find(
      (opcion) => opcion.id === id
    );

    if (opcionEliminada?.imagen_url?.startsWith("blob:")) {
      URL.revokeObjectURL(opcionEliminada.imagen_url);
    }

    const filtradas = opciones.filter(
      (opcion) => opcion.id !== id
    );

    const reordenadas = filtradas.map((opcion, index) => ({
      ...opcion,
      orden_visual: index + 1,
    }));

    setOpciones(reordenadas);
    setError("");
  };

  const cambiarNombreOpcion = (id, nombre) => {
    setOpciones(
      opciones.map((opcion) =>
        opcion.id === id
          ? {
              ...opcion,
              nombre,
            }
          : opcion
      )
    );
  };

  const cambiarImagenOpcion = (id, e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith("image/")) {
      setError("El archivo seleccionado debe ser una imagen.");
      e.target.value = "";
      return;
    }

    const limiteBytes = 5 * 1024 * 1024;

    if (archivo.size > limiteBytes) {
      setError("La imagen no debe superar los 5 MB.");
      e.target.value = "";
      return;
    }

    setOpciones((opcionesAnteriores) =>
      opcionesAnteriores.map((opcion) => {
        if (opcion.id !== id) {
          return opcion;
        }

        if (opcion.imagen_url?.startsWith("blob:")) {
          URL.revokeObjectURL(opcion.imagen_url);
        }

        return {
          ...opcion,
          archivo,
          imagen_url: URL.createObjectURL(archivo),
        };
      })
    );

    setError("");
  };

  const eliminarImagenOpcion = (id) => {
    setOpciones((opcionesAnteriores) =>
      opcionesAnteriores.map((opcion) => {
        if (opcion.id !== id) {
          return opcion;
        }

        if (opcion.imagen_url?.startsWith("blob:")) {
          URL.revokeObjectURL(opcion.imagen_url);
        }

        return {
          ...opcion,
          archivo: null,
          imagen_url: "",
        };
      })
    );

    const inputImagen = document.getElementById(
      `archivo-${id}`
    );

    if (inputImagen) {
      inputImagen.value = "";
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError("");

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

    if (opciones.some((opcion) => !opcion.nombre.trim())) {
      setError("Todas las opciones deben tener un nombre.");
      return;
    }

    const fechaInicio = new Date(`${fechaC}T${horaC}:00`);
    const fechaFin = new Date(`${fechaF}T${horaF}:00`);

    if (fechaFin <= fechaInicio) {
      setError(
        "La fecha de finalización debe ser posterior a la fecha de comienzo."
      );
      return;
    }

    if (
      tipoSeleccion === "MULTIPLE" &&
      Number(maxSelecciones) > opciones.length
    ) {
      setError(
        "El máximo de selecciones no puede superar el número de opciones."
      );
      return;
    }

    setCargando(true);

    /*
     * La URL de portada queda en null porque el archivo todavía
     * debe subirse al servidor mediante multipart/form-data.
     */
    const payload = {
      idCategoria: Number(idCategoria),
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      imagenPortadaUrl: null,
      fechaInicio: `${fechaC}T${horaC}:00`,
      fechaFin: `${fechaF}T${horaF}:00`,
      estado,
      privacidad,
      tipoVoto,
      tipoSeleccion,
      maxSelecciones:
        tipoSeleccion === "MULTIPLE"
          ? Number(maxSelecciones)
          : 1,
      permiteCambioVoto: Boolean(permiteCambioVoto),
      tipoGrafica,
      edadMinima:
        restriccionEdad === "18" ? 18 : null,
      comentariosPermitidos: Boolean(
        comentariosPermitidos
      ),
      opciones: opciones.map((opcion) => ({
        nombre: opcion.nombre.trim(),
        imagenUrl: opcion.imagen_url?.startsWith("blob:")
          ? null
          : opcion.imagen_url || null,
        ordenVisual: opcion.orden_visual,
      })),
    };

    try {
      /*
       * imagenPortada contiene el archivo seleccionado.
       *
       * Actualmente se manda únicamente el JSON.
       * Después puedes cambiarlo por FormData para subir
       * el archivo junto con la votación.
       */
      console.log("Imagen de portada:", imagenPortada);
      console.log("Datos enviados:", payload);

      await peticionApi("/votaciones", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (alCrearExitosa) {
        alCrearExitosa();
      }
    } catch (err) {
      console.error("Error al crear votación:", err);

      setError(
        err.message || "Error al conectar con el servidor."
      );
    } finally {
      setCargando(false);
    }
  };

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
            htmlFor="imagen-portada"
            className={`selector-imagen-portada ${
              vistaPreviaPortada ? "con-imagen" : ""
            }`}
            title="Seleccionar imagen de portada"
          >
            {vistaPreviaPortada ? (
              <img
                src={vistaPreviaPortada}
                alt="Vista previa de la portada"
                className="vista-previa-portada"
              />
            ) : (
              <div className="silueta-imagen-portada">
                <svg
                  className="icono-imagen-portada"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />

                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="1.5"
                    fill="currentColor"
                  />

                  <path
                    d="m5 17 4.2-4.2a1 1 0 0 1 1.4 0l2.1 2.1 1.7-1.7a1 1 0 0 1 1.4 0L20 17.4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span>Agregar imagen de portada</span>
                <small>PNG, JPG o WEBP · Máximo 5 MB</small>
              </div>
            )}
          </label>

          <input
            id="imagen-portada"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={cambiarImagenPortada}
            hidden
          />

          {vistaPreviaPortada && (
            <div className="acciones-imagen-portada">
              <label
                htmlFor="imagen-portada"
                className="boton-cambiar-portada"
              >
                Cambiar imagen
              </label>

              <button
                type="button"
                className="boton-eliminar-portada"
                onClick={eliminarImagenPortada}
              >
                Quitar imagen
              </button>
            </div>
          )}
        </div>

        <h1>Crear una votación</h1>
        <h3>Únete a VotaYa</h3>
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
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="categoria">Categoría *</label>

              <select
                id="categoria"
                value={idCategoria}
                onChange={(e) =>
                  setIdCategoria(e.target.value)
                }
              >
                <option value="">
                  -- Selecciona una categoría --
                </option>

                {categoriasLista.map((categoria) => {
                  const id =
                    categoria.idCategoria ||
                    categoria.id_categoria ||
                    categoria.id;

                  return (
                    <option key={id} value={id}>
                      {categoria.nombre}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="campo-formulario">
              <label htmlFor="estado">
                Estado de la Votación *
              </label>

              <select
                id="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="BORRADOR">Borrador</option>
                <option value="ACTIVA">Activa</option>
                <option value="PROGRAMADA">
                  Programada
                </option>
                <option value="FINALIZADA">
                  Finalizada
                </option>
                <option value="CANCELADA">Cancelada</option>
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
                onChange={(e) => setFechaC(e.target.value)}
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
                onChange={(e) => setHoraC(e.target.value)}
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
                onChange={(e) => setFechaF(e.target.value)}
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
                onChange={(e) => setHoraF(e.target.value)}
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
                  setDescripcion(e.target.value)
                }
                rows={3}
              />
            </div>
          </div>
        </section>

        <section className="bloque-formulario">
          <h2>Agregar Opciones</h2>

          <div className="cuadrícula-opciones">
            {opciones.map((opcion, index) => (
              <div
                key={opcion.id}
                className="tarjeta-opcion"
              >
                <button
                  type="button"
                  className="boton-eliminar-opcion"
                  onClick={() =>
                    eliminarOpcion(opcion.id)
                  }
                  aria-label={`Eliminar opción ${index + 1}`}
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
                        src={opcion.imagen_url}
                        alt={`Vista previa de la opción ${
                          index + 1
                        }`}
                        className="imagen-vista-previa"
                      />
                    ) : (
                      <div className="marcador-posicion-imagen">
                        <span>🖼️</span>
                        <small>Subir imagen</small>
                      </div>
                    )}
                  </label>

                  <input
                    id={`archivo-${opcion.id}`}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) =>
                      cambiarImagenOpcion(opcion.id, e)
                    }
                    hidden
                  />
                </div>

                {opcion.imagen_url && (
                  <button
                    type="button"
                    className="boton-quitar-imagen-opcion"
                    onClick={() =>
                      eliminarImagenOpcion(opcion.id)
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
                  placeholder={`Ej: Opción ${index + 1}`}
                  value={opcion.nombre}
                  onChange={(e) =>
                    cambiarNombreOpcion(
                      opcion.id,
                      e.target.value
                    )
                  }
                />
              </div>
            ))}

            <button
              type="button"
              className="tarjeta-opcion boton-agregar-tarjeta"
              onClick={agregarOpcion}
            >
              <span>Agregar</span>
              <span className="icono-mas">+</span>
            </button>
          </div>
        </section>

        <section className="bloque-formulario">
          <h2>Reglas de Votación</h2>

          <div className="cuadrícula-reglas">
            <div className="grupo-regla">
              <label>Privacidad</label>

              <div className="grupo-conmutador">
                <button
                  type="button"
                  className={
                    privacidad === "PUBLICA"
                      ? "activo"
                      : ""
                  }
                  onClick={() => setPrivacidad("PUBLICA")}
                >
                  Pública
                </button>

                <button
                  type="button"
                  className={
                    privacidad === "PRIVADA"
                      ? "activo"
                      : ""
                  }
                  onClick={() => setPrivacidad("PRIVADA")}
                >
                  Privada
                </button>
              </div>
            </div>

            <div className="grupo-regla">
              <label>Identificación de Voto</label>

              <div className="grupo-conmutador">
                <button
                  type="button"
                  className={
                    tipoVoto === "ANONIMO"
                      ? "activo"
                      : ""
                  }
                  onClick={() => setTipoVoto("ANONIMO")}
                >
                  Anónimo
                </button>

                <button
                  type="button"
                  className={
                    tipoVoto === "IDENTIFICADO"
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setTipoVoto("IDENTIFICADO")
                  }
                >
                  Identificado
                </button>
              </div>
            </div>

            <div className="grupo-regla">
              <label>Tipo de Selección</label>

              <div className="grupo-conmutador">
                <button
                  type="button"
                  className={
                    tipoSeleccion === "UNICA"
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setTipoSeleccion("UNICA")
                  }
                >
                  Opción única
                </button>

                <button
                  type="button"
                  className={
                    tipoSeleccion === "MULTIPLE"
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setTipoSeleccion("MULTIPLE")
                  }
                >
                  Opción múltiple
                </button>
              </div>
            </div>

            {tipoSeleccion === "MULTIPLE" && (
              <div className="grupo-regla">
                <label>Máx. Selecciones</label>

                <input
                  type="number"
                  min="2"
                  max={opciones.length}
                  value={maxSelecciones}
                  onChange={(e) =>
                    setMaxSelecciones(e.target.value)
                  }
                  className="entrada-max-selecciones"
                />
              </div>
            )}

            <div className="grupo-regla">
              <label>¿Permitir cambiar voto?</label>

              <div className="grupo-conmutador">
                <button
                  type="button"
                  className={
                    !permiteCambioVoto ? "activo" : ""
                  }
                  onClick={() =>
                    setPermiteCambioVoto(false)
                  }
                >
                  No
                </button>

                <button
                  type="button"
                  className={
                    permiteCambioVoto ? "activo" : ""
                  }
                  onClick={() =>
                    setPermiteCambioVoto(true)
                  }
                >
                  Sí
                </button>
              </div>
            </div>

            <div className="grupo-regla">
              <label>Restricción de Edad</label>

              <div className="grupo-conmutador">
                <button
                  type="button"
                  className={
                    restriccionEdad === "todos"
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setRestriccionEdad("todos")
                  }
                >
                  Todos
                </button>

                <button
                  type="button"
                  className={
                    restriccionEdad === "18"
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setRestriccionEdad("18")
                  }
                >
                  +18 años
                </button>
              </div>
            </div>

            <div className="grupo-regla">
              <label>Comentarios</label>

              <div className="grupo-conmutador">
                <button
                  type="button"
                  className={
                    !comentariosPermitidos
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setComentariosPermitidos(false)
                  }
                >
                  No permitido
                </button>

                <button
                  type="button"
                  className={
                    comentariosPermitidos
                      ? "activo"
                      : ""
                  }
                  onClick={() =>
                    setComentariosPermitidos(true)
                  }
                >
                  Permitido
                </button>
              </div>
            </div>

            <div className="grupo-regla columna-completa">
              <label>Tipo de gráfica</label>

              <div className="cuadrícula-seleccion-grafica">
                <div
                  className={`tarjeta-grafica-opcion ${
                    tipoGrafica === "BARRAS"
                      ? "seleccionada"
                      : ""
                  }`}
                  onClick={() => setTipoGrafica("BARRAS")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" ||
                      e.key === " "
                    ) {
                      setTipoGrafica("BARRAS");
                    }
                  }}
                >
                  <img
                    src={imgBarras}
                    alt="Gráfico de barras"
                    className="imagen-icono-grafica"
                  />

                  <div>
                    <strong>Gráfica Barras</strong>
                    <small>Comparativa vertical</small>
                  </div>
                </div>

                <div
                  className={`tarjeta-grafica-opcion ${
                    tipoGrafica === "PASTEL"
                      ? "seleccionada"
                      : ""
                  }`}
                  onClick={() => setTipoGrafica("PASTEL")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" ||
                      e.key === " "
                    ) {
                      setTipoGrafica("PASTEL");
                    }
                  }}
                >
                  <img
                    src={imgPastel}
                    alt="Gráfico circular"
                    className="imagen-icono-grafica"
                  />

                  <div>
                    <strong>Gráfica Circular</strong>
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

        <div className="contenedor-acciones-finales">
          <button
            type="submit"
            className="boton-editar-formulario"
            disabled={cargando}
          >
            {cargando
              ? "Guardando..."
              : "Crear votación"}
          </button>

          <div className="contenedor-regresar">
            <span>¿Deseas regresar? </span>

            <button
              type="button"
              className="enlace-regresar"
              onClick={alVolver}
            >
              Volver
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CrearVotacion;