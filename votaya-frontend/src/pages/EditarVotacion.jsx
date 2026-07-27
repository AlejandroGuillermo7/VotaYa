import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../assets/icons/icon-logo-offletters.png";
import imgBarras from "../assets/icons/icon-grafico-barras.webp";
import imgPastel from "../assets/icons/icon-grafico-pastel.webp";
import "./EditarVotacion.css";

const API_BASE_URL = "http://localhost:8080/api";

function EditarVotacion() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [categoriasLista, setCategoriasLista] = useState([]);
  const [fechaC, setFechaC] = useState("");
  const [horaC, setHoraC] = useState("");
  const [fechaF, setFechaF] = useState("");
  const [horaF, setHoraF] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [opciones, setOpciones] = useState([]);

  const [privacidad, setPrivacidad] = useState("PUBLICA");
  const [tipoVoto, setTipoVoto] = useState("ANONIMO");
  const [tipoSeleccion, setTipoSeleccion] = useState("UNICA");
  const [maxSelecciones, setMaxSelecciones] = useState(1);
  const [permiteCambioVoto, setPermiteCambioVoto] = useState(false);
  const [restriccionEdad, setRestriccionEdad] = useState("todos");
  const [tipoGrafica, setTipoGrafica] = useState("BARRAS");
  const [comentariosPermitidos, setComentariosPermitidos] = useState(false);

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const cargarCategorias = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categorias`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCategoriasLista(data);
        }
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };

    const cargarVotacion = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/elecciones/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("No se pudo obtener la información de la votación.");
        }

        const data = await res.json();

        // Precargar campos de texto y reglas
        setTitulo(data.titulo || "");
        setIdCategoria(data.idCategoria || data.categoria?.idCategoria || "");
        setDescripcion(data.descripcion || "");
        setPrivacidad(data.privacidad || "PUBLICA");
        setTipoVoto(data.tipoVoto || "ANONIMO");
        setTipoSeleccion(data.tipoSeleccion || "UNICA");
        setMaxSelecciones(data.maxSelecciones || 1);
        setPermiteCambioVoto(data.permiteCambioVoto ?? false);
        setRestriccionEdad(data.edadMinima === 18 ? "18" : "todos");
        setTipoGrafica(data.tipoGrafica || "BARRAS");
        setComentariosPermitidos(data.comentariosPermitidos ?? false);


        if (data.fechaInicio) {
          const [fC, hC] = data.fechaInicio.split(" ");
          setFechaC(fC || "");
          setHoraC(hC ? hC.substring(0, 5) : "");
        }

        if (data.fechaFin) {
          const [fF, hF] = data.fechaFin.split(" ");
          setFechaF(fF || "");
          setHoraF(hF ? hF.substring(0, 5) : "");
        }


        if (data.opciones && data.opciones.length > 0) {
          const opcionesMapeadas = data.opciones.map((op, idx) => ({
            id: op.idOpcion || Date.now() + idx,
            nombre: op.nombre || "",
            imagen_url: op.imagenUrl || op.imagen_url || "",
            archivo: null, 
            orden_visual: op.ordenVisual || idx + 1,
          }));
          setOpciones(opcionesMapeadas);
        } else {
          setOpciones([
            { id: 1, nombre: "", imagen_url: "", archivo: null, orden_visual: 1 },
            { id: 2, nombre: "", imagen_url: "", archivo: null, orden_visual: 2 },
          ]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarCategorias();
    cargarVotacion();
  }, [id]);


  const agregarOpcion = () => {
    const nuevoOrden = opciones.length + 1;
    setOpciones([
      ...opciones,
      { id: Date.now(), nombre: "", imagen_url: "", archivo: null, orden_visual: nuevoOrden },
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
    setOpciones(opciones.map((op) => (op.id === id ? { ...op, nombre } : op)));
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


  const enviar = async (e) => {
    e.preventDefault();
    setError("");

    if (!titulo.trim() || !idCategoria || !fechaC || !horaC || !fechaF || !horaF) {
      setError("Completa todos los campos obligatorios de Datos Generales.");
      return;
    }

    if (opciones.some((op) => !op.nombre.trim())) {
      setError("Todas las opciones deben tener un nombre.");
      return;
    }

    setCargando(true);

    try {
      const payload = {
        id_categoria: Number(idCategoria),
        titulo,
        descripcion: descripcion || null,
        fecha_inicio: `${fechaC} ${horaC}:00`,
        fecha_fin: `${fechaF} ${horaF}:00`,
        privacidad,
        tipo_voto: tipoVoto,
        tipo_seleccion: tipoSeleccion,
        max_selecciones: tipoSeleccion === "MULTIPLE" ? Number(maxSelecciones) : 1,
        permite_cambio_voto: permiteCambioVoto,
        tipo_grafica: tipoGrafica,
        edad_minima: restriccionEdad === "18" ? 18 : null,
        comentarios_permitidos: comentariosPermitidos,
        opciones: opciones.map((op) => ({
          nombre: op.nombre,
          imagen_url: op.archivo ? null : op.imagen_url, // Mantiene la URL vieja si no subió un archivo nuevo
          orden_visual: op.orden_visual,
        })),
      };

      const formData = new FormData();
      formData.append(
        "datos",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );


      opciones.forEach((op) => {
        if (op.archivo) {
          formData.append("imagenes", op.archivo);
        }
      });

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/elecciones/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.mensaje || "Error al actualizar la votación.");
      }

      alert("¡Votación editada con éxito!");
      navigate("/mis-elecciones");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (cargandoDatos) {
    return <div className="cargando-contenedor">Cargando datos de la votación...</div>;
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

            <div className="campo-formulario columna-doble">
              <label htmlFor="categoria">Categoría *</label>
              <select
                id="categoria"
                value={idCategoria}
                onChange={(e) => setIdCategoria(e.target.value)}
              >
                <option value="">-- Selecciona una categoría --</option>
                {categoriasLista.map((cat) => (
                  <option key={cat.id_categoria || cat.idCategoria} value={cat.id_categoria || cat.idCategoria}>
                    {cat.nombre}
                  </option>
                ))}
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
                      <img src={opcion.imagen_url} alt="Vista previa" className="imagen-vista-previa" />
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
                  onChange={(e) => cambiarNombreOpcion(opcion.id, e.target.value)}
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
                  className={`tarjeta-grafica-opcion ${tipoGrafica === 'BARRAS' ? 'seleccionada' : ''}`}
                  onClick={() => setTipoGrafica('BARRAS')}
                >
                  <img src={imgBarras} alt="Gráfico de Barras" className="imagen-icono-grafica" />
                  <div>
                    <strong>Gráfica Barras</strong>
                    <small>Comparativa vertical</small>
                  </div>
                </div>

                <div 
                  className={`tarjeta-grafica-opcion ${tipoGrafica === 'PASTEL' ? 'seleccionada' : ''}`}
                  onClick={() => setTipoGrafica('PASTEL')}
                >
                  <img src={imgPastel} alt="Gráfico Pastel" className="imagen-icono-grafica" />
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

        <div className="contenedor-acciones-finales">
          <button type="submit" className="boton-editar-formulario" disabled={cargando}>
            {cargando ? "Editando..." : "Editar votación"}
          </button>
          <div className="contenedor-regresar">
            <span>¿Deseas regresar? </span>
            <span className="enlace-regresar" onClick={() => navigate(-1)}>Volver</span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditarVotacion;