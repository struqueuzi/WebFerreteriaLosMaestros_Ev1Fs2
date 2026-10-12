import { useAlmacen } from "../hooks/useAlmacen";
import { formatoPesos } from "../lib/formato";
import { ESTADOS_PEDIDO, generarReportes } from "../lib/pedidos";
import { UMBRAL_STOCK_BAJO } from "../lib/productos";

function TarjetaKpi({ titulo, valor, icono, clase = "" }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="card shadow-sm border-0 h-100 p-3">
        <div className="small text-muted">{icono} {titulo}</div>
        <div className={`fs-4 fw-bold ${clase}`}>{valor}</div>
      </div>
    </div>
  );
}

// Pestaña "Reportes" del administrador: indicadores y tablas calculadas con los datos actuales.
export default function AdminReportes() {
  useAlmacen();
  const r = generarReportes();
  const total = r.totalPedidos || 1;

  return (
    <>
      <div className="row g-3 mb-4">
        <TarjetaKpi titulo="Ventas totales" valor={formatoPesos(r.ventasTotales)} icono="💰" clase="text-success" />
        <TarjetaKpi titulo="Pedidos realizados" valor={r.totalPedidos} icono="📦" />
        <TarjetaKpi titulo="Pedidos pendientes" valor={r.pedidosPorEstado["Pendiente"] || 0} icono="⏳" clase="text-warning" />
        <TarjetaKpi titulo="Saldo en cuentas corrientes" valor={formatoPesos(r.saldoCuentasCorrientes)} icono="💳" />
        <TarjetaKpi titulo="Usuarios activos" valor={`${r.usuariosActivos} / ${r.usuariosTotal}`} icono="👥" />
        <TarjetaKpi titulo="Productos" valor={r.totalProductos} icono="🧱" />
        <TarjetaKpi titulo="Unidades en inventario" valor={r.unidadesInventario} icono="🏬" />
        <TarjetaKpi titulo="Valor del inventario" valor={formatoPesos(r.valorInventario)} icono="🏷️" />
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-0 p-3 h-100">
            <h5 className="fw-bold">Pedidos por estado</h5>
            {ESTADOS_PEDIDO.map((estado) => {
              const cantidad = r.pedidosPorEstado[estado] || 0;
              return (
                <div className="mb-2" key={estado}>
                  <div className="d-flex justify-content-between small"><span>{estado}</span><strong>{cantidad}</strong></div>
                  <div className="progress" style={{ height: 8 }}><div className="progress-bar bg-warning" style={{ width: `${(cantidad / total) * 100}%` }}></div></div>
                </div>
              );
            })}
            <hr className="my-3" />
            <h6 className="fw-bold">Usuarios por rol</h6>
            <div className="small">
              Administradores: <strong>{r.usuariosPorRol.admin}</strong> · Vendedores: <strong>{r.usuariosPorRol.vendedor}</strong> · Clientes: <strong>{r.usuariosPorRol.cliente}</strong>
            </div>
            <div className="small mt-1">
              Clientes con cuenta corriente: <strong>{r.clientesConCuentaCorriente}</strong> · Cupo otorgado: <strong>{formatoPesos(r.cupoTotalOtorgado)}</strong>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-0 p-3 h-100">
            <h5 className="fw-bold">Productos más vendidos</h5>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead><tr><th>Producto</th><th>Unid.</th><th>Ingresos</th></tr></thead>
                <tbody>
                  {r.masVendidos.length === 0 ? (
                    <tr><td colSpan="3" className="text-muted">Aún no hay ventas.</td></tr>
                  ) : (
                    r.masVendidos.map((v) => <tr key={v.nombre}><td>{v.nombre}</td><td>{v.unidades}</td><td>{formatoPesos(v.ingresos)}</td></tr>)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-0 p-3 h-100">
            <h5 className="fw-bold">Stock bajo (≤ {UMBRAL_STOCK_BAJO} unidades)</h5>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead><tr><th>Producto</th><th>Stock</th></tr></thead>
                <tbody>
                  {r.stockBajo.length === 0 ? (
                    <tr><td colSpan="2" className="text-muted">Todo el inventario está sobre el mínimo.</td></tr>
                  ) : (
                    r.stockBajo.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nombre}</td>
                        <td><span className={`badge ${p.stock === 0 ? "bg-danger" : "bg-warning text-dark"}`}>{p.stock} u.</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
