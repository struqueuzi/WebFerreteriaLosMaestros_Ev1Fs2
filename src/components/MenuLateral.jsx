import { useState } from "react";
import {
  IconoBrocha, IconoCasco, IconoChevron, IconoHerramientas, IconoRayo, IconoTubo
} from "./Iconos";
import { useAlmacen } from "../hooks/useAlmacen";
import { agruparCategorias, obtenerProductos } from "../lib/productos";

const ICONO_CATEGORIA = {
  "Herramientas manuales": IconoHerramientas,
  "Herramientas eléctricas": IconoRayo,
  "Materiales de construcción": IconoCasco,
  "Gasfitería": IconoTubo
};

export function IconoDeCategoria({ categoria, tamano = 22 }) {
  const Icono = ICONO_CATEGORIA[categoria] || IconoBrocha;
  return <Icono tamano={tamano} />;
}

// Lista de categorías con su ícono (columna izquierda del inicio y menú "Categorías").
// Al pasar el mouse (o tocar la flecha en el celular) se ven las subcategorías.
// Props: onElegir(categoria, subcategoria), activa (categoría elegida)
export default function MenuLateral({ onElegir, activa = null }) {
  useAlmacen();
  const [abierta, setAbierta] = useState(null);
  const grupos = agruparCategorias(obtenerProductos());

  return (
    <ul className="menu-lateral list-unstyled mb-0">
      <li>
        <button type="button" className={`menu-lateral-item${activa === null ? " activa" : ""}`} onClick={() => onElegir(null, null)}>
          <span className="menu-lateral-icono"><IconoHerramientas tamano={22} /></span>
          <span className="flex-grow-1">Todos los productos</span>
        </button>
      </li>
      {grupos.map(({ categoria, subcategorias }) => (
        <li
          key={categoria}
          className={`menu-lateral-grupo${abierta === categoria ? " abierto" : ""}`}
          onMouseEnter={() => setAbierta(categoria)}
          onMouseLeave={() => setAbierta(null)}
        >
          <div className="d-flex">
            <button type="button" className={`menu-lateral-item${activa === categoria ? " activa" : ""}`} onClick={() => onElegir(categoria, null)}>
              <span className="menu-lateral-icono"><IconoDeCategoria categoria={categoria} /></span>
              <span className="flex-grow-1">{categoria}</span>
            </button>
            <button
              type="button"
              className="menu-lateral-flecha"
              aria-label={`Ver subcategorías de ${categoria}`}
              aria-expanded={abierta === categoria}
              onClick={() => setAbierta(abierta === categoria ? null : categoria)}
            >
              <IconoChevron tamano={14} />
            </button>
          </div>
          <ul className="menu-lateral-sub list-unstyled">
            {subcategorias.map((sub) => (
              <li key={sub}><button type="button" onClick={() => onElegir(categoria, sub)}>{sub}</button></li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
