// ========================================================
// almacen.js - Capa de persistencia (localStorage) + avisos de cambio.
// Cada vez que se guarda algo se avisa a los componentes suscritos (hook useAlmacen),
// así la pantalla se vuelve a dibujar sola cuando cambian los datos.
// ========================================================
const oyentes = new Set();
let version = 0;

export function suscribir(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function obtenerVersion() {
  return version;
}

export function notificar() {
  version += 1;
  oyentes.forEach((oyente) => oyente());
}

export function leer(clave, valorPorDefecto) {
  try {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : valorPorDefecto;
  } catch {
    return valorPorDefecto;
  }
}

export function escribir(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
  notificar();
}

export function borrar(clave) {
  localStorage.removeItem(clave);
  notificar();
}

// Si otra pestaña del navegador cambia los datos, esta también se actualiza
if (typeof window !== "undefined") {
  window.addEventListener("storage", () => notificar());
}
