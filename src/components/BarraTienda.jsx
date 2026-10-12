import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MenuCategorias from "./MenuCategorias";
import { useAlmacen } from "../hooks/useAlmacen";
import { useSesion } from "../hooks/useSesion";
import { cantidadEnCarrito } from "../lib/pedidos";
import { FILTRO_VACIO } from "../lib/productos";
import { rutaPanelPorRol } from "../lib/usuarios";

// Encabezado de la tienda: logo, buscador, sesión, carrito y menú de categorías.
// Bootstrap: navbar-expand-lg hace que en pantallas chicas se colapse en un botón "hamburguesa".
export default function BarraTienda({ filtro = FILTRO_VACIO, onFiltro = () => {}, conBusqueda = true }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { usuario, cerrarSesion } = useSesion();
  const navigate = useNavigate();
  useAlmacen();

  const salir = () => {
    cerrarSesion();
    navigate("/");
  };

  return (
    <header className="sticky-top shadow-sm">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3">
        <div className="container gap-3">
          <Link className="navbar-brand fw-bold fs-3 text-warning" to="/">🛠️ LOS MAESTROS</Link>

          <button
            className="navbar-toggler"
            type="button"
            aria-controls="menuPrincipal"
            aria-expanded={menuAbierto}
            aria-label="Abrir menú"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse${menuAbierto ? " show" : ""}`} id="menuPrincipal">
            {conBusqueda ? (
              <form className="d-flex flex-grow-1 mx-lg-4 my-3 my-lg-0" role="search" onSubmit={(e) => e.preventDefault()}>
                <div className="input-group">
                  <input
                    type="search"
                    id="buscador"
                    className="form-control border-0 bg-white"
                    placeholder="¿Qué estás buscando hoy? Ej. Cemento, Martillo..."
                    aria-label="Buscar productos"
                    value={filtro.texto}
                    onChange={(e) => onFiltro({ ...filtro, texto: e.target.value })}
                  />
                  <button className="btn btn-warning fw-bold" type="submit" aria-label="Buscar">🔍</button>
                </div>
              </form>
            ) : (
              <div className="flex-grow-1"></div>
            )}

            <div className="d-flex align-items-center gap-3 flex-wrap">
              {usuario ? (
                <>
                  <Link to={rutaPanelPorRol(usuario.rol)} className="text-white text-decoration-none small fw-bold">👤 {usuario.nombre}</Link>
                  <button type="button" className="btn btn-outline-warning btn-sm" onClick={salir}>Cerrar sesión</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-white text-decoration-none small">👤 Iniciar sesión</Link>
                  <Link to="/registro" className="btn btn-outline-warning btn-sm">Crear cuenta</Link>
                </>
              )}
              <Link to="/carrito" className="btn btn-outline-warning d-flex align-items-center gap-2 py-2 px-3">
                <span>🛒</span><span className="fw-bold">Mi Carrito</span>
                <span className="badge bg-danger rounded-pill" data-testid="contador-carrito">{cantidadEnCarrito()}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {conBusqueda && (
        <div className="bg-secondary py-2">
          <div className="container">
            <MenuCategorias onElegir={(categoria, subcategoria) => onFiltro({ ...filtro, categoria, subcategoria })} />
          </div>
        </div>
      )}
    </header>
  );
}
