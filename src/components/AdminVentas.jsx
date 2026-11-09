import { Fragment, useState } from "react";
import { useAviso } from "../context/AvisoContext";
import { useAlmacen } from "../hooks/useAlmacen";
import { formatoPesos } from "../lib/formato";
import {
  agruparVentas, ESTADOS_PEDIDO, filtrarVentas, FORMAS_DE_PAGO, nombreFormaPago,
  resolverPagoTransferencia, resumenVentas, ventasACsv
} from "../lib/pedidos";
import { obtenerUsuarios } from "../lib/usuarios";
import { normalizarCorreo } from "../lib/validaciones";

const FILTROS_VACIOS = { texto: "", formaPago: "", estado: "", desde: "", hasta: "" };
const COLOR_PAGO = { "Por confirmar": "bg-warning text-dark", "Confirmado": "bg-success", "Rechazado": "bg-danger" };

function descargarCsv(ventas) {
  // El \uFEFF al inicio es para que Excel lea bien las tildes
  const blob = new Blob(["\uFEFF" + ventasACsv(ventas)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `historial-ventas-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Pestaña "Historial de ventas" del administrador: todas las compras, con filtros,
// resumen, detalle de cada venta y confirmación de las transferencias.
export default function AdminVentas() {
  useAlmacen();
  const { mostrarAviso } = useAviso();
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [abierta, setAbierta] = useState(null); // venta con el detalle desplegado

  const nombres = {};
  obtenerUsuarios().forEach((u) => { nombres[normalizarCorreo(u.correo)] = u.nombre; });

  const todas = agruparVentas();
  const ventas = filtrarVentas(todas, filtros);
  const r = resumenVentas(ventas);
  const hayFiltros = Object.values(filtros).some(Boolean);

  const cambiar = (campo) => (e) => setFiltros({ ...filtros, [campo]: e.target.value });

  const resolver = (numeroVenta, aprobar) => {
    if (!aprobar && !window.confirm(`¿Rechazar el pago de la venta N° ${numeroVenta}? El stock vuelve al inventario.`)) return;
    const res = resolverPagoTransferencia(numeroVenta, aprobar);
    mostrarAviso(res.mensaje, res.exito);
  };

  return (
    <div className="card p-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h2 className="titulo-seccion h4 mb-0">Historial de ventas</h2>
        <button type="button" className="btn btn-contorno-oscuro btn-sm" disabled={ventas.length === 0} onClick={() => descargarCsv(ventas)}>
          Descargar CSV
        </button>
      </div>

      <div className="row g-2 mb-3 filtros-ventas">
        <div className="col-12 col-md-4">
          <label htmlFor="v-texto" className="form-label small fw-bold mb-1">Buscar</label>
          <input id="v-texto" type="search" className="form-control form-control-sm" placeholder="N° venta, correo o producto" value={filtros.texto} onChange={cambiar("texto")} />
        </div>
        <div className="col-6 col-md-2">
          <label htmlFor="v-pago" className="form-label small fw-bold mb-1">Pago</label>
          <select id="v-pago" className="form-select form-select-sm" value={filtros.formaPago} onChange={cambiar("formaPago")}>
            <option value="">Todos</option>
            {Object.entries(FORMAS_DE_PAGO).map(([id, texto]) => <option key={id} value={id}>{texto}</option>)}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <label htmlFor="v-estado" className="form-label small fw-bold mb-1">Estado</label>
          <select id="v-estado" className="form-select form-select-sm" value={filtros.estado} onChange={cambiar("estado")}>
            <option value="">Todos</option>
            {ESTADOS_PEDIDO.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <label htmlFor="v-desde" className="form-label small fw-bold mb-1">Desde</label>
          <input id="v-desde" type="date" className="form-control form-control-sm" value={filtros.desde} onChange={cambiar("desde")} />
        </div>
        <div className="col-6 col-md-2">
          <label htmlFor="v-hasta" className="form-label small fw-bold mb-1">Hasta</label>
          <input id="v-hasta" type="date" className="form-control form-control-sm" value={filtros.hasta} onChange={cambiar("hasta")} />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6 col-lg-3"><div className="dato-resumen"><span>Ventas</span><strong data-testid="ventas-cantidad">{r.cantidad}</strong></div></div>
        <div className="col-6 col-lg-3"><div className="dato-resumen"><span>Total vendido</span><strong data-testid="ventas-total">{formatoPesos(r.total)}</strong></div></div>
        <div className="col-6 col-lg-3"><div className="dato-resumen"><span>Venta promedio</span><strong>{formatoPesos(r.promedio)}</strong></div></div>
        <div className="col-6 col-lg-3"><div className="dato-resumen"><span>Transferencias por confirmar</span><strong>{r.porConfirmar}</strong></div></div>
      </div>

      {hayFiltros && (
        <p className="small text-muted">
          Mostrando {ventas.length} de {todas.length} ventas.{" "}
          <button type="button" className="btn btn-link btn-sm p-0 align-baseline link-amarillo" onClick={() => setFiltros(FILTROS_VACIOS)}>Quitar filtros</button>
        </p>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 tabla-ventas">
          <thead>
            <tr>
              <th>N°</th><th>Fecha</th><th>Cliente</th><th>Productos</th><th>Pago</th><th>Estado</th><th className="text-end">Total</th><th></th>
            </tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr><td colSpan="8" className="text-muted text-center py-4">{todas.length === 0 ? "Todavía no hay ventas registradas." : "Ninguna venta coincide con los filtros."}</td></tr>
            ) : (
              ventas.map((v) => {
                const nombre = nombres[normalizarCorreo(v.clienteCorreo)];
                const estaAbierta = abierta === v.numeroVenta;
                return (
                  <Fragment key={v.numeroVenta}>
                    <tr className={v.estadoPago === "Rechazado" ? "fila-anulada" : ""}>
                      <td className="fw-bold">{v.numeroVenta}</td>
                      <td className="small">{v.fecha}</td>
                      <td>{nombre || "Cliente"}<div className="small text-muted">{v.clienteCorreo}</div></td>
                      <td className="small">{v.items.length} {v.items.length === 1 ? "producto" : "productos"} · {v.unidades} u.</td>
                      <td className="small">
                        {nombreFormaPago(v.formaPago)}
                        {v.estadoPago && <div><span className={`badge ${COLOR_PAGO[v.estadoPago]}`}>{v.estadoPago}</span></div>}
                      </td>
                      <td><span className="badge bg-secondary">{v.estado}</span></td>
                      <td className="text-end fw-bold">{formatoPesos(v.total)}</td>
                      <td className="text-end text-nowrap">
                        {v.estadoPago === "Por confirmar" && (
                          <>
                            <button type="button" className="btn btn-sm btn-success btn-confirmar-pago me-1" onClick={() => resolver(v.numeroVenta, true)}>Confirmar pago</button>
                            <button type="button" className="btn btn-sm btn-outline-danger btn-rechazar-pago me-1" onClick={() => resolver(v.numeroVenta, false)}>Rechazar</button>
                          </>
                        )}
                        <button type="button" className="btn btn-sm btn-contorno-oscuro btn-detalle" aria-expanded={estaAbierta} onClick={() => setAbierta(estaAbierta ? null : v.numeroVenta)}>
                          {estaAbierta ? "Cerrar" : "Detalle"}
                        </button>
                      </td>
                    </tr>
                    {estaAbierta && (
                      <tr className="fila-detalle">
                        <td colSpan="8">
                          <div className="row g-3">
                            <div className="col-12 col-md-7">
                              <table className="table table-sm mb-0">
                                <thead><tr><th>Producto</th><th>Cant.</th><th>Estado</th><th className="text-end">Subtotal</th></tr></thead>
                                <tbody>
                                  {v.items.map((i) => (
                                    <tr key={i.idPedido}><td>{i.productoNombre}</td><td>{i.cantidad}</td><td>{i.estado}</td><td className="text-end">{formatoPesos(i.total)}</td></tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="col-12 col-md-5 small">
                              <div><strong>Entrega:</strong> {v.tipoEntrega === "despacho" ? `Despacho a ${v.direccion}` : "Retiro en tienda"}</div>
                              {v.datosTransferencia && (
                                <div className="mt-2">
                                  <strong>Cuenta informada al cliente:</strong> {v.datosTransferencia.banco}, {v.datosTransferencia.tipoCuenta} N° {v.datosTransferencia.numeroCuenta}
                                </div>
                              )}
                              <div className="mt-2 text-muted">El estado de cada producto se cambia en la pestaña Pedidos.</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
