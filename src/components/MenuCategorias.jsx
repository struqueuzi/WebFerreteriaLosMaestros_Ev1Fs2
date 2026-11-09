import { useEffect, useRef, useState } from "react";
import { useAlmacen } from "../hooks/useAlmacen";
import { agruparCategorias, obtenerProductos } from "../lib/productos";

// Menú Categoría → Subcategoría. Se arma solo con las categorías que TIENEN productos.
// Props: onElegir(categoria, subcategoria)  (null = sin filtro)
// Estado: "abierta" = categoría con el submenú desplegado (sirve en celulares; en computador también funciona el hover por CSS)
export default function MenuCategorias({ onElegir }) {
  useAlmacen();
  const [abierta, setAbierta] = useState(null);
  const ref = useRef(null);
  const grupos = agruparCategorias(obtenerProductos());

  // Clic fuera del menú: se cierra
  useEffect(() => {
    const cerrarSiClicFuera = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierta(null);
    };
    document.addEventListener("click", cerrarSiClicFuera);
    return () => document.removeEventListener("click", cerrarSiClicFuera);
  }, []);

  const elegir = (categoria, subcategoria) => {
    setAbierta(null);
    onElegir(categoria, subcategoria);
  };

  return (
    <ul className="nav gap-4 small fw-bold flex-wrap" id="menu-categorias" ref={ref}>
      <li className="nav-item">
        <button type="button" className="nav-link text-white p-0" onClick={() => elegir(null, null)}>Todos los productos</button>
      </li>
      {grupos.map(({ categoria, subcategorias }) => (
        <li key={categoria} className={`nav-item menu-item-categoria${abierta === categoria ? " abierto" : ""}`}>
          <button
            type="button"
            className="nav-link text-white p-0 toggle-categoria"
            aria-haspopup="true"
            aria-expanded={abierta === categoria}
            onClick={() => setAbierta(abierta === categoria ? null : categoria)}
          >
            {categoria} ▾
          </button>
          <ul className="submenu-categoria">
            <li><button type="button" onClick={() => elegir(categoria, null)}>Ver toda la categoría</button></li>
            {subcategorias.map((sub) => (
              <li key={sub}><button type="button" onClick={() => elegir(categoria, sub)}>{sub}</button></li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
