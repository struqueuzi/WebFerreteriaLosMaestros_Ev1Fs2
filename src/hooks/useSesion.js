import { useAlmacen } from "./useAlmacen";
import { cerrarSesion, iniciarSesion, obtenerSesionActual } from "../lib/usuarios";

// Datos del usuario con sesión iniciada (o null) y las acciones para entrar y salir.
export function useSesion() {
  useAlmacen(); // si cambia el usuario (saldo, rol, estado...) el componente se actualiza
  return { usuario: obtenerSesionActual(), iniciarSesion, cerrarSesion };
}
