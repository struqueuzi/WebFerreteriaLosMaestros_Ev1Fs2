import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import MenuLateral from "./MenuLateral";
import {
  IconoAudifonos, IconoCamion, IconoCarrito, IconoEscudo, IconoEstrella, IconoEtiquetaChica,
  IconoFacebook, IconoFuego, IconoInstagram, IconoLupa, IconoMenu, IconoTiktok, IconoUbicacion,
  IconoUsuario, IconoYoutube, IconoCasa
} from "./Iconos";
import { useAlmacen } from "../hooks/useAlmacen";
import { useSesion } from "../hooks/useSesion";
import { formatoPesos } from "../lib/formato";
import { cantidadEnCarrito, totalCarrito } from "../lib/pedidos";
import { FILTRO_VACIO } from "../lib/productos";
import { rutaPanelPorRol } from "../lib/usuarios";

// Arma la ruta del catálogo con los filtros en la URL (la página Productos los lee)
export function rutaCatalogo({ categoria = null, subcategoria = null, especial = null, texto = "" } = {}) {
  const params = new URLSearchParams();
  if (categoria) params.set("categoria", categoria);
  if (subcategoria) params.set("sub", subcategoria);
  if (especial) params.set("especial", especial);
  if (texto) params.set("q", texto);
  const q = params.toString();
  return q ? `/productos?${q}` : "/productos";
}

// Hook chico: cierra un menú al hacer clic afuera
function useCerrarAlClicAfuera(abierto, cerrar) {
  const ref = useRef(null);
  useEffect(() => {
    if (!abierto) return undefined;
    const f = (e) => { if (ref.current && !ref.current.contains(e.target)) cerrar(); };
    document.addEventListener("click", f);
    return () => document.removeEventListener("click", f);
  }, [abierto, cerrar]);
  return ref;
}

function MenuCuenta() {
  const { usuario, cerrarSesion } = useSesion();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const ref = useCerrarAlClicAfuera(abierto, () => setAbierto(false));

  const salir = () => {
    setAbierto(false);
    cerrarSesion();
    navigate("/");
  };

  return (
    <div className={`menu-cuenta${abierto ? " abierto" : ""}`} ref={ref}>
      <button type="button" className="boton-cuenta" aria-haspopup="true" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>
        <IconoUsuario tamano={22} />
        <span className="boton-cuenta-texto">{usuario ? usuario.nombre.split(" ")[0] : "Mi cuenta"}</span>
        <span className="flechita" aria-hidden="true">▾</span>
      </button>
      <div className="menu-cuenta-panel">
        {usuario ? (
          <>
            <div className="small text-secondary px-3 pt-1 pb-2">{usuario.correo}</div>
            <Link to={rutaPanelPorRol(usuario.rol)} onClick={() => setAbierto(false)}>Ir a mi panel</Link>
            {usuario.rol === "cliente" && <Link to="/cliente/compras" onClick={() => setAbierto(false)}>Mis compras</Link>}
            <button type="button" onClick={salir}>Cerrar sesión</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setAbierto(false)}>Iniciar sesión</Link>
            <Link to="/registro" onClick={() => setAbierto(false)}>Crear cuenta</Link>
          </>
        )}
      </div>
    </div>
  );
}

// Pestaña amarilla "Categorías" con la lista desplegable.
function PestanaCategorias({ fija, onElegir }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useCerrarAlClicAfuera(abierto, () => setAbierto(false));

  // En el inicio, en pantallas grandes, la lista ya está abierta al lado del banner: la pestaña es solo un título.
  // En el celular esa lista no se ve, así que igual se muestra el menú desplegable.
  return (
    <>
      {fija && <div className="pestana-categorias fija d-none d-lg-flex"><IconoMenu /> <span>Categorías</span></div>}
      <div className={`pestana-contenedor${abierto ? " abierto" : ""}${fija ? " d-lg-none" : ""}`} ref={ref}>
        <button type="button" className="pestana-categorias" aria-haspopup="true" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>
          <IconoMenu /> <span>Categorías</span> <span className="flechita" aria-hidden="true">▾</span>
        </button>
        <div className="pestana-panel">
          <MenuLateral onElegir={(c, s) => { setAbierto(false); onElegir(c, s); }} />
        </div>
      </div>
    </>
  );
}

// Encabezado de la tienda: franja superior, logo + buscador + cuenta + carrito, y la barra de navegación.
// Props: filtro / onFiltro (si la página filtra en vivo), categoriasFijas (en el inicio)
export default function BarraTienda({ filtro = FILTRO_VACIO, onFiltro = null, categoriasFijas = false }) {
  useAlmacen();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [textoLocal, setTextoLocal] = useState("");

  const especialActual = new URLSearchParams(search || "").get("especial");
  const texto = onFiltro ? filtro.texto : textoLocal;

  const cambiarTexto = (valor) => {
    if (onFiltro) onFiltro({ ...filtro, texto: valor });
    else setTextoLocal(valor);
  };

  const buscar = (e) => {
    e.preventDefault();
    if (onFiltro) document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
    else navigate(rutaCatalogo({ texto: textoLocal.trim() }));
  };

  const elegirCategoria = (categoria, subcategoria) => {
    setMenuAbierto(false);
    if (onFiltro) {
      onFiltro({ ...filtro, categoria, subcategoria });
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(rutaCatalogo({ categoria, subcategoria }));
    }
  };

  const irAContacto = () => {
    setMenuAbierto(false);
    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
  };

  const enlaces = [
    { texto: "Inicio", ruta: "/", Icono: IconoCasa, activo: pathname === "/" },
    { texto: "Ofertas", ruta: rutaCatalogo({ especial: "ofertas" }), Icono: IconoFuego, activo: pathname === "/productos" && especialActual === "ofertas" },
    { texto: "Novedades", ruta: rutaCatalogo({ especial: "nuevos" }), Icono: IconoEstrella, activo: pathname === "/productos" && especialActual === "nuevos" },
    { texto: "Productos", ruta: "/productos", Icono: IconoEtiquetaChica, activo: pathname === "/productos" && !especialActual }
  ];

  return (
    <header className="encabezado-tienda">
      <div className="barra-superior d-none d-md-block">
        <div className="container d-flex align-items-center gap-4">
          <span><IconoUbicacion /> La Serena, Región de Coquimbo</span>
          <span className="separador"><IconoCamion /> Despacho a domicilio</span>
          <span className="separador"><IconoEscudo /> Compra 100% segura</span>
          <span className="ms-auto d-flex gap-3 redes-superior">
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook"><IconoFacebook /></a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><IconoInstagram /></a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer" aria-label="TikTok"><IconoTiktok /></a>
            <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube"><IconoYoutube /></a>
          </span>
        </div>
      </div>

      <div className="barra-principal">
        <div className="container d-flex align-items-center flex-wrap gap-3">
          <Logo />

          {/* Es un div y no un <form> para que no se confunda con el formulario de la página (carrito, login...) */}
          <div className="buscador-neon order-3 order-lg-2" role="search">
            <input
              type="search"
              id="buscador"
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              autoComplete="off"
              value={texto}
              onChange={(e) => cambiarTexto(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") buscar(e); }}
            />
            <button type="button" aria-label="Buscar" onClick={buscar}><IconoLupa tamano={22} /></button>
          </div>

          <div className="d-flex align-items-center gap-3 ms-auto order-2 order-lg-3">
            <MenuCuenta />
            <Link to="/carrito" className="caja-carrito" aria-label="Ver mi carrito">
              <span className="caja-carrito-icono">
                <IconoCarrito tamano={30} />
                <span className="contador" data-testid="contador-carrito">{cantidadEnCarrito()}</span>
              </span>
              <span className="caja-carrito-total">{formatoPesos(totalCarrito())}</span>
            </Link>
            <button type="button" className="boton-hamburguesa d-lg-none" aria-label="Abrir menú" aria-expanded={menuAbierto} onClick={() => setMenuAbierto(!menuAbierto)}>
              <IconoMenu />
            </button>
          </div>
        </div>
      </div>

      <nav className={`barra-navegacion${menuAbierto ? " abierta" : ""}`} aria-label="Navegación principal">
        <div className="container d-lg-flex align-items-stretch">
          <PestanaCategorias fija={categoriasFijas} onElegir={elegirCategoria} />
          <ul className="nav-principal list-unstyled mb-0">
            {enlaces.map(({ texto: t, ruta, Icono, activo }) => (
              <li key={t}>
                <Link to={ruta} className={activo ? "activo" : ""} onClick={() => setMenuAbierto(false)}><Icono tamano={20} /> {t}</Link>
              </li>
            ))}
            <li><button type="button" onClick={irAContacto}><IconoAudifonos tamano={20} /> Contacto</button></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
