const URL_API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api";

export async function peticionApi(
  ruta,
  opciones = {},
) {
  const token =
    localStorage.getItem("token");

  const headers = new Headers(
    opciones.headers || {},
  );

  const esFormData =
    opciones.body instanceof FormData;

  if (
    opciones.body &&
    !esFormData &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const respuesta = await fetch(
    `${URL_API}${ruta}`,
    {
      ...opciones,
      headers,
    },
  );

  /*
   * DELETE normalmente responde 204
   * y no contiene JSON.
   */
  if (respuesta.status === 204) {
    return null;
  }

  const tipoContenido =
    respuesta.headers.get(
      "content-type",
    ) || "";

  let datos = null;

  if (
    tipoContenido.includes(
      "application/json",
    )
  ) {
    datos = await respuesta.json();
  } else {
    const texto = await respuesta.text();

    datos = texto || null;
  }

  if (!respuesta.ok) {
    const mensaje =
      datos?.mensaje ||
      datos?.message ||
      datos ||
      "Ocurrió un error en la solicitud.";

    throw new Error(mensaje);
  }

  return datos;
}

export function resolverUrlArchivo(ruta) {
  if (!ruta) {
    return null;
  }

  if (
    ruta.startsWith("http://") ||
    ruta.startsWith("https://") ||
    ruta.startsWith("blob:")
  ) {
    return ruta;
  }

  return `http://localhost:8080${
    ruta.startsWith("/") ? "" : "/"
  }${ruta}`;
}