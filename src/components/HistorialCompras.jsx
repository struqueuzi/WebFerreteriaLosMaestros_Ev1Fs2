import { useAlmacen } from "../hooks/useAlmacen";
import { formatoPesos } from "../lib/formato";
import { obtenerPedidos } from "../lib/pedidos";

const PROGRESO_ESTADO = { "Pendiente": 25, "En preparación": 50, "Enviado": 75, "Entregado": 100 };
const COLOR_ESTADO = { "Pendiente": "bg-secondary", "En preparación": "bg-info", "Enviado": "bg-primary", "Entregado": "bg-success" };

// Historial de pedidos del cliente con barra de seguimiento. Prop: correo del cliente.
export default function HistorialCompras({ correo }) {
  useAlmacen();
  const pedidos = obtenerPedidos().filter((p) => p.clienteCorreo === correo).reverse();

  if (pedidos.length === 0) {
    return <p className="text-muted mb-0">Aún no has realizado pedidos. ¡Revisa el catálogo!</p>;
  }

  return pedidos.map((pedido) => (
    <div className="border rounded-3 p-3 mb-3 bg-white" key={pedido.id}>
      <div className="d-flex justify-content-between flex-wrap gap-2">
        <div>
          <strong>{pedido.productoNombre}</strong> <span className="text-muted">x{pedido.cantidad}</span>
          <div className="small text-muted">
            {pedido.fecha} · {pedido.tipoEntrega === "despacho" ? `Despacho a ${pedido.direccion}` : "Retiro en tienda"} · {pedido.formaPago === "cuenta_corriente" ? "Cuenta corriente" : "Pago normal"}
          </div>
        </div>
        <div className="text-end">
          <div className="fw-bold">{formatoPesos(pedido.total)}</div>
          <span className={`badge ${COLOR_ESTADO[pedido.estado] || "bg-secondary"}`}>{pedido.estado}</span>
        </div>
      </div>
      <div className="progress mt-3" style={{ height: 8 }} role="progressbar" aria-label="Seguimiento del pedido" aria-valuenow={PROGRESO_ESTADO[pedido.estado] || 0} aria-valuemin="0" aria-valuemax="100">
        <div className={`progress-bar ${COLOR_ESTADO[pedido.estado] || "bg-secondary"}`} style={{ width: `${PROGRESO_ESTADO[pedido.estado] || 0}%` }}></div>
      </div>
      <div className="d-flex justify-content-between small text-muted mt-1">
        <span>Pendiente</span><span>En preparación</span><span>Enviado</span><span>Entregado</span>
      </div>
    </div>
  ));
}
