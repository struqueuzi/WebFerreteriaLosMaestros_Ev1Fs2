import { useSyncExternalStore } from "react";
import { obtenerVersion, suscribir } from "../lib/almacen";

// Hace que el componente se vuelva a dibujar cada vez que cambian los datos guardados
// (productos, carrito, pedidos, usuarios...). Devuelve el número de versión de los datos.
export function useAlmacen() {
  return useSyncExternalStore(suscribir, obtenerVersion);
}
