import { useState } from "react";
import DatosTransferencia from "./DatosTransferencia";
import { useAlmacen } from "../hooks/useAlmacen";
import { formatoPesos } from "../lib/formato";
import { ESTADOS_PEDIDO, nombreFormaPago, resumenVentas, ventasDelCliente } from "../lib/pedidos";
import { obtenerDatosTransferencia } from "../lib/transferencia";

const PROGRESO_ESTADO = { "Pendiente": 25, "En preparación": 50, "Enviado": 75, "Entregado": 100 };
const COLOR_ESTADO = { "Pendiente": "bg-secondary", "En preparación": "bg-info", "Enviado": "bg-primary", "Entregado": "bg-success" };
const COLOR_PAGO = { "Por confirmar": "bg-warning text-dark", "Confirmado": "bg-success", "Rechazado": "bg-danger" };

// Una compra del cliente (puede tener varios productos)
export function TarjetaCompra({ venta }) {
  const [verPago, setVerPago] = useState(false);
  const rechazada = venta.estadoPago === "Rechazado";
  const faltaTransferir = venta.estadoPago === "Por confirmar";

  return (
    <article className={`compra${rechazada ? " compra-rechazada" : ""}`}>
      <div className="d-flex justify-content-between flex-wrap gap-2">
        <div>
          <h3 className="compra-numero">Pedido N° {venta.numeroVenta}</h3>
          <div className="small text-muted">
            {venta.fecha} · {venta.tipoEntrega === "despacho" ? `Despacho a ${venta.direccion}` : "Retiro en tienda"}
          </div>
        </div>
        <div className="text-end">
          <div className="fw-bold fs-5">{formatoPesos(venta.total)}</div>
          <span className={`badge ${COLOR_ESTADO[venta.estado] || "bg-secondary"}`}>{venta.estado}</span>
        </div>
      </div>

      <ul className="compra-items">
        {venta.items.map((i) => (
          <li key={i.idPedido}>
            <span>{i.productoNombre} <span className="text-muted">x{i.cantidad}</span></span>
            <span>{formatoPesos(i.total)}</span>
          </li>
        ))}
      </ul>

      <div className="d-flex flex-wrap align-items-center gap-2 small">
        <span>Pago: <strong>{nombreFormaPago(venta.formaPago)}</strong></span>
        {venta.estadoPago && <span className={`badge ${COLOR_PAGO[venta.estadoPago]}`}>{venta.estadoPago === "Por confirmar" ? "Transferencia por confirmar" : `Pago ${venta.estadoPago.toLowerCase()}`}</span>}
        {faltaTransferir && (
          <button type="button" className="btn btn-link btn-sm p-0 link-amarillo" onClick={() => setVerPago(!verPago)} aria-expanded={verPago}>
            {verPago ? "Ocultar datos de transferencia" : "Ver datos para transferir"}
          </button>
        )}
      </div>

      {faltaTransferir && verPago && (
        <div className="mt-3">
          <DatosTransferencia datos={venta.datosTransferencia || obtenerDatosTransferencia()} monto={venta.total} referencia={venta.numeroVenta} />
        </div>
      )}

      {rechazada ? (
        <p className="small text-danger mt-3 mb-0">No pudimos confirmar tu transferencia, así que este pedido se anuló. Si ya pagaste, escríbenos con tu comprobante.</p>
      ) : (
        <>
          <div className="progress mt-3" style={{ height: 8 }} role="progressbar" aria-label="Seguimiento del pedido" aria-valuenow={PROGRESO_ESTADO[venta.estado] || 0} aria-valuemin="0" aria-valuemax="100">
            <div className={`progress-bar ${COLOR_ESTADO[venta.estado] || "bg-secondary"}`} style={{ width: `${PROGRESO_ESTADO[venta.estado] || 0}%` }}></div>
          </div>
          <div className="d-flex justify-content-between small text-muted mt-1">
            {ESTADOS_PEDIDO.map((e) => <span key={e}>{e}</span>)}
          </div>
        </>
      )}
    </article>
  );
}

// Resumen corto para el panel del cliente: números generales + las últimas compras.
// El historial completo con filtros está en la página "Mis compras" (/cliente/compras).
export default function HistorialCompras({ correo, cantidad = 2 }) {
  useAlmacen();
  const ventas = ventasDelCliente(correo);

  if (ventas.length === 0) {
    return <p className="text-muted mb-0">Aún no has realizado pedidos. ¡Revisa el catálogo!</p>;
  }

  const resumen = resumenVentas(ventas);
  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-6 col-md-4"><div className="dato-resumen"><span>Compras</span><strong data-testid="cantidad-compras">{resumen.cantidad}</strong></div></div>
        <div className="col-6 col-md-4"><div className="dato-resumen"><span>Total comprado</span><strong data-testid="total-comprado">{formatoPesos(resumen.total)}</strong></div></div>
        <div className="col-12 col-md-4"><div className="dato-resumen"><span>Transferencias por confirmar</span><strong>{resumen.porConfirmar}</strong></div></div>
      </div>
      <p className="small text-secondary mb-2">{ventas.length > cantidad ? `Tus últimas ${cantidad} compras:` : "Tus compras:"}</p>
      {ventas.slice(0, cantidad).map((v) => <TarjetaCompra key={v.numeroVenta} venta={v} />)}
    </>
  );
}
