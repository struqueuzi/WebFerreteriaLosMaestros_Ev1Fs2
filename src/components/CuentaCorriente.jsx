import { useState } from "react";
import CampoFormulario from "./CampoFormulario";
import ModalBase from "./ModalBase";
import { useAviso } from "../context/AvisoContext";
import { useAlmacen } from "../hooks/useAlmacen";
import { useFormulario } from "../hooks/useFormulario";
import { formatoPesos } from "../lib/formato";
import { cupoDisponible, obtenerAbonos, solicitarAbono, totalAbonosPendientes } from "../lib/usuarios";
import { mensajeErrorMontoEntero } from "../lib/validaciones";

const COLOR_ABONO = { "Pendiente": "bg-warning text-dark", "Aprobado": "bg-success", "Rechazado": "bg-danger" };

// Tarjeta de cuenta corriente del cliente: saldo, cupo, barra de uso, movimientos y botón para abonar.
// El abono queda "Pendiente" hasta que el administrador lo aprueba. Prop: usuario (con cuenta corriente).
export default function CuentaCorriente({ usuario }) {
  useAlmacen();
  const { mostrarAviso } = useAviso();
  const [modalAbierto, setModalAbierto] = useState(false);

  const cupo = usuario.cupoCuentaCorriente || 0;
  const saldo = usuario.saldoPendiente || 0;
  const usado = cupo > 0 ? Math.min(100, Math.round((saldo / cupo) * 100)) : 0;
  const maximoAbono = saldo - totalAbonosPendientes(usuario.id);
  const movimientos = [...(usuario.movimientosCC || [])].reverse().slice(0, 8);
  const misAbonos = obtenerAbonos().filter((a) => a.idUsuario === usuario.id).reverse().slice(0, 4);

  const reglas = {
    monto: (v) =>
      mensajeErrorMontoEntero(v.monto) ||
      (Number(v.monto) > maximoAbono ? `El abono no puede superar ${formatoPesos(maximoAbono)} (tu saldo menos abonos pendientes).` : "")
  };
  const form = useFormulario({ monto: "", detalle: "" }, reglas);

  const abrir = () => {
    if (saldo <= 0) {
      mostrarAviso("No tienes saldo pendiente: no hay nada que abonar.", false);
      return;
    }
    if (maximoAbono <= 0) {
      mostrarAviso("Tus abonos pendientes ya cubren todo tu saldo. Espera la confirmación del administrador.", false);
      return;
    }
    form.reiniciar();
    setModalAbierto(true);
  };

  const enviar = (e) => {
    e.preventDefault();
    if (!form.validarTodo()) return;
    const res = solicitarAbono(usuario.id, form.valores.monto, form.valores.detalle);
    mostrarAviso(res.mensaje, res.exito);
    if (res.exito) setModalAbierto(false);
  };

  return (
    <div className="card shadow-sm border-0 p-4 rounded-3 h-100 border-start border-warning border-4">
      <div className="small text-muted mb-2">💳 Cuenta corriente</div>
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-2">
        <div>
          <div className="small text-muted">Saldo pendiente de pago</div>
          <div className="fs-3 fw-bold" data-testid="saldo-pendiente">{formatoPesos(saldo)}</div>
        </div>
        <div className="text-end">
          <div className="small text-muted">Cupo disponible</div>
          <div className="fs-5 fw-bold text-success" data-testid="cupo-disponible">{formatoPesos(cupoDisponible(usuario))}</div>
        </div>
      </div>
      <div className="progress mt-3" style={{ height: 8 }} role="progressbar" aria-label="Cupo utilizado" aria-valuenow={usado} aria-valuemin="0" aria-valuemax="100">
        <div className={`progress-bar ${usado >= 90 ? "bg-danger" : "bg-warning"}`} style={{ width: `${usado}%` }}></div>
      </div>
      <div className="small text-muted mt-1">Cupo asignado: {formatoPesos(cupo)} · usado: {usado}%</div>

      <button type="button" className="btn btn-success btn-sm fw-bold mt-3 w-100" id="btn-abonar" onClick={abrir}>💵 Abonar a mi cuenta</button>

      {misAbonos.length > 0 && (
        <div className="small mt-2">
          <div className="fw-bold mb-1">Mis abonos enviados</div>
          {misAbonos.map((a) => (
            <div key={a.id} className="d-flex justify-content-between align-items-center border-bottom py-1 gap-2">
              <span>{a.fecha}</span>
              <span><strong>{formatoPesos(a.monto)}</strong> <span className={`badge ${COLOR_ABONO[a.estado] || "bg-secondary"}`}>{a.estado}</span></span>
            </div>
          ))}
        </div>
      )}

      <details className="mt-3">
        <summary className="small fw-bold">Ver movimientos de mi cuenta</summary>
        <div className="small mt-2">
          {movimientos.length === 0 ? (
            <span className="text-muted">Sin movimientos todavía.</span>
          ) : (
            movimientos.map((m, i) => (
              <div key={i} className="d-flex justify-content-between border-bottom py-1 gap-2">
                <span>{m.fecha} · {m.detalle}</span>
                <strong className={m.monto < 0 ? "text-success" : "text-danger"}>{m.monto < 0 ? "−" : "+"}{formatoPesos(Math.abs(m.monto))}</strong>
              </div>
            ))
          )}
        </div>
      </details>

      <ModalBase
        abierto={modalAbierto}
        titulo="Abonar a mi cuenta corriente"
        idTitulo="titulo-modal-abono"
        onCerrar={() => setModalAbierto(false)}
        onSubmit={enviar}
        pie={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button type="submit" className="btn btn-warning fw-bold">Enviar abono</button>
          </>
        }
      >
        <p className="mb-2">Saldo pendiente: <strong>{formatoPesos(saldo)}</strong> de un cupo de {formatoPesos(cupo)}</p>
        <p className="small text-muted mb-3">El administrador confirmará tu abono. Recién ahí se descuenta de tu saldo y se libera tu cupo.</p>
        <CampoFormulario label="Monto a abonar ($)" type="number" min="1" placeholder="Ej: 5000" {...form.propsCampo("monto")} id="a-monto" />
        <CampoFormulario label="Detalle (opcional)" placeholder="Ej: Pago en efectivo en tienda" autoComplete="off" value={form.valores.detalle} onChange={(e) => form.cambiar("detalle", e.target.value)} id="a-detalle" className="mb-1" />
      </ModalBase>
    </div>
  );
}
