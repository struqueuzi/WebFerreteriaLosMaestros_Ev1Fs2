import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import PiePagina from "./PiePagina";
import { IconoCarrito } from "./Iconos";
import { useAlmacen } from "../hooks/useAlmacen";
import { useSesion } from "../hooks/useSesion";
import { cantidadEnCarrito } from "../lib/pedidos";

// Plantilla de los paneles (cliente, vendedor, administrador).
// Props: insignia (texto del rol), claseInsignia, conTienda (muestra "Ir a la tienda" y el carrito), barra (contenido bajo el navbar)
export default function LayoutPanel({ insignia, claseInsignia = "insignia-rol", conTienda = false, barra = null, children }) {
  const { usuario, cerrarSesion } = useSesion();
  const navigate = useNavigate();
  useAlmacen();

  const salir = () => {
    cerrarSesion();
    navigate("/");
  };

  return (
    <>
      <header className={`sticky-top encabezado${barra ? " con-barra" : ""}`}>
        <nav className="navbar navbar-dark">
          <div className="container gap-2">
            <Logo insignia={insignia} claseInsignia={claseInsignia} />
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span className="text-white-50 small d-none d-md-inline">{usuario ? usuario.correo : ""}</span>
              {conTienda && (
                <>
                  <Link to="/" className="btn btn-contorno btn-sm">Ir a la tienda</Link>
                  <Link to="/carrito" className="boton-carrito" aria-label="Ver mi carrito">
                    <IconoCarrito />
                    <span className="contador">{cantidadEnCarrito()}</span>
                  </Link>
                </>
              )}
              <button type="button" className="btn btn-contorno btn-sm" onClick={salir}>Cerrar sesión</button>
            </div>
          </div>
        </nav>
        {barra}
      </header>
      <main className="container my-4 panel-contenido">{children}</main>
      <PiePagina />
    </>
  );
}
