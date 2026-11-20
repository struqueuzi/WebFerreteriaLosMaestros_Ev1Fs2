import { useState } from "react";
import LayoutPanel from "../components/LayoutPanel";
import TablaPedidos from "../components/TablaPedidos";
import { useAlmacen } from "../hooks/useAlmacen";
import { formatoPesos } from "../lib/formato";
import { obtenerProductos } from "../lib/productos";
import { peticion } from "../lib/api";

export default function PanelVendedor() {
  useAlmacen();
  const [detalle, setDetalle] = useState(null);
  const [error, setError] = useState("");
  async function consultar(id) {
    setError("");
    try { setDetalle(await peticion(`/productos/${id}`)); }
    catch (e) { setDetalle(null); setError(e.message); }
  }

  return (
    <LayoutPanel insignia="Vendedor">
      <h1 className="fw-bold h2 mb-4">Panel del vendedor</h1>
      <section className="card p-4 mb-4">
        <h2 className="h4">Productos</h2>
        <ul className="list-group">
          {obtenerProductos().map((p) => (
            <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center gap-3">
              <span>{p.nombre}</span>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => consultar(p.id)}>Ver producto</button>
            </li>
          ))}
        </ul>
        {error && <p role="alert">{error}</p>}
        {detalle && <p className="mt-3" role="status">{detalle.nombre} · {formatoPesos(detalle.precio)} · Stock: {detalle.stock} · {detalle.categoria}</p>}
      </section>
      <section className="card p-4 mb-4">
        <h2 className="h4">Órdenes</h2>
        <TablaPedidos soloLectura />
      </section>
    </LayoutPanel>
  );
}
