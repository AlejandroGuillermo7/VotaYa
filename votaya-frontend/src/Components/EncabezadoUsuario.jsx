import { resolverUrlArchivo } from "../api/clienteApi";
import "./EncabezadoUsuario.css";

function obtenerIniciales(perfil) {
  if (!perfil) {
    return "U";
  }

  const primeraInicial = perfil.nombres?.trim()?.[0] || "";
  const segundaInicial = perfil.apellidoPaterno?.trim()?.[0] || "";

  return `${primeraInicial}${segundaInicial}`.toUpperCase();
}

function EncabezadoUsuario({
  perfil,
  alAbrirMenu,
  titulo,
}) {
  const foto = resolverUrlArchivo(perfil?.fotoUrl);

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

      <div className="encabezado-usuario__perfil">
        {foto ? (
          <img
            src={foto}
            alt={`Fotografía de ${perfil?.nombres || "usuario"}`}
            className="encabezado-usuario__foto"
          />
        ) : (
          <div className="encabezado-usuario__iniciales">
            {obtenerIniciales(perfil)}
          </div>
        )}

        <span className="encabezado-usuario__nombre">
          {perfil
            ? `${perfil.nombres} ${perfil.apellidoPaterno}`
            : "Usuario"}
        </span>
      </div>
    </header>
  );
}

export default EncabezadoUsuario;