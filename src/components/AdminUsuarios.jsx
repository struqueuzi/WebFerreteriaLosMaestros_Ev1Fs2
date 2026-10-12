import { useState } from "react";
import CampoFormulario from "./CampoFormulario";
import ModalBase from "./ModalBase";
import { useAviso } from "../context/AvisoContext";
import { useAlmacen } from "../hooks/useAlmacen";
import { useFormulario } from "../hooks/useFormulario";
import { useSesion } from "../hooks/useSesion";
import { formatoPesos } from "../lib/formato";
import {
  actualizarUsuario, cambiarEstadoUsuario, CUPO_CUENTA_CORRIENTE_POR_DEFECTO,
  mensajeDuplicado, obtenerUsuarios, registrarUsuario
} from "../lib/usuarios";
import { mensajeErrorClave, mensajeErrorCorreo, mensajeErrorNombre, mensajeErrorRut, mensajeErrorTelefono } from "../lib/validaciones";

const NOMBRE_ROL = { admin: "Administrador", vendedor: "Vendedor", cliente: "Cliente" };

const VALORES_NUEVO = {
  nombre: "", rut: "", correo: "", telefono: "", clave: "", rol: "cliente",
  activo: true, cuentaCorriente: false, cupo: String(CUPO_CUENTA_CORRIENTE_POR_DEFECTO), saldo: "0"
};

function valoresDe(u) {
  return {
    nombre: u.nombre, rut: u.rut, correo: u.correo, telefono: u.telefono, clave: "", rol: u.rol,
    activo: u.activo !== false, cuentaCorriente: !!u.cuentaCorriente,
    cupo: String(u.cupoCuentaCorriente || CUPO_CUENTA_CORRIENTE_POR_DEFECTO), saldo: String(u.saldoPendiente || 0)
  };
}

// Pestaña "Usuarios": tabla + ventana para crear / editar (roles, estado, cuenta corriente y cupo).
export default function AdminUsuarios() {
  useAlmacen();
  const { usuario: yo } = useSesion();
  const { mostrarAviso } = useAviso();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = creando uno nuevo
  const [errorGeneral, setErrorGeneral] = useState("");

  const reglas = {
    nombre: (v) => mensajeErrorNombre(v.nombre),
    rut: (v) => mensajeErrorRut(v.rut) || mensajeDuplicado("rut", v.rut, editandoId),
    correo: (v) => mensajeErrorCorreo(v.correo) || mensajeDuplicado("correo", v.correo, editandoId),
    telefono: (v) => mensajeErrorTelefono(v.telefono) || mensajeDuplicado("telefono", v.telefono, editandoId),
    // La contraseña es obligatoria solo al CREAR; al editar, vacío = no cambiarla
    clave: (v) => (editandoId !== null && !v.clave ? "" : mensajeErrorClave(v.clave))
  };
  const form = useFormulario(VALORES_NUEVO, reglas);
  const { valores, errores } = form;
  const editandoMiCuenta = editandoId !== null && yo && editandoId === yo.id;

  const abrir = (id) => {
    const u = id !== null ? obtenerUsuarios().find((x) => x.id === id) : null;
    setEditandoId(id);
    setErrorGeneral("");
    form.reiniciar(u ? valoresDe(u) : VALORES_NUEVO);
    setModalAbierto(true);
  };

  const alternarCuentaCorriente = (e) => {
    const conCuenta = e.target.checked;
    form.cambiarVarios({
      cuentaCorriente: conCuenta,
      saldo: conCuenta ? valores.saldo : "0",
      cupo: conCuenta && !Number(valores.cupo) ? String(CUPO_CUENTA_CORRIENTE_POR_DEFECTO) : valores.cupo
    });
  };

  const guardar = (e) => {
    e.preventDefault();
    setErrorGeneral("");
    if (!form.validarTodo()) return;

    const datos = {
      nombre: valores.nombre, rut: valores.rut, correo: valores.correo, telefono: valores.telefono,
      clave: valores.clave, rol: valores.rol, activo: valores.activo, cuentaCorriente: valores.cuentaCorriente,
      saldoPendiente: valores.saldo, cupoCuentaCorriente: valores.cupo
    };

    let res;
    if (editandoId !== null) {
      res = actualizarUsuario(editandoId, datos);
    } else {
      res = registrarUsuario(datos.nombre, datos.rut, datos.correo, datos.telefono, datos.clave, datos.rol);
      if (res.exito) {
        // Datos extra que el registro normal no pide (estado y cuenta corriente)
        res = actualizarUsuario(res.usuario.id, {
          activo: datos.activo, cuentaCorriente: datos.cuentaCorriente,
          saldoPendiente: datos.saldoPendiente, cupoCuentaCorriente: datos.cupoCuentaCorriente
        });
      }
    }

    if (!res.exito) {
      form.ponerErrores(res.errores || {});
      setErrorGeneral(res.mensaje);
      return;
    }

    setModalAbierto(false);
    mostrarAviso(editandoId !== null ? "Usuario actualizado correctamente." : "Usuario creado correctamente.");
  };

  const cambiarEstado = (u, activo) => {
    const res = cambiarEstadoUsuario(u.id, activo);
    mostrarAviso(res.mensaje, res.exito);
  };

  return (
    <div className="card shadow-sm border-0 p-4 rounded-3">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h2 className="fw-bold h4 mb-0">Usuarios del sistema</h2>
        <button type="button" id="btn-nuevo-usuario" className="btn btn-warning fw-bold" onClick={() => abrir(null)}>➕ Crear usuario</button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr><th>Nombre</th><th>Correo</th><th>RUT / Teléfono</th><th>Rol</th><th>Estado</th><th>Cta. corriente</th><th></th></tr>
          </thead>
          <tbody>
            {obtenerUsuarios().map((u) => {
              const esYo = yo && u.id === yo.id;
              const activo = u.activo !== false;
              return (
                <tr key={u.id} className={activo ? "" : "table-secondary text-muted"}>
                  <td>{u.nombre} {esYo && <span className="badge bg-dark">tú</span>}</td>
                  <td>{u.correo}</td>
                  <td className="small">{u.rut}<br />{u.telefono}</td>
                  <td><span className="badge bg-secondary">{NOMBRE_ROL[u.rol] || u.rol}</span></td>
                  <td><span className={`badge ${activo ? "bg-success" : "bg-danger"}`}>{activo ? "Activo" : "Desactivado"}</span></td>
                  <td className="small">
                    {u.cuentaCorriente ? <>Cupo {formatoPesos(u.cupoCuentaCorriente || 0)}<br />Debe <strong>{formatoPesos(u.saldoPendiente || 0)}</strong></> : "No"}
                  </td>
                  <td className="text-end text-nowrap">
                    <button type="button" className="btn btn-sm btn-outline-dark btn-editar" onClick={() => abrir(u.id)}>Editar</button>{" "}
                    <button
                      type="button"
                      className={`btn btn-sm ${activo ? "btn-outline-danger" : "btn-outline-success"} btn-estado`}
                      disabled={esYo}
                      title={esYo ? "No puedes desactivar tu propia cuenta" : undefined}
                      onClick={() => cambiarEstado(u, !activo)}
                    >
                      {activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ModalBase
        abierto={modalAbierto}
        titulo={editandoId !== null ? "Editar usuario" : "Crear usuario"}
        idTitulo="titulo-modal-usuario"
        scrollable
        onCerrar={() => setModalAbierto(false)}
        onSubmit={guardar}
        pie={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button type="submit" className="btn btn-warning fw-bold">Guardar</button>
          </>
        }
      >
        {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

        <CampoFormulario label="Nombre completo" autoComplete="off" {...form.propsCampo("nombre")} id="u-nombre" />
        <CampoFormulario label="RUT" placeholder="12345678-5" autoComplete="off" {...form.propsCampo("rut")} id="u-rut" />
        <CampoFormulario label="Correo electrónico" type="email" autoComplete="off" {...form.propsCampo("correo")} id="u-correo" />
        <CampoFormulario label="Teléfono" type="tel" placeholder="+56912345678" autoComplete="off" {...form.propsCampo("telefono")} id="u-telefono" />
        <CampoFormulario
          label="Contraseña" type="password" autoComplete="new-password"
          placeholder={editandoId !== null ? "Dejar vacío para mantener la actual" : "Mínimo 6 caracteres"}
          {...form.propsCampo("clave")} id="u-clave"
        />

        <div className="mb-3">
          <label htmlFor="u-rol" className="form-label fw-bold">Rol</label>
          <select id="u-rol" className="form-select" value={valores.rol} disabled={editandoMiCuenta} onChange={(e) => form.cambiar("rol", e.target.value)}>
            <option value="cliente">Cliente</option>
            <option value="vendedor">Vendedor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <div className="form-check form-switch mb-3">
          <input className="form-check-input" type="checkbox" role="switch" id="u-activo" checked={valores.activo} disabled={editandoMiCuenta} onChange={(e) => form.cambiar("activo", e.target.checked)} />
          <label className="form-check-label" htmlFor="u-activo">Cuenta activa (si se desactiva, no puede iniciar sesión)</label>
        </div>

        <div className="form-check form-switch mb-2">
          <input className="form-check-input" type="checkbox" role="switch" id="u-cc" checked={valores.cuentaCorriente} onChange={alternarCuentaCorriente} />
          <label className="form-check-label" htmlFor="u-cc">Tiene cuenta corriente</label>
        </div>
        <div className="mb-3">
          <label htmlFor="u-cupo" className="form-label fw-bold">Cupo asignado ($)</label>
          <input type="number" id="u-cupo" min="1" className={`form-control${errores.cupo ? " is-invalid" : ""}`} value={valores.cupo} disabled={!valores.cuentaCorriente} onChange={(e) => form.cambiar("cupo", e.target.value)} />
          {errores.cupo && <div className="invalid-feedback">{errores.cupo}</div>}
          <div className="form-text">Monto máximo que el cliente puede deber. Se sugiere $40.000.</div>
        </div>
        <div className="mb-1">
          <label htmlFor="u-saldo" className="form-label fw-bold">Saldo pendiente ($)</label>
          <input type="number" id="u-saldo" min="0" className={`form-control${errores.saldo ? " is-invalid" : ""}`} value={valores.saldo} disabled={!valores.cuentaCorriente} onChange={(e) => form.cambiar("saldo", e.target.value)} />
          {errores.saldo && <div className="invalid-feedback">{errores.saldo}</div>}
        </div>
      </ModalBase>
    </div>
  );
}
