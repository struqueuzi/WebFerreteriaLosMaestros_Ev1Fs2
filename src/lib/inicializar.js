// ========================================================
// inicializar.js - Carga los datos de ejemplo al abrir el sitio por primera vez
// (o cuando cambia VERSION_DATOS). Se llama una sola vez desde main.jsx.
// ========================================================
import { borrar, escribir, leer } from "./almacen";
import { numerarPedidosAntiguos } from "./pedidos";
import { guardarProductos, OFERTAS_DE_EJEMPLO, obtenerProductos, PRODUCTOS_DE_EJEMPLO } from "./productos";
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
    borrar("ofertas_ejemplo_aplicadas"); // las ofertas de ejemplo se vuelven a poner
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
  // Ofertas de ejemplo: se ponen una sola vez y solo en productos que todavía no tienen descuento ni etiqueta.
  // Así no se borra lo que el admin ya haya cambiado ni los pedidos guardados.
  if (!leer("ofertas_ejemplo_aplicadas", false)) {
    productos.forEach((p) => {
      const oferta = OFERTAS_DE_EJEMPLO[p.id];
      if (oferta && p.descuento === undefined && p.esNuevo === undefined) {
        Object.assign(p, oferta);
        huboCambios = true;
      }
    });
    escribir("ofertas_ejemplo_aplicadas", true);
  }

  if (huboCambios) guardarProductos(productos);

  // Pedidos viejos sin número de venta: se les pone uno corto (1001, 1002...)
  numerarPedidosAntiguos();
}

export function leerVersionDatos() {
  return leer("version_datos", null);
}
