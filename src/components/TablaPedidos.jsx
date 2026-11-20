import { apiActiva, cargarPedidos, peticion } from "../lib/api";
import { useState } from "react";
import { useAlmacen } from "../hooks/useAlmacen";
import { formatoPesos } from "../lib/formato";
import { actualizarEstadoPedido, ESTADOS_PEDIDO, nombreFormaPago, obtenerPedidos } from "../lib/pedidos";

function FilaPedido({ pedido, soloLectura, abrir }) {
  const [estado, setEstado] = useState(pedido.estado);
  const [mensaje, setMensaje] = useState("");

  const actualizar = async () => {
    if (apiActiva()) {
      try {
        await peticion(`/ordenes/${pedido.ordenId}`, { metodo: "PATCH", datos: { estado } }, true);
        await cargarPedidos();
      } catch (error) { setMensaje(error.message); }
      return;
    }
    const res = actualizarEstadoPedido(pedido.id, estado);
    setMensaje(res.mensaje);
    setTimeout(() => setMensaje(""), 2000);
  };

  const entrega = pedido.tipoEntrega === "despacho" ? `Despacho: ${pedido.direccion || "sin dirección"}` : "Retiro en tienda";
  const pago = nombreFormaPago(pedido.formaPago);

  return (
    <tr>
      <td className="small">{pedido.numeroVenta ? <div className="fw-bold">N° {pedido.numeroVenta}</div> : null}{pedido.fecha}</td>
      <td>{pedido.clienteCorreo}<div className="small text-muted">{entrega}</div></td>
      <td>{pedido.productoNombre}</td>
      <td>{pedido.cantidad}</td>
      <td>{formatoPesos(pedido.total)}</td>
      <td className="small">{pago}{pedido.estadoPago && <div><span className={`badge ${pedido.estadoPago === "Confirmado" ? "bg-success" : pedido.estadoPago === "Rechazado" ? "bg-danger" : "bg-warning text-dark"}`}>{pedido.estadoPago}</span></div>}</td>
      <td>
        {soloLectura ? pedido.estado : <select className="form-select form-select-sm select-estado" aria-label="Estado del pedido" value={estado} onChange={(e) => setEstado(e.target.value)}>
          {ESTADOS_PEDIDO.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>}
      </td>
      <td className="text-end">
        {soloLectura
          ? <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => abrir(pedido.ordenId)}>Ver orden</button>
          : <button type="button" className="btn btn-sm btn-warning btn-actualizar-estado" onClick={actualizar}>Actualizar</button>}
        <div className="small text-success mt-1">{mensaje}</div>
      </td>
    </tr>
  );
}

// Tabla de pedidos con cambio de estado (seguimiento). La usan el panel del VENDEDOR y el del ADMINISTRADOR.
export default function TablaPedidos({ soloLectura = false }) {
  useAlmacen();
  const [detalle, setDetalle] = useState(null);
  const [error, setError] = useState("");
  async function abrir(id) {
    setError("");
    try { setDetalle(await peticion(`/ordenes/${id}`, {}, true)); }
    catch (e) { setDetalle(null); setError(e.message); }
  }
  const pedidos = [...obtenerPedidos()].reverse(); // los más nuevos primero

  return (
    <div>
      {error && <p role="alert">{error}</p>}
      {detalle && <div className="mb-3" role="status">
        <strong>Orden N° {detalle.id} · {detalle.estado} · {formatoPesos(detalle.total)}</strong>
        <ul>{detalle.items.map((item) => <li key={item.productoId}>{item.productoNombre} × {item.cantidad}</li>)}</ul>
      </div>}
      <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th>Fecha</th><th>Cliente / entrega</th><th>Producto</th><th>Cant.</th>
            <th>Total</th><th>Pago</th><th style={{ minWidth: 150 }}>Estado</th><th></th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length === 0 ? (
            <tr><td colSpan="8" className="text-muted text-center py-3">No hay pedidos registrados aún.</td></tr>
          ) : (
            pedidos.map((p) => <FilaPedido key={`${p.id}-${p.estado}`} pedido={p} soloLectura={soloLectura} abrir={abrir} />)
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
