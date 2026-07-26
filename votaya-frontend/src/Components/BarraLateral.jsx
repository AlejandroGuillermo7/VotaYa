import logoVotaYa from "../assets/icons/icon-logo-offletters.png";

function BarraLateral({ alCerrarSesion }) {
  return (
    <aside className="barra-lateral">
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
          className="menu-lateral__boton menu-lateral__boton--activo"
        >
          Inicio
        </button>

        <button
          type="button"
          className="menu-lateral__boton"
          onClick={() => {
            window.location.href = "/mis-elecciones";
          }}
        >
          Mis elecciones
        </button>

        <button
          type="button"
          className="menu-lateral__boton"
          onClick={() => {
            window.location.href = "/mis-votos";
          }}
        >
          Mis votos
        </button>

        <button
          type="button"
          className="menu-lateral__boton"
          onClick={alCerrarSesion}
        >
          Salir
        </button>
      </nav>
    </aside>
  );
}

export default BarraLateral;
