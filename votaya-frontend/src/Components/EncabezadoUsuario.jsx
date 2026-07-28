import { useState, useRef, useEffect } from "react";
import { resolverUrlArchivo } from "../api/clienteApi";
import "./EncabezadoUsuario.css";

function obtenerIniciales(perfil) {
  if (!perfil) return "U";
  const primeraInicial = perfil.nombres?.trim()?.[0] || "";
  const segundaInicial = perfil.apellidoPaterno?.trim()?.[0] || "";
  return `${primeraInicial}${segundaInicial}`.toUpperCase();
}

function EncabezadoUsuario({ perfil, alAbrirMenu, titulo, alIrAPerfil }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [errorFoto, setErrorFoto] = useState(false);
  const referenciaDropdown = useRef(null);

  const rutaFoto = perfil?.fotoUrl || perfil?.foto_url || perfil?.foto || perfil?.imagenUrl;
  const fotoUrl = resolverUrlArchivo(rutaFoto);

  
  useEffect(() => {
    setErrorFoto(false);
  }, [perfil, rutaFoto, fotoUrl]);

  useEffect(() => {
    function manejarClicFuera(event) {
      if (
        referenciaDropdown.current &&
        !referenciaDropdown.current.contains(event.target)
      ) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener("mousedown", manejarClicFuera);
    return () => {
      document.removeEventListener("mousedown", manejarClicFuera);
    };
  }, []);

  const manejarIrAPerfil = () => {
    setMenuAbierto(false);
    if (alIrAPerfil) {
      alIrAPerfil();
    }
  };

  return (
    <header className="encabezado-usuario">
      <div className="encabezado-usuario__izquierda">
        <button
          type="button"
          className="encabezado-usuario__boton-menu"
          aria-label="Abrir menú lateral"
          onClick={alAbrirMenu}
        >
          ☰
        </button>
        <h1 className="encabezado-usuario__bienvenida">
          {titulo || `Bienvenido ${perfil?.nombres || "Usuario"}`}
        </h1>
      </div>

      <div
        className="encabezado-usuario__contenedor-dropdown"
        ref={referenciaDropdown}
        style={{ position: "relative" }}
      >
        <div
          className="encabezado-usuario__perfil"
          onClick={() => setMenuAbierto(!menuAbierto)}
          style={{ cursor: "pointer" }}
        >
          {fotoUrl && !errorFoto ? (
            <img
              src={fotoUrl}
              alt={`Fotografía de ${perfil?.nombres || "usuario"}`}
              className="encabezado-usuario__foto"
              onError={() => setErrorFoto(true)}
            />
          ) : (
            <div className="encabezado-usuario__iniciales">
              {obtenerIniciales(perfil)}
            </div>
          )}
          <span className="encabezado-usuario__nombre">
            {perfil
              ? `${perfil.nombres} ${perfil.apellidoPaterno || ""}`.trim()
              : "Usuario"}
          </span>
          <span style={{ fontSize: "12px", marginLeft: "4px" }}>
            {menuAbierto ? "▲" : "▼"}
          </span>
        </div>

        {menuAbierto && (
          <div className="encabezado-usuario__desplegable">
            <button
              type="button"
              className="encabezado-usuario__desplegable-opcion"
              onClick={manejarIrAPerfil}
            >
              Editar perfil
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default EncabezadoUsuario;