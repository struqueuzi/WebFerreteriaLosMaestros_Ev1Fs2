// ========================================================
// usuarios.js - Usuarios, sesión, cuenta corriente (cupo) y abonos
// ========================================================
import { borrar, escribir, leer } from "./almacen";
import { formatoPesos } from "./formato";
import {
  mensajeErrorClave, mensajeErrorCorreo, mensajeErrorNombre, mensajeErrorRut, mensajeErrorTelefono,
  normalizarCorreo, normalizarRut, normalizarTelefono
} from "./validaciones";

// Cupo que la ferretería le otorga a un cliente con cuenta corriente (lo puede cambiar el administrador)
export const CUPO_CUENTA_CORRIENTE_POR_DEFECTO = 40000;

// --------------------------------------------------------
// 1. USUARIOS: validación completa y control de duplicados
// --------------------------------------------------------
export function obtenerUsuarios() {
  return leer("usuarios", []);
}

export function guardarUsuarios(lista) {
  escribir("usuarios", lista);
}

// Valida TODOS los datos de un usuario y revisa que no estén repetidos.
// Devuelve { campo: "mensaje" } (vacío si todo está bien).
// "idExcluido" sirve al EDITAR: un usuario no cuenta como duplicado de sí mismo.
export function validarUsuario(datos, idExcluido = null, exigirClave = true) {
  const errores = {};
  const eNombre = mensajeErrorNombre(datos.nombre);
  const eRut = mensajeErrorRut(datos.rut);
  const eCorreo = mensajeErrorCorreo(datos.correo);
  const eTelefono = mensajeErrorTelefono(datos.telefono);

  if (eNombre) errores.nombre = eNombre;
  if (eRut) errores.rut = eRut;
  if (eCorreo) errores.correo = eCorreo;
  if (eTelefono) errores.telefono = eTelefono;
  if (exigirClave || datos.clave) {
    const eClave = mensajeErrorClave(datos.clave || "");
    if (eClave) errores.clave = eClave;
  }

  // Duplicados: solo se revisan los campos que tienen formato válido
  if (!eRut) { const d = mensajeDuplicado("rut", datos.rut, idExcluido); if (d) errores.rut = d; }
  if (!eCorreo) { const d = mensajeDuplicado("correo", datos.correo, idExcluido); if (d) errores.correo = d; }
  if (!eTelefono) { const d = mensajeDuplicado("telefono", datos.telefono, idExcluido); if (d) errores.telefono = d; }

  return errores;
}

// Dice si ESE dato ya pertenece a otra cuenta. campo: "rut" | "correo" | "telefono".
// Devuelve el mensaje de error o "" si está libre.
export function mensajeDuplicado(campo, valor, idExcluido = null) {
  const otros = obtenerUsuarios().filter((u) => u.id !== idExcluido);
  if (campo === "rut" && otros.some((u) => normalizarRut(u.rut) === normalizarRut(valor))) return "Ya existe una cuenta registrada con este RUT.";
  if (campo === "correo" && otros.some((u) => normalizarCorreo(u.correo) === normalizarCorreo(valor))) return "Ya existe una cuenta registrada con este correo.";
  if (campo === "telefono" && otros.some((u) => normalizarTelefono(u.telefono) === normalizarTelefono(valor))) return "Ya existe una cuenta registrada con este teléfono.";
  return "";
}

// Arma el texto resumen cuando hay datos repetidos. Ej: "Ya existe una cuenta registrada con el mismo RUT y correo."
export function mensajeResumenErrores(errores) {
  const repetidos = [];
  if (errores.rut && errores.rut.startsWith("Ya existe")) repetidos.push("RUT");
  if (errores.correo && errores.correo.startsWith("Ya existe")) repetidos.push("correo");
  if (errores.telefono && errores.telefono.startsWith("Ya existe")) repetidos.push("teléfono");

  if (repetidos.length > 0) {
    const lista = repetidos.length > 1
      ? repetidos.slice(0, -1).join(", ") + " y " + repetidos[repetidos.length - 1]
      : repetidos[0];
    return `Ya existe una cuenta registrada con el mismo ${lista}.`;
  }
  return "Revisa los campos marcados en rojo.";
}

// --------------------------------------------------------
// 2. REGISTRO, EDICIÓN Y SESIÓN
// --------------------------------------------------------
export function registrarUsuario(nombre, rut, correo, telefono, clave, rol = "cliente") {
  const errores = validarUsuario({ nombre, rut, correo, telefono, clave });
  if (Object.keys(errores).length > 0) {
    return { exito: false, errores, mensaje: mensajeResumenErrores(errores) };
  }

  const usuarios = obtenerUsuarios();
  const nuevo = {
    id: Date.now() + usuarios.length,
    nombre: nombre.trim(),
    rut: normalizarRut(rut),
    correo: normalizarCorreo(correo),
    telefono: telefono.trim(),
    clave,
    rol,
    activo: true,
    cuentaCorriente: false,
    cupoCuentaCorriente: 0,
    saldoPendiente: 0,
    movimientosCC: []
  };
  usuarios.push(nuevo);
  guardarUsuarios(usuarios);

  return { exito: true, mensaje: "Cuenta creada correctamente.", usuario: nuevo };
}

// Edita un usuario (lo usa el administrador). Si "cambios.clave" viene vacía, se mantiene la actual.
export function actualizarUsuario(id, cambios) {
  const usuarios = obtenerUsuarios();
  const actual = usuarios.find((u) => u.id === id);
  if (!actual) return { exito: false, mensaje: "El usuario no existe." };

  const nuevo = { ...actual, ...cambios };
  if (!cambios.clave) nuevo.clave = actual.clave;

  const errores = validarUsuario(nuevo, id, false);
  if (Object.keys(errores).length > 0) {
    return { exito: false, errores, mensaje: mensajeResumenErrores(errores) };
  }

  nuevo.nombre = nuevo.nombre.trim();
  nuevo.rut = normalizarRut(nuevo.rut);
  nuevo.correo = normalizarCorreo(nuevo.correo);
  nuevo.telefono = String(nuevo.telefono).trim();
  nuevo.saldoPendiente = Math.max(0, Number(nuevo.saldoPendiente) || 0);
  nuevo.cupoCuentaCorriente = Math.max(0, Number(nuevo.cupoCuentaCorriente) || 0);

  // Reglas de la cuenta corriente: tiene un cupo asignado y el saldo pendiente no puede superarlo
  if (nuevo.cuentaCorriente) {
    if (!Number.isInteger(nuevo.cupoCuentaCorriente) || nuevo.cupoCuentaCorriente < 1) {
      return { exito: false, errores: { cupo: "El cupo debe ser un monto entero mayor a 0." }, mensaje: "Revisa el cupo de la cuenta corriente." };
    }
    if (nuevo.saldoPendiente > nuevo.cupoCuentaCorriente) {
      return { exito: false, errores: { saldo: "El saldo pendiente no puede superar el cupo asignado." }, mensaje: "El saldo pendiente no puede superar el cupo asignado." };
    }
  } else {
    if (nuevo.saldoPendiente > 0) {
      return { exito: false, errores: { saldo: "No se puede quitar la cuenta corriente mientras haya saldo pendiente." }, mensaje: "No se puede quitar la cuenta corriente mientras haya saldo pendiente." };
    }
    nuevo.cupoCuentaCorriente = 0;
  }

  // Si el administrador cambió el saldo a mano, queda anotado como "ajuste" en los movimientos
  nuevo.movimientosCC = [...(actual.movimientosCC || [])];
  if (nuevo.saldoPendiente !== (actual.saldoPendiente || 0)) {
    nuevo.movimientosCC.push(crearMovimientoCC("ajuste", nuevo.saldoPendiente - (actual.saldoPendiente || 0), "Ajuste del administrador"));
  }

  // Siempre debe quedar al menos un administrador activo
  const despues = usuarios.map((u) => (u.id === id ? nuevo : u));
  if (!despues.some((u) => u.rol === "admin" && u.activo !== false)) {
    return { exito: false, mensaje: "Debe existir al menos un administrador activo en el sistema." };
  }

  guardarUsuarios(despues);
  return { exito: true, mensaje: "Usuario actualizado correctamente.", usuario: nuevo };
}

// Activa o desactiva una cuenta. Una cuenta desactivada no puede iniciar sesión.
export function cambiarEstadoUsuario(id, activo) {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) return { exito: false, mensaje: "El usuario no existe." };

  usuario.activo = activo;
  if (!usuarios.some((u) => u.rol === "admin" && u.activo !== false)) {
    return { exito: false, mensaje: "Debe existir al menos un administrador activo en el sistema." };
  }

  guardarUsuarios(usuarios);
  return { exito: true, mensaje: activo ? "Cuenta activada." : "Cuenta desactivada." };
}

export function iniciarSesion(correo, clave) {
  const usuario = obtenerUsuarios().find(
    (u) => normalizarCorreo(u.correo) === normalizarCorreo(correo) && u.clave === clave
  );

  if (!usuario) return { exito: false, mensaje: "Correo o contraseña incorrectos." };
  if (usuario.activo === false) return { exito: false, mensaje: "Tu cuenta está desactivada. Contacta al administrador." };

  escribir("sesionActual", { id: usuario.id });
  return { exito: true, usuario };
}

// Devuelve SIEMPRE los datos actuales del usuario con sesión iniciada
// (si el admin le cambió el rol, lo desactivó o actualizó su saldo, se nota de inmediato).
export function obtenerSesionActual() {
  const guardada = leer("sesionActual", null);
  if (!guardada) return null;

  const actual = obtenerUsuarios().find((u) => u.id === guardada.id);
  if (!actual || actual.activo === false) {
    localStorage.removeItem("sesionActual"); // sin avisar: se llama mientras React dibuja
    return null;
  }
  return actual;
}

export function cerrarSesion() {
  borrar("sesionActual");
}

// UN solo lugar que sabe a qué ruta va el panel de cada rol
export function rutaPanelPorRol(rol) {
  if (rol === "admin") return "/admin";
  if (rol === "vendedor") return "/vendedor";
  return "/cliente";
}

// --------------------------------------------------------
// 3. CUENTA CORRIENTE: cupo, movimientos y abonos
// --------------------------------------------------------
// Cupo disponible = cupo asignado - saldo pendiente (lo que el cliente todavía puede usar)
export function cupoDisponible(usuario) {
  if (!usuario || !usuario.cuentaCorriente) return 0;
  return Math.max(0, (usuario.cupoCuentaCorriente || 0) - (usuario.saldoPendiente || 0));
}

// Un movimiento es una línea del "estado de cuenta": compra (+), abono (-) o ajuste (+/-)
export function crearMovimientoCC(tipo, monto, detalle) {
  return { fecha: new Date().toLocaleString("es-CL"), tipo, monto, detalle };
}

export function movimientosIniciales(saldo) {
  return saldo > 0 ? [crearMovimientoCC("ajuste", saldo, "Saldo inicial")] : [];
}

// Baja el saldo pendiente. Se llama cuando el administrador APRUEBA un abono enviado por el cliente.
export function registrarAbono(idUsuario, monto, detalle = "") {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find((u) => u.id === idUsuario);
  if (!usuario || !usuario.cuentaCorriente) return { exito: false, mensaje: "El usuario no tiene cuenta corriente." };

  const m = Number(monto);
  if (!Number.isInteger(m) || m <= 0) return { exito: false, mensaje: "Ingresa un monto entero mayor a 0." };
  if (m > (usuario.saldoPendiente || 0)) {
    return { exito: false, mensaje: `El abono no puede superar el saldo pendiente (${formatoPesos(usuario.saldoPendiente || 0)}).` };
  }

  usuario.saldoPendiente -= m;
  usuario.movimientosCC = usuario.movimientosCC || [];
  usuario.movimientosCC.push(crearMovimientoCC("abono", -m, detalle.trim() || "Abono registrado en tienda"));
  guardarUsuarios(usuarios);

  return { exito: true, mensaje: `Abono de ${formatoPesos(m)} registrado. Saldo pendiente: ${formatoPesos(usuario.saldoPendiente)}.` };
}

// ---- Solicitudes de abono: el CLIENTE avisa que pagó y el ADMINISTRADOR las aprueba o rechaza ----
// Estados: "Pendiente" (esperando al administrador) -> "Aprobado" (se descuenta del saldo) o "Rechazado"
export function obtenerAbonos() {
  return leer("abonos", []);
}

export function guardarAbonos(lista) {
  escribir("abonos", lista);
}

// Suma de los abonos que el cliente ya envió y todavía no se aprueban
export function totalAbonosPendientes(idUsuario) {
  return obtenerAbonos()
    .filter((a) => a.idUsuario === idUsuario && a.estado === "Pendiente")
    .reduce((suma, a) => suma + a.monto, 0);
}

// El cliente envía un abono: queda "Pendiente" y NO baja el saldo hasta que el administrador lo apruebe
export function solicitarAbono(idUsuario, monto, detalle = "") {
  const usuario = obtenerUsuarios().find((u) => u.id === idUsuario);
  if (!usuario || !usuario.cuentaCorriente) return { exito: false, mensaje: "No tienes cuenta corriente." };

  const m = Number(monto);
  if (!Number.isInteger(m) || m <= 0) return { exito: false, mensaje: "Ingresa un monto entero mayor a 0." };

  const maximo = (usuario.saldoPendiente || 0) - totalAbonosPendientes(idUsuario);
  if (m > maximo) {
    return {
      exito: false,
      mensaje: maximo > 0
        ? `Solo puedes abonar hasta ${formatoPesos(maximo)} (considerando tus abonos pendientes de aprobación).`
        : "Tus abonos pendientes ya cubren todo tu saldo."
    };
  }

  const abonos = obtenerAbonos();
  abonos.push({
    id: Date.now() + abonos.length, idUsuario: usuario.id, nombre: usuario.nombre, correo: usuario.correo,
    monto: m, detalle: detalle.trim(), fecha: new Date().toLocaleString("es-CL"), estado: "Pendiente"
  });
  guardarAbonos(abonos);
  return { exito: true, mensaje: `Abono de ${formatoPesos(m)} enviado. Quedará pendiente hasta que el administrador lo confirme.` };
}

// El administrador aprueba (descuenta del saldo) o rechaza una solicitud de abono
export function resolverAbono(idAbono, aprobar) {
  const abonos = obtenerAbonos();
  const abono = abonos.find((a) => a.id === idAbono);
  if (!abono || abono.estado !== "Pendiente") return { exito: false, mensaje: "Este abono ya fue resuelto." };

  if (aprobar) {
    const res = registrarAbono(abono.idUsuario, abono.monto, abono.detalle || "Abono del cliente (aprobado por el administrador)");
    if (!res.exito) return res;
    abono.estado = "Aprobado";
  } else {
    abono.estado = "Rechazado";
  }
  abono.fechaResolucion = new Date().toLocaleString("es-CL");
  guardarAbonos(abonos);
  return {
    exito: true,
    mensaje: aprobar
      ? `Abono de ${formatoPesos(abono.monto)} aprobado: se descontó del saldo de ${abono.nombre}.`
      : "Abono rechazado."
  };
}

// --------------------------------------------------------
// 4. CUENTAS DE DEMOSTRACIÓN (una por cada rol)
// --------------------------------------------------------
export const CUENTAS_DEMO = [
  { nombre: "Administrador Maestros", rut: "11111111-1", correo: "admin@maestros.cl",    telefono: "+56911111111", clave: "admin123",    rol: "admin",    cuentaCorriente: false, cupoCuentaCorriente: 0, saldoPendiente: 0 },
  { nombre: "Administrador General",  rut: "12345678-5", correo: "admin@ferreteria.cl",  telefono: "+56912345678", clave: "admin123",    rol: "admin",    cuentaCorriente: false, cupoCuentaCorriente: 0, saldoPendiente: 0 },
  { nombre: "Vendedor Maestros",      rut: "18765432-7", correo: "vendedor@maestros.cl", telefono: "+56918765432", clave: "vendedor123", rol: "vendedor", cuentaCorriente: false, cupoCuentaCorriente: 0, saldoPendiente: 0 },
  { nombre: "Cliente Maestros",       rut: "15234567-4", correo: "cliente@maestros.cl",  telefono: "+56915234567", clave: "cliente123",  rol: "cliente",  cuentaCorriente: true,  cupoCuentaCorriente: 40000, saldoPendiente: 15000 }
];

// Deja las cuentas de demostración tal como vienen de fábrica
export function reiniciarCuentasDemo() {
  localStorage.removeItem("abonos");
  const usuarios = obtenerUsuarios();
  CUENTAS_DEMO.forEach((demo) => {
    const u = usuarios.find((x) => normalizarCorreo(x.correo) === demo.correo);
    if (!u) return;
    Object.assign(u, {
      rol: demo.rol, activo: true, cuentaCorriente: demo.cuentaCorriente,
      cupoCuentaCorriente: demo.cupoCuentaCorriente, saldoPendiente: demo.saldoPendiente,
      movimientosCC: movimientosIniciales(demo.saldoPendiente)
    });
  });
  guardarUsuarios(usuarios);
}

// Crea las cuentas demo si no existen (se identifican por correo) sin pisar las que se registren después
export function asegurarCuentasDemo() {
  const usuarios = obtenerUsuarios();
  let huboCambios = false;

  CUENTAS_DEMO.forEach((demo, i) => {
    if (!usuarios.some((u) => normalizarCorreo(u.correo) === demo.correo)) {
      usuarios.push({ id: Date.now() + i, activo: true, ...demo, movimientosCC: movimientosIniciales(demo.saldoPendiente) });
      huboCambios = true;
    }
  });

  if (huboCambios) guardarUsuarios(usuarios);
}
