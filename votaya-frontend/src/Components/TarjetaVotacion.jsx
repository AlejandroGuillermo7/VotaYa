import { resolverUrlArchivo } from "../api/clienteApi";

function combinarOpciones(votacion) {
  const resultados = votacion.resultados?.opciones || [];

  return (votacion.opciones || []).map((opcion) => {
    const resultado = resultados.find(
      (elemento) => elemento.idOpcion === opcion.idOpcion,
    );

    return {
      ...opcion,
      totalVotos: resultado?.totalVotos || 0,
      porcentaje: resultado?.porcentaje || 0,
    };
  });
}

function GraficaVertical({ opciones }) {
  const mayorCantidad = Math.max(
    ...opciones.map((opcion) => opcion.totalVotos),
    1,
  );

  const mayorVotado = opciones.reduce(
    (actual, opcion) =>
      opcion.totalVotos > actual.totalVotos ? opcion : actual,
    opciones[0],
  );

  return (
    <div className="grafica-vertical">
      {opciones.map((opcion) => {
        const esMayorVotado =
          opcion.idOpcion === mayorVotado?.idOpcion && opcion.totalVotos > 0;

        const altura =
          opcion.totalVotos === 0
            ? 24
            : 35 + (opcion.totalVotos / mayorCantidad) * 105;

        return (
          <div className="grafica-vertical__elemento" key={opcion.idOpcion}>
            <div
              className={
                esMayorVotado
                  ? "grafica-vertical__barra grafica-vertical__barra--principal"
                  : "grafica-vertical__barra"
              }
              style={{ height: `${altura}px` }}
              title={`${opcion.nombre}: ${opcion.totalVotos} votos`}
            >
              {esMayorVotado && (
                <span className="grafica-vertical__etiqueta">Más votado</span>
              )}
            </div>

            <span className="grafica-vertical__nombre">{opcion.nombre}</span>
          </div>
        );
      })}
    </div>
  );
}

function GraficaHorizontal({ opciones }) {
  const mayorCantidad = Math.max(
    ...opciones.map((opcion) => opcion.totalVotos),
    1,
  );

  const mayorVotado = opciones.reduce(
    (actual, opcion) =>
      opcion.totalVotos > actual.totalVotos ? opcion : actual,
    opciones[0],
  );

  return (
    <div className="grafica-horizontal">
      {opciones.map((opcion) => {
        const esMayorVotado =
          opcion.idOpcion === mayorVotado?.idOpcion && opcion.totalVotos > 0;

        const anchura =
          opcion.totalVotos === 0
            ? 8
            : Math.max(12, (opcion.totalVotos / mayorCantidad) * 100);

        const imagen = resolverUrlArchivo(opcion.imagenUrl);

        return (
          <div className="grafica-horizontal__fila" key={opcion.idOpcion}>
            <span className="grafica-horizontal__nombre">{opcion.nombre}</span>

            <div className="grafica-horizontal__pista">
              <div
                className={
                  esMayorVotado
                    ? "grafica-horizontal__barra grafica-horizontal__barra--principal"
                    : "grafica-horizontal__barra"
                }
                style={{ width: `${anchura}%` }}
                title={`${opcion.totalVotos} votos`}
              />
            </div>

            {imagen ? (
              <img
                src={imagen}
                alt={opcion.nombre}
                className="grafica-horizontal__imagen"
              />
            ) : (
              <span className="grafica-horizontal__cantidad">
                {opcion.totalVotos}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TarjetaVotacion({ votacion }) {
  const opciones = combinarOpciones(votacion);
  const imagenPortada = resolverUrlArchivo(votacion.imagenPortadaUrl);

  const usarGraficaHorizontal = opciones.length <= 3;

  return (
    <article className="tarjeta-votacion">
      <header className="tarjeta-votacion__encabezado">
        <div>
          <h2 className="tarjeta-votacion__titulo">Elección activa</h2>

          <p className="tarjeta-votacion__pregunta">{votacion.titulo}</p>
        </div>

        {imagenPortada ? (
          <img
            src={imagenPortada}
            alt=""
            className="tarjeta-votacion__portada"
          />
        ) : (
          <span className="tarjeta-votacion__icono">🗳️</span>
        )}
      </header>

      {opciones.length === 0 ? (
        <div className="tarjeta-votacion__vacia">
          Esta elección todavía no tiene opciones.
        </div>
      ) : usarGraficaHorizontal ? (
        <GraficaHorizontal opciones={opciones} />
      ) : (
        <GraficaVertical opciones={opciones} />
      )}
    </article>
  );
}

export default TarjetaVotacion;
