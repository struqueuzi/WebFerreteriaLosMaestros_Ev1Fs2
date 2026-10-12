import { Navigate } from "react-router-dom";
import { useSesion } from "../hooks/useSesion";
import { rutaPanelPorRol } from "../lib/usuarios";

// Protege un panel: sin sesión -> login; con otro rol -> a su propio panel.
export default function RutaProtegida({ rol, children }) {
  const { usuario } = useSesion();
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== rol) return <Navigate to={rutaPanelPorRol(usuario.rol)} replace />;
  return children;
}
