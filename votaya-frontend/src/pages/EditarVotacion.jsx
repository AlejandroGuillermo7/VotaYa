import { useState, useEffect } from "react";
import logo from "../assets/icons/icon-logo-offletters.png";
import imgBarras from "../assets/icons/icon-grafico-barras.webp";
import imgPastel from "../assets/icons/icon-grafico-pastel.webp";
import { peticionApi, resolverUrlArchivo } from "../api/clienteApi";
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

  const [opciones, setOpciones] = useState([
    { id: 1, nombre: "", imagen_url: "", archivo: null, orden_visual: 1 },
    { id: 2, nombre: "", imagen_url: "", archivo: null, orden_visual: 2 },
  ]);

  const [privacidad, setPrivacidad] = useState("PUBLICA");
  const [tipoVoto, setTipoVoto] = useState("ANONIMO");
  const [tipoSeleccion, setTipoSeleccion] = useState("UNICA");
  const [maxSelecciones, setMaxSelecciones] = useState(1);
  const [permiteCambioVoto, setPermiteCambioVoto] = useState(false);
  const [restriccionEdad, setRestriccionEdad] = useState("todos");
  const [tipoGrafica, setTipoGrafica] = useState("BARRAS");
  const [comentariosPermitidos, setComentariosPermitidos] = useState(false);

  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);


  useEffect(() => {
    async function cargarTodo() {
      const idActual = idVotacion || sessionStorage.getItem("idVotacionEditar");

      if (!idActual) {
        setError("No se especifica qué votación deseas editar.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const [categorias, votacion] = await Promise.all([
          peticionApi("/categorias").catch(() => [
            { id_categoria: 1, nombre: "Escolar / Académico" },
            { id_categoria: 2, nombre: "Política y Elecciones" },
            { id_categoria: 3, nombre: "Deportes" },
            { id_categoria: 4, nombre: "Entretenimiento" },
          ]),
          peticionApi(`/votaciones/${idActual}`),
        ]);

        setCategoriasLista(categorias);

        if (votacion) {
          setTitulo(votacion.titulo || "");
          setIdCategoria(votacion.idCategoria || votacion.id_categoria || "");
          setEstado(votacion.estado || "ACTIVA"); 
          setDescripcion(votacion.descripcion || "");

          if (votacion.fechaInicio) {
            const [fInicio, hInicio] = votacion.fechaInicio.split("T");
            setFechaC(fInicio || "");
            setHoraC(hInicio ? hInicio.substring(0, 5) : "");
          }

          if (votacion.fechaFin) {
            const [fFin, hFin] = votacion.fechaFin.split("T");
            setFechaF(fFin || "");
            setHoraF(hFin ? hFin.substring(0, 5) : "");
          }

          setPrivacidad(votacion.privacidad || "PUBLICA");
          setTipoVoto(votacion.tipoVoto || votacion.tipo_voto || "ANONIMO");
          setTipoSeleccion(
            votacion.tipoSeleccion || votacion.tipo_seleccion || "UNICA"
          );
          setMaxSelecciones(
            votacion.maxSelecciones || votacion.max_selecciones || 1
          );
          setPermiteCambioVoto(
            Boolean(votacion.permiteCambioVoto ?? votacion.permite_cambio_voto)
          );
          setRestriccionEdad(
            votacion.edadMinima === 18 || votacion.edad_minima === 18
              ? "18"
              : "todos"
          );
          setTipoGrafica(
            votacion.tipoGrafica || votacion.tipo_grafica || "BARRAS"
          );
          setComentariosPermitidos(
            Boolean(
              votacion.comentariosPermitidos ?? votacion.comentarios_permitidos
            )
          );

          if (votacion.opciones && votacion.opciones.length > 0) {
            setOpciones(
              votacion.opciones.map((op, idx) => ({
                id: op.idOpcion || op.id || idx + 1,
                idOpcion: op.idOpcion || op.id || null,
                nombre: op.nombre || "",
                imagen_url: op.imagenUrl ? resolverUrlArchivo(op.imagenUrl) : "",
                archivo: null,
                orden_visual: op.ordenVisual || idx + 1,
              }))
            );
          }
        }
      } catch (err) {
        setError(err.message || "Error al cargar los datos.");
      } finally {
        setCargando(false);
      }
    }

    cargarTodo();
  }, [idVotacion]);


  const agregarOpcion = () => {
    const nuevoOrden = opciones.length + 1;
    setOpciones([
      ...opciones,
      { id: Date.now(), idOpcion: null, nombre: "", imagen_url: "", archivo: null, orden_visual: nuevoOrden },
    ]);
  };

  const eliminarOpcion = (id) => {
    if (opciones.length <= 2) {
      setError("La votación requiere al menos 2 opciones.");
      return;
    }
    const filtradas = opciones.filter((op) => op.id !== id);
    const reordenadas = filtradas.map((op, idx) => ({
      ...op,
      orden_visual: idx + 1,
    }));
    setOpciones(reordenadas);
  };

  const cambiarNombreOpcion = (id, nombre) => {
    setOpciones(
      opciones.map((op) => (op.id === id ? { ...op, nombre } : op))
    );
  };

  const cambiarImagenOpcion = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      setOpciones(
        opciones.map((op) =>
          op.id === id
            ? {
                ...op,
                archivo: file,
                imagen_url: URL.createObjectURL(file),
              }
            : op
        )
      );
    }
  };

  const volver = () => {
    sessionStorage.removeItem("idVotacionEditar");
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

    const idActual = idVotacion || sessionStorage.getItem("idVotacionEditar");

    if (!titulo.trim() || !idCategoria || !fechaC || !horaC || !fechaF || !horaF) {
      setError("Completa todos los campos obligatorios de Datos Generales.");
      return;
    }

    setGuardando(true);

    const payload = {
      idCategoria: Number(idCategoria),
      titulo: titulo.trim(),
      estado, 
      descripcion: descripcion ? descripcion.trim() : null,
      fechaInicio: `${fechaC}T${horaC}:00`,
      fechaFin: `${fechaF}T${horaF}:00`,
      privacidad,
      tipoVoto,
      tipoSeleccion,
      maxSelecciones: tipoSeleccion === "MULTIPLE" ? Number(maxSelecciones) : 1,
      permiteCambioVoto,
      tipoGrafica,
      edadMinima: restriccionEdad === "18" ? 18 : null,
      comentariosPermitidos,
    };

    try {
      await peticionApi(`/votaciones/${idActual}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setMensajeExito("¡La votación fue actualizada exitosamente!");
      setTimeout(() => {
        volver();
      }, 1500);
    } catch (err) {
      setError(err.message || "No se pudo actualizar la votación.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="pantalla-carga">
        <div className="pantalla-carga__circulo" />
        <p>Cargando información de la elección...</p>
      </div>
    );
  }

  return (
    <div className="editar-votacion-contenedor">
      <div className="encabezado-seccion">
        <img src={logo} alt="VotaYa Logo" className="logo-oficial-icono" />
        <h1>Editar votación</h1>
        <h3>Únete a VotaYa</h3>
      </div>

      <form onSubmit={enviar} className="formulario-edicion">
        <section className="bloque-formulario">
          <h2>Datos Generales</h2>
          <div className="cuadrícula-datos-generales">
            <div className="campo-formulario columna-doble">
              <label htmlFor="titulo">Título o Asunto *</label>
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
                onChange={(e) => setIdCategoria(e.target.value)}
              >
                <option value="">-- Selecciona una categoría --</option>
                {categoriasLista.map((cat) => (
                  <option
                    key={cat.id_categoria || cat.idCategoria}
                    value={cat.id_categoria || cat.idCategoria}
                  >
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>


            <div className="campo-formulario">
              <label htmlFor="estado">Estado de la Votación *</label>
              <select
                id="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="ACTIVA">Activa</option>
                <option value="PROGRAMADA">Programada</option>
                <option value="BORRADOR">Borrador</option>
                <option value="FINALIZADA">Finalizada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>

            <div className="campo-formulario">
              <label htmlFor="fechaC">Fecha de comienzo *</label>
              <input
                id="fechaC"
                type="date"
                value={fechaC}
                onChange={(e) => setFechaC(e.target.value)}
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="horaC">Hora de comienzo *</label>
              <input
                id="horaC"
                type="time"
                value={horaC}
                onChange={(e) => setHoraC(e.target.value)}
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="fechaF">Fecha de finalización *</label>
              <input
                id="fechaF"
                type="date"
                value={fechaF}
                onChange={(e) => setFechaF(e.target.value)}
              />
            </div>

            <div className="campo-formulario">
              <label htmlFor="horaF">Hora de finalización *</label>
              <input
                id="horaF"
                type="time"
                value={horaF}
                onChange={(e) => setHoraF(e.target.value)}
              />
            </div>

            <div className="campo-formulario columna-doble">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                placeholder="Describe los detalles de esta votación..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </section>

        <section className="bloque-formulario">
          <h2>Agregar Opciones</h2>
          <div className="cuadrícula-opciones">
            {opciones.map((opcion, index) => (
              <div key={opcion.id} className="tarjeta-opcion">
                <button
                  type="button"
                  className="boton-eliminar-opcion"
                  onClick={() => eliminarOpcion(opcion.id)}
                >
                  &times;
                </button>
                <div className="caja-subir-imagen">
                  <label htmlFor={`archivo-${opcion.id}`}>
                    {opcion.imagen_url ? (
                      <img
                        src={opcion.imagen_url}
                        alt="Vista previa"
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
                    accept="image/*"
                    onChange={(e) => cambiarImagenOpcion(opcion.id, e)}
                    hidden
                  />
                </div>
                <span className="numero-opcion">Opción {index + 1}</span>
                <input
                  type="text"
                  placeholder={`Ej: Opción ${index + 1}`}
                  value={opcion.nombre}
                  onChange={(e) =>
                    cambiarNombreOpcion(opcion.id, e.target.value)
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
                  className={privacidad === "PUBLICA" ? "activo" : ""}
                  onClick={() => setPrivacidad("PUBLICA")}
                >
                  Pública
                </button>
                <button
                  type="button"
                  className={privacidad === "PRIVADA" ? "activo" : ""}
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
                  className={tipoVoto === "ANONIMO" ? "activo" : ""}
                  onClick={() => setTipoVoto("ANONIMO")}
                >
                  Anónimo
                </button>
                <button
                  type="button"
                  className={tipoVoto === "IDENTIFICADO" ? "activo" : ""}
                  onClick={() => setTipoVoto("IDENTIFICADO")}
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
                  className={tipoSeleccion === "UNICA" ? "activo" : ""}
                  onClick={() => setTipoSeleccion("UNICA")}
                >
                  Opción única
                </button>
                <button
                  type="button"
                  className={tipoSeleccion === "MULTIPLE" ? "activo" : ""}
                  onClick={() => setTipoSeleccion("MULTIPLE")}
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
                  onChange={(e) => setMaxSelecciones(e.target.value)}
                  className="entrada-max-selecciones"
                />
              </div>
            )}

            <div className="grupo-regla">
              <label>¿Permitir cambiar voto?</label>
              <div className="grupo-conmutador">
                <button
                  type="button"
                  className={!permiteCambioVoto ? "activo" : ""}
                  onClick={() => setPermiteCambioVoto(false)}
                >
                  No
                </button>
                <button
                  type="button"
                  className={permiteCambioVoto ? "activo" : ""}
                  onClick={() => setPermiteCambioVoto(true)}
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
                  className={restriccionEdad === "todos" ? "activo" : ""}
                  onClick={() => setRestriccionEdad("todos")}
                >
                  Todos
                </button>
                <button
                  type="button"
                  className={restriccionEdad === "18" ? "activo" : ""}
                  onClick={() => setRestriccionEdad("18")}
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
                  className={!comentariosPermitidos ? "activo" : ""}
                  onClick={() => setComentariosPermitidos(false)}
                >
                  No permitido
                </button>
                <button
                  type="button"
                  className={comentariosPermitidos ? "activo" : ""}
                  onClick={() => setComentariosPermitidos(true)}
                >
                  Permitido
                </button>
              </div>
            </div>

            <div className="grupo-regla">
              <label>Tipo de gráfica</label>
              <div className="cuadrícula-seleccion-grafica">
                <div
                  className={`tarjeta-grafica-opcion ${
                    tipoGrafica === "BARRAS" ? "seleccionada" : ""
                  }`}
                  onClick={() => setTipoGrafica("BARRAS")}
                >
                  <img
                    src={imgBarras}
                    alt="Gráfico de Barras"
                    className="imagen-icono-grafica"
                  />
                  <div>
                    <strong>Gráfica Barras</strong>
                    <small>Comparativa vertical</small>
                  </div>
                </div>

                <div
                  className={`tarjeta-grafica-opcion ${
                    tipoGrafica === "PASTEL" ? "seleccionada" : ""
                  }`}
                  onClick={() => setTipoGrafica("PASTEL")}
                >
                  <img
                    src={imgPastel}
                    alt="Gráfico Pastel"
                    className="imagen-icono-grafica"
                  />
                  <div>
                    <strong>Gráfica Circular</strong>
                    <small>Porcentajes y proporciones</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && <p className="mensaje-error-servidor">{error}</p>}
        {mensajeExito && (
          <p className="mensaje-exito-servidor">{mensajeExito}</p>
        )}

        <div className="contenedor-acciones-finales">
          <button
            type="submit"
            className="boton-editar-formulario"
            disabled={guardando}
          >
            {guardando ? "Guardando cambios..." : "Guardar cambios"}
          </button>
          <div className="contenedor-regresar">
            <span>¿Deseas regresar? </span>
            <span
              className="enlace-regresar"
              onClick={volver}
              style={{ cursor: "pointer" }}
            >
              Volver
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditarVotacion;