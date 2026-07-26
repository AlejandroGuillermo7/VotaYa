const URL_API = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
).replace(/\/$/, '');

const URL_SERVIDOR = URL_API.replace(/\/api$/, '');

export function obtenerToken() {
  return localStorage.getItem('token');
}

export function resolverUrlArchivo(ruta) {
  if (!ruta) {
    return null;
  }

  if (
    ruta.startsWith('http://') ||
    ruta.startsWith('https://') ||
    ruta.startsWith('data:')
  ) {
    return ruta;
  }

  return `${URL_SERVIDOR}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
}

export async function peticionApi(ruta, opciones = {}) {
  const token = obtenerToken();
  const encabezados = new Headers(opciones.headers || {});

  if (token) {
    encabezados.set('Authorization', `Bearer ${token}`);
  }

  if (
    opciones.body &&
    !(opciones.body instanceof FormData) &&
    !encabezados.has('Content-Type')
  ) {
    encabezados.set('Content-Type', 'application/json');
  }

  const respuesta = await fetch(`${URL_API}${ruta}`, {
    ...opciones,
    headers: encabezados,
  });

  let datos = null;

  if (respuesta.status !== 204) {
    const tipoContenido = respuesta.headers.get('content-type');

    datos = tipoContenido?.includes('application/json')
      ? await respuesta.json()
      : await respuesta.text();
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      localStorage.removeItem('token');
    }

    const mensaje =
      typeof datos === 'string'
        ? datos
        : datos?.mensaje ||
          datos?.error ||
          `Error HTTP ${respuesta.status}`;

    throw new Error(mensaje);
  }

  return datos;
}