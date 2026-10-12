import { useState } from "react";
import LayoutPanel from "../components/LayoutPanel";
import TablaPedidos from "../components/TablaPedidos";
import { useAlmacen } from "../hooks/useAlmacen";
import { formatoPesos } from "../lib/formato";
import { guardarProductos, obtenerProductos, UMBRAL_STOCK_BAJO } from "../lib/productos";
import { mensajeErrorMontoEntero } from "../lib/validaciones";

// Tarjeta de inventario de UN producto: el vendedor solo cambia el stock
function ItemInventario({ producto }) {
  const [stock, setStock] = useState(String(producto.stock));
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const bajo = producto.stock <= UMBRAL_STOCK_BAJO;

  const actualizar = () => {
    const eStock = mensajeErrorMontoEntero(stock, 0);
    if (eStock) {
      setError("Ingresa un número entero igual o mayor a 0.");
      setMensaje("");
      return;
    }
    setError("");

    // Se vuelve a leer la lista completa para no pisar cambios hechos en otro lado
    const todos = obtenerProductos();
    const objetivo = todos.find((p) => p.id === producto.id);
    if (!objetivo) return;
    objetivo.stock = Number(stock);
    guardarProductos(todos);
    setMensaje(`Stock actualizado: ${Number(stock)} u. ✔`);
  };

  return (
    <div className="card h-100 shadow-sm p-3">
      <div className="d-flex gap-3 align-items-center mb-2">
        <img src={producto.imagen} alt="" width="56" height="56" className="rounded" style={{ objectFit: "cover" }} />
        <div>
          <h6 className="fw-bold mb-0">{producto.nombre}</h6>
          <span className="small text-muted">{formatoPesos(producto.precio)} · {producto.categoria}</span>
        </div>
      </div>
      <label className="form-label small fw-bold mb-1" htmlFor={`stock-${producto.id}`}>
        Stock disponible {bajo && <span className="badge bg-danger ms-1">Stock bajo</span>}
      </label>
      <input type="number" id={`stock-${producto.id}`} min="0" className={`form-control form-control-sm mb-2${error ? " is-invalid" : ""}`} value={stock} onChange={(e) => setStock(e.target.value)} />
      {error && <div className="invalid-feedback d-block mb-2">{error}</div>}
      <button type="button" className="btn btn-warning btn-sm fw-bold btn-actualizar-stock" onClick={actualizar}>Actualizar stock</button>
      <div className="small text-success mt-2">{mensaje}</div>
    </div>
  );
}

export default function PanelVendedor() {
  useAlmacen();
  return (
    <LayoutPanel insignia="Vendedor">
      <h1 className="fw-bold h2 mb-1">Panel del Vendedor</h1>
      <p className="text-muted mb-4">Gestiona el inventario y el estado de los pedidos de los clientes.</p>

      <section className="card shadow-sm border-0 p-4 rounded-3 mb-4" aria-labelledby="titulo-inventario">
        <h2 className="fw-bold h4 mb-3" id="titulo-inventario">🏬 Inventario</h2>
        <div className="row g-3">
          {obtenerProductos().map((p) => (
            <div className="col-12 col-sm-6 col-lg-4" key={`${p.id}-${p.stock}`}>
              <ItemInventario producto={p} />
            </div>
          ))}
        </div>
      </section>

      <section className="card shadow-sm border-0 p-4 rounded-3" aria-labelledby="titulo-pedidos">
        <h2 className="fw-bold h4 mb-3" id="titulo-pedidos">📦 Pedidos de clientes (seguimiento)</h2>
        <TablaPedidos />
      </section>
    </LayoutPanel>
  );
}
