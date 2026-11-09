import { Link } from "react-router-dom";
import { IconoCarrito } from "./Iconos";
import { descuentoDe, precioFinal, UMBRAL_STOCK_BAJO } from "../lib/productos";
import { formatoPesos } from "../lib/formato";

// Tarjeta de un producto del catálogo (borde amarillo, etiqueta de oferta o "Nuevo").
// Props: producto (objeto) y onAgregar(producto) (se llama al presionar el botón del carrito)
export default function TarjetaProducto({ producto, onAgregar }) {
  const agotado = producto.stock <= 0;
  const poco = producto.stock > 0 && producto.stock <= UMBRAL_STOCK_BAJO;
  const claseStock = agotado ? "text-danger fw-bold" : poco ? "text-warning fw-bold" : "text-secondary";
  const descuento = descuentoDe(producto);

  return (
    <div className="card h-100 tarjeta-producto">
      <Link to={`/producto/${producto.id}`} className="tarjeta-producto-foto">
        <img src={producto.imagen} alt={producto.nombre} />
      </Link>
      {(descuento > 0 || producto.esNuevo) && (
        <span className={`etiqueta-oferta${descuento > 0 ? "" : " nuevo"}`}>{descuento > 0 ? `-${descuento}%` : "Nuevo"}</span>
      )}

      <div className="card-body d-flex flex-column">
        <span className="etiqueta-categoria mb-1">{producto.categoria} › {producto.subcategoria}</span>
        <Link to={`/producto/${producto.id}`} className="text-decoration-none">
          <h3 className="card-title">{producto.nombre}</h3>
        </Link>
        <div className="mt-auto d-flex justify-content-between align-items-end gap-2">
          <div>
            <div className="d-flex align-items-baseline flex-wrap column-gap-2">
              <span className="precio">{formatoPesos(precioFinal(producto))}</span>
              {descuento > 0 && <s className="precio-antes">{formatoPesos(producto.precio)}</s>}
            </div>
            <span className={`small ${claseStock}`}>{agotado ? "Agotado" : `Stock: ${producto.stock} u.`}</span>
          </div>
          <button type="button" className="boton-carrito-cuadrado" disabled={agotado} onClick={() => onAgregar(producto)} aria-label={`Añadir ${producto.nombre} al carro`} title="Añadir al carro">
            <IconoCarrito tamano={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
