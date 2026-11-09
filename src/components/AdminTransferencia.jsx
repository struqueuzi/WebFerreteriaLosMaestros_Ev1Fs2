import { useState } from "react";
import CampoFormulario from "./CampoFormulario";
import DatosTransferencia from "./DatosTransferencia";
import { useAviso } from "../context/AvisoContext";
import { useAlmacen } from "../hooks/useAlmacen";
import {
  BANCOS, guardarDatosTransferencia, obtenerDatosTransferencia, restablecerDatosTransferencia,
  TIPOS_DE_CUENTA, validarDatosTransferencia
} from "../lib/transferencia";

// Pestaña del administrador para cambiar la cuenta a la que transfieren los clientes.
// A la derecha se ve en vivo cómo le va a aparecer al cliente en el carrito.
export default function AdminTransferencia() {
  useAlmacen();
  const { mostrarAviso } = useAviso();
  const [datos, setDatos] = useState(obtenerDatosTransferencia);
  const [errores, setErrores] = useState({});

  const cambiar = (campo) => (e) => {
    const nuevos = { ...datos, [campo]: e.target.value };
    setDatos(nuevos);
    // si el campo ya tenía error, se vuelve a revisar mientras escribe
    if (errores[campo]) setErrores({ ...errores, [campo]: validarDatosTransferencia(nuevos)[campo] || "" });
  };

  const guardar = (e) => {
    e.preventDefault();
    const res = guardarDatosTransferencia(datos);
    setErrores(res.errores);
    mostrarAviso(res.mensaje, res.exito);
    if (res.exito) setDatos(obtenerDatosTransferencia());
  };

  const restablecer = () => {
    if (!window.confirm("¿Volver a los datos de ejemplo? Se pierden los datos actuales.")) return;
    restablecerDatosTransferencia();
    setDatos(obtenerDatosTransferencia());
    setErrores({});
    mostrarAviso("Se restablecieron los datos de ejemplo.", true);
  };

  const campo = (id) => ({ id: `t-${id}`, value: datos[id], onChange: cambiar(id), error: errores[id] || "" });

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-7">
        <div className="card p-4">
          <h2 className="titulo-seccion h4 mb-1">Cuenta para transferencias</h2>
          <p className="text-muted small">Estos datos se le muestran al cliente cuando elige pagar con transferencia. Los pedidos que ya se hicieron guardan la cuenta que se informó en ese momento.</p>

          <form onSubmit={guardar} noValidate>
            <div className="row g-2">
              <div className="col-12 col-md-6 mb-3">
                <label htmlFor="t-banco" className="form-label fw-bold">Banco</label>
                <input id="t-banco" list="lista-bancos" className={`form-control${errores.banco ? " is-invalid" : ""}`} value={datos.banco} onChange={cambiar("banco")} />
                <datalist id="lista-bancos">{BANCOS.map((b) => <option key={b} value={b} />)}</datalist>
                {errores.banco && <div className="invalid-feedback">{errores.banco}</div>}
              </div>
              <div className="col-12 col-md-6 mb-3">
                <label htmlFor="t-tipoCuenta" className="form-label fw-bold">Tipo de cuenta</label>
                <select id="t-tipoCuenta" className={`form-select${errores.tipoCuenta ? " is-invalid" : ""}`} value={datos.tipoCuenta} onChange={cambiar("tipoCuenta")}>
                  {TIPOS_DE_CUENTA.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errores.tipoCuenta && <div className="invalid-feedback">{errores.tipoCuenta}</div>}
              </div>
              <div className="col-12 col-md-6">
                <CampoFormulario label="N° de cuenta" inputMode="numeric" {...campo("numeroCuenta")} />
              </div>
              <div className="col-12 col-md-6">
                <CampoFormulario label="RUT del titular" placeholder="76418293-6" {...campo("rut")} />
              </div>
              <div className="col-12 col-md-6">
                <CampoFormulario label="Titular" {...campo("titular")} />
              </div>
              <div className="col-12 col-md-6">
                <CampoFormulario label="Correo para comprobantes" type="email" {...campo("correo")} />
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button type="submit" className="btn btn-pill" id="btn-guardar-transferencia">Guardar datos</button>
              <button type="button" className="btn btn-contorno-oscuro" onClick={restablecer}>Restablecer datos de ejemplo</button>
            </div>
          </form>
        </div>
      </div>

      <div className="col-12 col-lg-5">
        <p className="small fw-bold mb-2">Así lo ve el cliente</p>
        <DatosTransferencia datos={datos} monto={25990} titulo="Datos para la transferencia (vista previa)" />
      </div>
    </div>
  );
}
