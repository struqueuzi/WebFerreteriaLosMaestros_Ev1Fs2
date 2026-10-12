// ========================================================
// inicializar.js - Carga los datos de ejemplo al abrir el sitio por primera vez
// (o cuando cambia VERSION_DATOS). Se llama una sola vez desde main.jsx.
// ========================================================
import { borrar, escribir, leer } from "./almacen";
import { guardarProductos, obtenerProductos, PRODUCTOS_DE_EJEMPLO } from "./productos";
import { asegurarCuentasDemo, reiniciarCuentasDemo } from "./usuarios";

// Si cambias los datos de ejemplo, sube este número y el sitio los vuelve a cargar una sola vez.
export const VERSION_DATOS = "ferreteria-react-v1";

export function inicializarDatos() {
  asegurarCuentasDemo();

  const hayProductos = localStorage.getItem("productos") !== null;
  const versionAlDia = leer("version_datos", null) === VERSION_DATOS;

  if (!hayProductos || !versionAlDia) {
    guardarProductos(PRODUCTOS_DE_EJEMPLO);
    escribir("version_datos", VERSION_DATOS);
    borrar("carrito_ferreteria"); // un carrito viejo apuntaría a productos que ya no existen
    reiniciarCuentasDemo();       // las cuentas de demostración vuelven a su estado inicial
  }

  // Productos sin categoría/subcategoría: les ponemos un valor por defecto para que no se rompa el menú
  const productos = obtenerProductos();
  let huboCambios = false;
  productos.forEach((p) => {
    if (!p.subcategoria) { p.subcategoria = "General"; huboCambios = true; }
    if (!p.categoria) { p.categoria = "Sin categoría"; huboCambios = true; }
  });
  if (huboCambios) guardarProductos(productos);
}

export function leerVersionDatos() {
  return leer("version_datos", null);
}
