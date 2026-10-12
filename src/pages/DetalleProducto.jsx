import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import LayoutTienda from "../components/LayoutTienda";
import { useAviso } from "../context/AvisoContext";
import { useAlmacen } from "../hooks/useAlmacen";
import { formatoPesos } from "../lib/formato";
import { agregarAlCarrito } from "../lib/pedidos";
import { obtenerProductos } from "../lib/productos";

export default function DetalleProducto() {
  useAlmacen();
  const { id } = useParams();
  const { mostrarAviso } = useAviso();
  const [cantidad, setCantidad] = useState(1);
  const p = obtenerProductos().find((x) => x.id === parseInt(id, 10));

  if (!p) {
    return (
      <LayoutTienda>
        <div className="text-center py-5">
          <h3 className="text-muted">Este producto no existe o fue retirado 😕</h3>
          <Link to="/productos" className="btn btn-warning fw-bold mt-3">Volver al catálogo</Link>
        </div>
      </LayoutTienda>
    );
  }

  const agotado = p.stock <= 0;

  const agregar = () => {
    const n = parseInt(cantidad, 10);
    if (!n || n < 1) {
      mostrarAviso("Ingresa una cantidad válida (mínimo 1).", false);
      return;
    }
    const res = agregarAlCarrito(p.id, n);
    mostrarAviso(res.mensaje, res.exito);
  };

  return (
    <LayoutTienda>
      <div className="row g-4 align-items-center">
        <div className="col-12 col-md-5">
          <img src={p.imagen} alt={p.nombre} className="img-fluid rounded shadow-sm w-100" style={{ maxHeight: 420, objectFit: "contain", background: "#fff" }} />
        </div>
        <div className="col-12 col-md-7">
          <span className="badge bg-light text-secondary mb-2">{p.categoria} › {p.subcategoria}</span>
          <h1 className="fw-bold">{p.nombre}</h1>
          <p className="fs-2 fw-bold text-primary mb-1">{formatoPesos(p.precio)}</p>
          <p className={agotado ? "text-danger fw-bold" : "text-muted"}>{agotado ? "Producto agotado" : `Stock disponible: ${p.stock} unidades`}</p>

          <div className="d-flex gap-2 align-items-end flex-wrap mt-4">
            <div>
              <label htmlFor="cantidad" className="form-label fw-bold small">Cantidad</label>
              <input type="number" id="cantidad" className="form-control" min="1" max={p.stock} style={{ width: 110 }} disabled={agotado} value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
            </div>
            <button type="button" className="btn btn-warning fw-bold px-4" disabled={agotado} onClick={agregar}>🛒 Añadir al carro</button>
            <Link to="/productos" className="btn btn-outline-secondary">← Volver al catálogo</Link>
          </div>
        </div>
      </div>
    </LayoutTienda>
  );
}
