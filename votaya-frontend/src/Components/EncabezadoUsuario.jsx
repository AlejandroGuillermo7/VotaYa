import { resolverUrlArchivo } from "../api/clienteApi";

function obtenerIniciales(perfil) {
  if (!perfil) {
    return "U";
  }

  const primeraInicial = perfil.nombres?.trim()?.[0] || "";
  const segundaInicial = perfil.apellidoPaterno?.trim()?.[0] || "";

  return `${primeraInicial}${segundaInicial}`.toUpperCase();
}

function EncabezadoUsuario({ perfil }) {
  const foto = resolverUrlArchivo(perfil?.fotoUrl);

  return (
    <header className="encabezado-usuario">
      <h1 className="encabezado-usuario__bienvenida">
        Bienvenido {perfil?.nombres || "Usuario"} 👋
      </h1>

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
          {perfil ? `${perfil.nombres} ${perfil.apellidoPaterno}` : "Usuario"}
        </span>

        <span className="encabezado-usuario__flecha">⌄</span>
      </div>
    </header>
  );
}

export default EncabezadoUsuario;
