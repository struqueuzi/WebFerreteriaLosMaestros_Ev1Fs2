// ========================================================
// transferencia.js - Cuenta bancaria a la que el cliente transfiere.
// Los datos quedan en localStorage y el administrador los puede cambiar desde su panel.
// ========================================================
import { escribir, leer } from "./almacen";
import { mensajeErrorCorreo, mensajeErrorRut } from "./validaciones";

export const TIPOS_DE_CUENTA = ["Cuenta Corriente", "Cuenta Vista", "Cuenta RUT", "Cuenta de Ahorro"];

export const BANCOS = [
  "BancoEstado", "Banco de Chile", "Banco Santander", "Banco BCI", "Scotiabank",
  "Banco Itaú", "Banco Security", "Banco Falabella", "Banco Ripley", "Mercado Pago", "Tenpo"
];

// Datos de ejemplo (inventados) para que la opción funcione desde el primer día
export const DATOS_TRANSFERENCIA_POR_DEFECTO = {
  banco: "BancoEstado",
  tipoCuenta: "Cuenta Corriente",
  numeroCuenta: "29870014563",
  titular: "Ferretería Los Maestros SpA",
  rut: "76.418.293-6",
  correo: "pagos@losmaestros.cl"
};

export function obtenerDatosTransferencia() {
  return { ...DATOS_TRANSFERENCIA_POR_DEFECTO, ...leer("datos_transferencia", {}) };
}

// Revisa los datos antes de guardarlos. Devuelve { campo: "mensaje" } (vacío si está todo bien)
export function validarDatosTransferencia(datos) {
  const errores = {};
  if (!datos.banco || !datos.banco.trim()) errores.banco = "Indica el banco.";
  if (!TIPOS_DE_CUENTA.includes(datos.tipoCuenta)) errores.tipoCuenta = "Elige un tipo de cuenta válido.";

  const soloNumeros = String(datos.numeroCuenta || "").replace(/[\s-]/g, "");
  if (!soloNumeros) errores.numeroCuenta = "El número de cuenta es obligatorio.";
  else if (!/^\d{6,20}$/.test(soloNumeros)) errores.numeroCuenta = "Usa solo números (entre 6 y 20 dígitos).";

  if (!datos.titular || datos.titular.trim().length < 3) errores.titular = "Escribe el nombre del titular (mínimo 3 letras).";

  const eRut = mensajeErrorRut(datos.rut || "");
  if (eRut) errores.rut = eRut;
  const eCorreo = mensajeErrorCorreo(datos.correo || "");
  if (eCorreo) errores.correo = eCorreo;
  return errores;
}

export function guardarDatosTransferencia(datos) {
  const errores = validarDatosTransferencia(datos);
  if (Object.keys(errores).length > 0) {
    return { exito: false, errores, mensaje: "Revisa los campos marcados en rojo." };
  }
  const limpio = {
    banco: datos.banco.trim(),
    tipoCuenta: datos.tipoCuenta,
    numeroCuenta: String(datos.numeroCuenta).replace(/\s/g, ""),
    titular: datos.titular.trim(),
    rut: datos.rut.trim(),
    correo: datos.correo.trim().toLowerCase()
  };
  escribir("datos_transferencia", limpio);
  return { exito: true, errores: {}, mensaje: "Datos de transferencia guardados ✔" };
}

export function restablecerDatosTransferencia() {
  escribir("datos_transferencia", { ...DATOS_TRANSFERENCIA_POR_DEFECTO });
}

// Texto listo para copiar y pegar en la app del banco
export function textoDatosTransferencia(datos, monto = null, referencia = null) {
  const lineas = [
    `Banco: ${datos.banco}`,
    `Tipo de cuenta: ${datos.tipoCuenta}`,
    `N° de cuenta: ${datos.numeroCuenta}`,
    `Titular: ${datos.titular}`,
    `RUT: ${datos.rut}`,
    `Correo: ${datos.correo}`
  ];
  if (monto !== null) lineas.push(`Monto: $${Number(monto).toLocaleString("es-CL")}`);
  if (referencia) lineas.push(`Comentario: Pedido N° ${referencia}`);
  return lineas.join("\n");
}
