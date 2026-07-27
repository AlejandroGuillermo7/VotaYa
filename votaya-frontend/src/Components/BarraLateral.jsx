import logoVotaYa from "../assets/icons/icon-logo-offletters.png";
import "./BarraLateral.css";

function BarraLateral({
  alCerrarSesion,
  abierta = false,
  alCerrar,
  seccionActiva = "mis-elecciones",
}) {
  function navegar(ruta) {
    alCerrar?.();
    window.location.href = ruta;
  }

  function cerrarSesion() {
    alCerrar?.();
    alCerrarSesion();
  }

  function obtenerClase(seccion) {
    return [
      "menu-lateral__boton",
      seccionActiva === seccion
        ? "menu-lateral__boton--activo"
        : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return (
    <aside
      className={`barra-lateral ${
        abierta ? "barra-lateral--abierta" : ""
      }`}
    >
      <button
        type="button"
        className="barra-lateral__cerrar"
        aria-label="Cerrar menú"
        onClick={alCerrar}
      >
        ×
      </button>

      <div className="marca-votaya">
        <img
          src={logoVotaYa}
          alt="Logotipo de VotaYa"
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

        <button
          type="button"
          className="menu-lateral__boton"
          onClick={cerrarSesion}
        >
          Salir
        </button>
      </nav>
    </aside>
  );
}

export default BarraLateral;