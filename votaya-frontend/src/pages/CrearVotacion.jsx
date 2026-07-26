import { useState, useEffect } from "react";
import logo from "../assets/icons/icon-logo-offletters.png";
import imgBarras from "../assets/icons/icon-grafico-barras.webp";
import imgPastel from "../assets/icons/icon-grafico-pastel.webp";
import "./EditarVotacion.css";

function CrearVotacion() {
  const [titulo, setTitulo] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [categoriasLista, setCategoriasLista] = useState([]);
  const [fechaC, setFechaC] = useState("");
  const [horaC, setHoraC] = useState("");
  const [fechaF, setFechaF] = useState("");
  const [horaF, setHoraF] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [opciones, setOpciones] = useState([
    { id: 1, nombre: "", imagen_url: "", orden_visual: 1 },
    { id: 2, nombre: "", imagen_url: "", orden_visual: 2 },
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
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    /* 
      API Backend:
    */

    setCategoriasLista([
      { id_categoria: 1, nombre: "Escolar / Académico" },
      { id_categoria: 2, nombre: "Política y Elecciones" },
      { id_categoria: 3, nombre: "Deportes" },
      { id_categoria: 4, nombre: "Entretenimiento" },
    ]);
  }, []);

  const agregarOpcion = () => {
    const nuevoOrden = opciones.length + 1;
    setOpciones([
      ...opciones,
      { id: Date.now(), nombre: "", imagen_url: "", orden_visual: nuevoOrden },
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
          op.id === id ? { ...op, imagen_url: URL.createObjectURL(file) } : op
        )
      );
    }
  };

  const enviar = (e) => {
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
        imagen_url: op.imagen_url || null,
        orden_visual: op.orden_visual,
      })),
    };

    console.log("Payload para insertar en MySQL:", payload);
    setCargando(false);
  };

  return (
    <div className="editarVotacion">
      <div className="encabezado">
        <img src={logo} alt="VotaYa Logo" className="icon-logo-oficial" />
        <h1>Crear una votación</h1>
        <h3>Únete a VotaYa</h3>
      </div>

      <form onSubmit={enviar} className="formulario">
        <section className="seccion-form">
          <h2>Datos Generales</h2>
          <div className="grid-datos-generales">
            
            <div className="formulario-campo col-span-2">
              <label htmlFor="titulo">Título o Asunto *</label>
              <input
                id="titulo"
                type="text"
                placeholder="Ej: Elección de Mesa Directiva"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="formulario-campo col-span-2">
              <label htmlFor="categoria">Categoría *</label>
              <select
                id="categoria"
                value={idCategoria}
                onChange={(e) => setIdCategoria(e.target.value)}
              >
                <option value="">-- Selecciona una categoría --</option>
                {categoriasLista.map((cat) => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="formulario-campo">
              <label htmlFor="fechaC">Fecha de comienzo *</label>
              <input
                id="fechaC"
                type="date"
                value={fechaC}
                onChange={(e) => setFechaC(e.target.value)}
              />
            </div>

            <div className="formulario-campo">
              <label htmlFor="horaC">Hora de comienzo *</label>
              <input
                id="horaC"
                type="time"
                value={horaC}
                onChange={(e) => setHoraC(e.target.value)}
              />
            </div>

            <div className="formulario-campo">
              <label htmlFor="fechaF">Fecha de finalización *</label>
              <input
                id="fechaF"
                type="date"
                value={fechaF}
                onChange={(e) => setFechaF(e.target.value)}
              />
            </div>

            <div className="formulario-campo">
              <label htmlFor="horaF">Hora de finalización *</label>
              <input
                id="horaF"
                type="time"
                value={horaF}
                onChange={(e) => setHoraF(e.target.value)}
              />
            </div>

            <div className="formulario-campo col-span-2">
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

        <section className="seccion-form">
          <h2>Agregar Opciones</h2>
          <div className="grid-opciones">
            {opciones.map((opcion, index) => (
              <div key={opcion.id} className="tarjeta-opcion">
                <button
                  type="button"
                  className="btn-eliminar-opcion"
                  onClick={() => eliminarOpcion(opcion.id)}
                >
                  &times;
                </button>
                <div className="upload-imagen-box">
                  <label htmlFor={`file-${opcion.id}`}>
                    {opcion.imagen_url ? (
                      <img src={opcion.imagen_url} alt="Preview" className="img-preview" />
                    ) : (
                      <div className="placeholder-img">
                        <span>🖼️</span>
                        <small>Subir imagen</small>
                      </div>
                    )}
                  </label>
                  <input
                    id={`file-${opcion.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => cambiarImagenOpcion(opcion.id, e)}
                    hidden
                  />
                </div>
                <span className="opcion-numero">Opción {index + 1}</span>
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
              className="tarjeta-opcion btn-agregar-card"
              onClick={agregarOpcion}
            >
              <span>Agregar</span>
              <span className="icono-mas">+</span>
            </button>
          </div>
        </section>

        <section className="seccion-form">
          <h2>Reglas de Votación</h2>
          <div className="grid-reglas">
            
            <div className="grupo-regla">
              <label>Privacidad</label>
              <div className="toggle-group">
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
              <div className="toggle-group">
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
              <div className="toggle-group">
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
                  style={{ padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>
            )}

            <div className="grupo-regla">
              <label>¿Permitir cambiar voto?</label>
              <div className="toggle-group">
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
              <div className="toggle-group">
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
              <div className="toggle-group">
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
              <div className="tarjetas-seleccion-grid">
                
                <div 
                  className={`card-opcion ${tipoGrafica === 'BARRAS' ? 'seleccionada' : ''}`}
                  onClick={() => setTipoGrafica('BARRAS')}
                >
                  <img src={imgBarras} alt="Gráfico de Barras" className="icon-grafica-img" />
                  <div>
                    <strong>Gráfica Barras</strong>
                    <small>Comparativa vertical</small>
                  </div>
                </div>

                <div 
                  className={`card-opcion ${tipoGrafica === 'PASTEL' ? 'seleccionada' : ''}`}
                  onClick={() => setTipoGrafica('PASTEL')}
                >
                  <img src={imgPastel} alt="Gráfico Pastel" className="icon-grafica-img" />
                  <div>
                    <strong>Gráfica Circular</strong>
                    <small>Porcentajes y proporciones</small>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {error && <p className="error">{error}</p>}

        <div className="acciones-finales">
          <button type="submit" className="EditarBoton" disabled={cargando}>
            {cargando ? "Guardando..." : "Crear votación"}
          </button>
          <div className="Editar-volver">
            <span>¿Deseas regresar? </span>
            <span className="Editar-volver-click">Volver</span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CrearVotacion;