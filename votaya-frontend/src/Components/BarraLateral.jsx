import logoVotaya from "../assets/icons/icon-votante.svg";

import "./BarraLateral.css";

function BarraLateral({
  perfil,
  seccionActiva,
  abierta,
  alCerrar,
  alCerrarSesion,
}) {
  const esAdministrador = perfil?.rol === "ADMINISTRADOR";

  function navegar(ruta) {
    window.location.href = ruta;
  }

  function obtenerClase(seccion) {
    const clases = ["menu-lateral__boton"];

    if (seccionActiva === seccion) {
      clases.push("menu-lateral__boton--activo");
    }

    return clases.join(" ");
  }

  return (
    <aside
      className={["barra-lateral", abierta ? "barra-lateral--abierta" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="marca-votaya">
        <img
          src={logoVotaya}
          alt="Logo de VotaYa"
          className="marca-votaya__imagen"
        />

        <span className="marca-votaya__nombre">VotaYa</span>

        <span className="marca-votaya__version">v0.1</span>
      </div>

      <nav className="menu-lateral">
        <button
          type="button"
          className={obtenerClase("mis-elecciones")}
          onClick={() => navegar("/mis-elecciones")}
        >
          Mis elecciones
        </button>

        <button
          type="button"
          className={obtenerClase("elecciones")}
          onClick={() => navegar("/elecciones")}
        >
          Elecciones
        </button>

        <button
          type="button"
          className={obtenerClase("mis-votos")}
          onClick={() => navegar("/mis-votos")}
        >
          Mis votos
        </button>

        {esAdministrador && (
          <>
            <div className="barra-lateral__separador" />

            <span className="barra-lateral__titulo-seccion">
              Administración
            </span>

            <button
              type="button"
              className={obtenerClase("usuarios")}
              onClick={() => navegar("/administrador/usuarios")}
            >
              Usuarios
            </button>

            <button
              type="button"
              className={obtenerClase("todas-las-elecciones")}
              onClick={() => navegar("/administrador/elecciones")}
            >
              Todas las elecciones
            </button>
          </>
        )}

        <button
          type="button"
          className="menu-lateral__boton"
          onClick={alCerrarSesion}
        >
          Salir
        </button>
      </nav>

      {abierta && (
        <button
          type="button"
          className="barra-lateral__cerrar"
          onClick={alCerrar}
          aria-label="Cerrar menú lateral"
        >
          ×
        </button>
      )}
    </aside>
  );
}

export default BarraLateral;
