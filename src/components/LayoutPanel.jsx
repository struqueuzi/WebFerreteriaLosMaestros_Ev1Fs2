import { Link, useNavigate } from "react-router-dom";
import PiePagina from "./PiePagina";
import { useAlmacen } from "../hooks/useAlmacen";
import { useSesion } from "../hooks/useSesion";
import { cantidadEnCarrito } from "../lib/pedidos";

// Plantilla de los paneles (cliente, vendedor, administrador).
// Props: insignia (texto del rol), claseInsignia, conTienda (muestra "Ir a la tienda" y el carrito), barra (contenido bajo el navbar)
export default function LayoutPanel({ insignia, claseInsignia = "bg-warning text-dark", conTienda = false, barra = null, children }) {
  const { usuario, cerrarSesion } = useSesion();
  const navigate = useNavigate();
  useAlmacen();

  const salir = () => {
    cerrarSesion();
    navigate("/");
  };

  return (
    <>
      <header className="sticky-top shadow-sm">
        <nav className="navbar navbar-dark bg-dark py-3">
          <div className="container gap-2">
            <Link className="navbar-brand fw-bold fs-4 text-warning" to="/">
              🛠️ LOS MAESTROS {insignia && <span className={`badge ${claseInsignia} fs-6 align-middle`}>{insignia}</span>}
            </Link>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="text-white small d-none d-md-inline">{usuario ? usuario.correo : ""}</span>
              {conTienda && (
                <>
                  <Link to="/" className="btn btn-outline-light btn-sm">Ir a la tienda</Link>
                  <Link to="/carrito" className="btn btn-warning btn-sm fw-bold">
                    🛒 Mi carrito <span className="badge bg-danger">{cantidadEnCarrito()}</span>
                  </Link>
                </>
              )}
              <button type="button" className="btn btn-outline-warning btn-sm" onClick={salir}>Cerrar sesión</button>
            </div>
          </div>
        </nav>
        {barra}
      </header>
      <main className="container my-4">{children}</main>
      <PiePagina />
    </>
  );
}
