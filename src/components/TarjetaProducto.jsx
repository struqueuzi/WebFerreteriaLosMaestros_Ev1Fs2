import { Link } from "react-router-dom";
import { UMBRAL_STOCK_BAJO } from "../lib/productos";
import { formatoPesos } from "../lib/formato";

// Tarjeta de un producto del catálogo.
// Props: producto (objeto) y onAgregar(producto) (se llama al presionar "Añadir al carro")
export default function TarjetaProducto({ producto, onAgregar }) {
  const agotado = producto.stock <= 0;
  const poco = producto.stock > 0 && producto.stock <= UMBRAL_STOCK_BAJO;
  const claseStock = agotado ? "text-danger fw-bold" : poco ? "text-warning fw-bold" : "text-muted";

  return (
    <div className="card h-100 shadow-sm border-1">
      <Link to={`/producto/${producto.id}`}>
        <img src={producto.imagen} className="card-img-top" alt={producto.nombre} style={{ height: 180, objectFit: "cover" }} />
      </Link>
      <div className="card-body d-flex flex-column p-3">
        <span className="badge bg-light text-secondary small align-self-start mb-2">{producto.categoria} › {producto.subcategoria}</span>
        <Link to={`/producto/${producto.id}`} className="text-decoration-none text-dark">
          <h6 className="card-title fw-bold mb-2">{producto.nombre}</h6>
        </Link>
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fs-5 fw-bold text-primary">{formatoPesos(producto.precio)}</span>
            <span className={`small ${claseStock}`}>{agotado ? "Agotado" : `Stock: ${producto.stock} u.`}</span>
          </div>
          <button type="button" className="btn btn-warning w-100 fw-bold py-2 btn-sm" disabled={agotado} onClick={() => onAgregar(producto)}>
            🛒 Añadir al carro
          </button>
        </div>
      </div>
    </div>
  );
}
