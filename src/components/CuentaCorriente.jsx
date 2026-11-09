import { useState } from "react";
import { Link } from "react-router-dom";
import { EtiquetaMedio } from "./CartolaCuentaCorriente";
import CampoFormulario from "./CampoFormulario";
import ModalBase from "./ModalBase";
import { useAviso } from "../context/AvisoContext";
import { useAlmacen } from "../hooks/useAlmacen";
import { useFormulario } from "../hooks/useFormulario";
import { formatoPesos } from "../lib/formato";
import { cartolaCuentaCorriente, cupoDisponible, MEDIOS_DE_PAGO, obtenerAbonos, solicitarAbono, totalAbonosPendientes } from "../lib/usuarios";
import { mensajeErrorMontoEntero } from "../lib/validaciones";

const COLOR_ABONO = { "Pendiente": "bg-warning text-dark", "Aprobado": "bg-success", "Rechazado": "bg-danger" };

// Tarjeta de cuenta corriente del cliente: saldo, cupo, barra de uso, movimientos y botón para abonar.
// El abono queda "Pendiente" hasta que el administrador lo aprueba.
// Props: usuario (con cuenta corriente), conEnlace (muestra el enlace al estado de cuenta completo)
export default function CuentaCorriente({ usuario, conEnlace = true }) {
  useAlmacen();
  const { mostrarAviso } = useAviso();
  const [modalAbierto, setModalAbierto] = useState(false);

  const cupo = usuario.cupoCuentaCorriente || 0;
  const saldo = usuario.saldoPendiente || 0;
  const usado = cupo > 0 ? Math.min(100, Math.round((saldo / cupo) * 100)) : 0;
  const maximoAbono = saldo - totalAbonosPendientes(usuario.id);
  const movimientos = cartolaCuentaCorriente(usuario).filter((l) => l.tipo !== "anterior").reverse().slice(0, 4);
  const misAbonos = obtenerAbonos().filter((a) => a.idUsuario === usuario.id).reverse().slice(0, 4);

  const reglas = {
    monto: (v) =>
      mensajeErrorMontoEntero(v.monto) ||
      (Number(v.monto) > maximoAbono ? `El abono no puede superar ${formatoPesos(maximoAbono)} (tu saldo menos abonos pendientes).` : "")
  };
  const form = useFormulario({ monto: "", detalle: "", medio: "efectivo" }, reglas);

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
    const res = solicitarAbono(usuario.id, form.valores.monto, form.valores.detalle, form.valores.medio);
    mostrarAviso(res.mensaje, res.exito);
    if (res.exito) setModalAbierto(false);
  };

  return (
    <div className="card p-4 h-100 tarjeta-cuenta-corriente">
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
              <span>{a.fecha}<div><EtiquetaMedio medio={a.medio || "sin_dato"} /></div></span>
              <span className="text-nowrap"><strong>{formatoPesos(a.monto)}</strong> <span className={`badge ${COLOR_ABONO[a.estado] || "bg-secondary"}`}>{a.estado}</span></span>
            </div>
          ))}
        </div>
      )}

      {conEnlace && (
      <div className="mt-3 small">
        <div className="fw-bold mb-1">Últimos movimientos</div>
        {movimientos.length === 0 ? (
          <span className="text-muted">Sin movimientos todavía.</span>
        ) : (
          movimientos.map((m) => (
            <div key={m.id} className="d-flex justify-content-between align-items-center border-bottom py-1 gap-2">
              <span>{m.detalle}<div><EtiquetaMedio medio={m.medio} /></div></span>
              <strong className={m.abono ? "text-success" : "text-danger"}>{m.abono ? "−" : "+"}{formatoPesos(m.abono || m.cargo)}</strong>
            </div>
          ))
        )}
        <Link to="/cliente/cuenta" className="link-neon mt-2" id="ver-estado-cuenta">Ver estado de cuenta completo →</Link>
      </div>
      )}

      <ModalBase
        abierto={modalAbierto}
        titulo="Abonar a mi cuenta corriente"
        idTitulo="titulo-modal-abono"
        onCerrar={() => setModalAbierto(false)}
        onSubmit={enviar}
        pie={
          <>
            <button type="button" className="btn btn-contorno" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button type="submit" className="btn btn-warning fw-bold">Enviar abono</button>
          </>
        }
      >
        <p className="mb-2">Saldo pendiente: <strong>{formatoPesos(saldo)}</strong> de un cupo de {formatoPesos(cupo)}</p>
        <p className="small text-muted mb-3">El administrador confirmará tu abono. Recién ahí se descuenta de tu saldo y se libera tu cupo.</p>
        <div className="mb-3">
          <label htmlFor="a-medio" className="form-label fw-bold">¿Con qué pagaste?</label>
          <select id="a-medio" className="form-select" value={form.valores.medio} onChange={(e) => form.cambiar("medio", e.target.value)}>
            {Object.entries(MEDIOS_DE_PAGO).map(([id, texto]) => <option key={id} value={id}>{texto}</option>)}
          </select>
        </div>
        <CampoFormulario label="Monto a abonar ($)" type="number" min="1" placeholder="Ej: 5000" {...form.propsCampo("monto")} id="a-monto" />
        <CampoFormulario label="Detalle (opcional)" placeholder="Ej: Pagado en caja de la tienda" autoComplete="off" value={form.valores.detalle} onChange={(e) => form.cambiar("detalle", e.target.value)} id="a-detalle" className="mb-1" />
      </ModalBase>
    </div>
  );
}
