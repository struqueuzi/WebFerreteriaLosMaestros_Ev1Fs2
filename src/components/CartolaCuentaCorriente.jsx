import { useState } from "react";
import { formatoPesos } from "../lib/formato";
import { cartolaCuentaCorriente, MEDIOS_DE_PAGO, nombreMedio, resumenCuentaCorriente } from "../lib/usuarios";

const ICONO_MEDIO = { efectivo: "💵", debito: "💳", credito: "💳", transferencia: "🏦", sin_dato: "•" };
const NOMBRE_TIPO = { compra: "Compra", abono: "Abono", ajuste: "Ajuste", anterior: "Saldo anterior" };

export function EtiquetaMedio({ medio }) {
  if (!medio) return <span className="text-secondary">Cuenta corriente</span>;
  if (medio === "sin_dato") return <span className="text-secondary">Sin registrar</span>;
  return <span className={`etiqueta-medio medio-${medio}`}><span aria-hidden="true">{ICONO_MEDIO[medio]}</span> {nombreMedio(medio)}</span>;
}

// Estado de cuenta (cartola) de una cuenta corriente: resumen por medio de pago + tabla con
// cargos, abonos y el saldo después de cada movimiento.
// Props: usuario (con cuenta corriente) y parte ("todo", "resumen" o "tabla") para repartirla en la página
export default function CartolaCuentaCorriente({ usuario, parte = "todo" }) {
  const [tipo, setTipo] = useState("todos"); // todos | cargos | abonos
  const [medio, setMedio] = useState("");

  const lineas = cartolaCuentaCorriente(usuario);
  const resumen = resumenCuentaCorriente(usuario);
  const visibles = lineas
    .filter((l) => (tipo === "cargos" ? l.cargo > 0 : tipo === "abonos" ? l.abono > 0 : true))
    .filter((l) => (medio ? l.medio === medio : true))
    .reverse(); // el más reciente arriba

  const maxMedio = Math.max(1, ...Object.values(resumen.porMedio));

  const verResumen = parte !== "tabla";
  const verTabla = parte !== "resumen";

  return (
    <>
      {verResumen && (<>
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><div className="dato-resumen"><span>Saldo por pagar</span><strong data-testid="cartola-saldo">{formatoPesos(usuario.saldoPendiente || 0)}</strong></div></div>
        <div className="col-6 col-lg-3"><div className="dato-resumen"><span>Cupo asignado</span><strong>{formatoPesos(usuario.cupoCuentaCorriente || 0)}</strong></div></div>
        <div className="col-6 col-lg-3"><div className="dato-resumen"><span>Total cargado (+)</span><strong className="text-danger" data-testid="cartola-cargos">{formatoPesos(resumen.totalCargos)}</strong></div></div>
        <div className="col-6 col-lg-3"><div className="dato-resumen"><span>Total abonado (−)</span><strong className="text-success" data-testid="cartola-abonos">{formatoPesos(resumen.totalAbonos)}</strong></div></div>
      </div>

      <div className={`card p-3 p-md-4 ${parte === "resumen" ? "" : "mb-4"}`}>
        <h3 className="h6 fw-bold mb-3">Abonos según medio de pago</h3>
        <div className="row g-3">
          {Object.keys(MEDIOS_DE_PAGO).map((m) => (
            <div className="col-12 col-sm-6 col-xxl-3" key={m}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-1 small mb-1">
                <EtiquetaMedio medio={m} />
                <strong data-testid={`cartola-medio-${m}`}>{formatoPesos(resumen.porMedio[m] || 0)}</strong>
              </div>
              <div className="progress" style={{ height: 6 }} role="progressbar" aria-label={`Abonado con ${nombreMedio(m)}`} aria-valuenow={resumen.porMedio[m] || 0} aria-valuemin="0" aria-valuemax={maxMedio}>
                <div className="progress-bar bg-warning" style={{ width: `${Math.round(((resumen.porMedio[m] || 0) / maxMedio) * 100)}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      </>)}

      {verTabla && (<>
      <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
        <div className="d-flex gap-2 flex-wrap" role="group" aria-label="Tipo de movimiento">
          {[["todos", "Todos"], ["cargos", "Cargos"], ["abonos", "Abonos"]].map(([id, texto]) => (
            <button key={id} type="button" className={`chip${tipo === id ? " activo" : ""}`} aria-pressed={tipo === id} onClick={() => setTipo(id)}>{texto}</button>
          ))}
        </div>
        <div className="ms-md-auto">
          <label htmlFor="cartola-medio" className="form-label small fw-bold mb-1">Medio de pago</label>
          <select id="cartola-medio" className="form-select form-select-sm" value={medio} onChange={(e) => setMedio(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(MEDIOS_DE_PAGO).map(([id, texto]) => <option key={id} value={id}>{texto}</option>)}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table align-middle mb-0 tabla-cartola">
          <thead>
            <tr>
              <th>Fecha</th><th>Movimiento</th><th>Medio</th>
              <th className="text-end">Cargo (+)</th><th className="text-end">Abono (−)</th><th className="text-end">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 ? (
              <tr><td colSpan="6" className="text-center text-secondary py-4">No hay movimientos con ese filtro.</td></tr>
            ) : (
              visibles.map((l, i) => (
                <tr key={l.id ?? `a${i}`} className={`fila-${l.tipo}`}>
                  <td className="small text-nowrap">{l.fecha || "—"}</td>
                  <td><span className="fw-bold">{NOMBRE_TIPO[l.tipo] || l.tipo}</span><div className="small text-secondary">{l.detalle}</div></td>
                  <td className="small"><EtiquetaMedio medio={l.medio} /></td>
                  <td className="text-end text-danger">{l.cargo ? formatoPesos(l.cargo) : ""}</td>
                  <td className="text-end text-success">{l.abono ? formatoPesos(l.abono) : ""}</td>
                  <td className="text-end fw-bold">{formatoPesos(l.saldo)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="small text-secondary mt-2 mb-0">
        Los <strong>cargos</strong> son compras pagadas con la cuenta corriente (suben la deuda) y los <strong>abonos</strong> son pagos
        en efectivo, débito, crédito o transferencia (la bajan). La columna Saldo muestra cuánto se debía después de cada movimiento.
      </p>
      </>)}
    </>
  );
}
