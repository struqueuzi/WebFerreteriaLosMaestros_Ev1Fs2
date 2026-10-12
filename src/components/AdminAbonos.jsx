import { useAviso } from "../context/AvisoContext";
import { useAlmacen } from "../hooks/useAlmacen";
import { formatoPesos } from "../lib/formato";
import { obtenerAbonos, obtenerUsuarios, resolverAbono } from "../lib/usuarios";

const COLOR_ABONO = { "Pendiente": "bg-warning text-dark", "Aprobado": "bg-success", "Rechazado": "bg-danger" };

// Pestaña "Abonos": el cliente los envía desde su panel y aquí se aprueban o rechazan.
export default function AdminAbonos() {
  useAlmacen();
  const { mostrarAviso } = useAviso();
  const usuarios = obtenerUsuarios();
  // Pendientes primero; dentro de cada grupo, el más reciente arriba
  const abonos = [...obtenerAbonos()].reverse().sort((x, y) => (y.estado === "Pendiente") - (x.estado === "Pendiente"));

  const resolver = (id, aprobar) => {
    const res = resolverAbono(id, aprobar);
    mostrarAviso(res.mensaje, res.exito);
  };

  return (
    <div className="card shadow-sm border-0 p-4 rounded-3">
      <h2 className="fw-bold h4 mb-1">Abonos de clientes</h2>
      <p className="text-muted small mb-3">
        Cuando un cliente avisa que pagó, el abono queda <strong>pendiente</strong>. Al aprobarlo se descuenta de su saldo y se libera su cupo disponible.
      </p>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr><th>Fecha</th><th>Cliente</th><th>Monto</th><th>Detalle</th><th>Saldo actual</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {abonos.length === 0 ? (
              <tr><td colSpan="7" className="text-muted">Aún no hay abonos enviados por los clientes.</td></tr>
            ) : (
              abonos.map((a) => {
                const cliente = usuarios.find((u) => u.id === a.idUsuario);
                return (
                  <tr key={a.id}>
                    <td className="small">{a.fecha}</td>
                    <td>{a.nombre}<div className="small text-muted">{a.correo}</div></td>
                    <td className="fw-bold">{formatoPesos(a.monto)}</td>
                    <td className="small">{a.detalle || <span className="text-muted">—</span>}</td>
                    <td className="small">{cliente ? formatoPesos(cliente.saldoPendiente || 0) : "—"}</td>
                    <td><span className={`badge ${COLOR_ABONO[a.estado] || "bg-secondary"}`}>{a.estado}</span></td>
                    <td className="text-end text-nowrap">
                      {a.estado === "Pendiente" && (
                        <>
                          <button type="button" className="btn btn-sm btn-success btn-aprobar" onClick={() => resolver(a.id, true)}>Aprobar</button>{" "}
                          <button type="button" className="btn btn-sm btn-outline-danger btn-rechazar" onClick={() => resolver(a.id, false)}>Rechazar</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
