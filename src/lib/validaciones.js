// ========================================================
// validaciones.js - Reglas de validación (funciones puras, sin React ni localStorage).
// Cada mensajeErrorX devuelve "" si el dato está bien, o el mensaje que se muestra bajo el campo.
// ========================================================

// Así "12.345.678-5" y "12345678-5" cuentan como el MISMO RUT, etc.
export function normalizarRut(rut) {
  return String(rut).replace(/\./g, "").replace(/\s/g, "").toUpperCase();
}

export function normalizarTelefono(telefono) {
  return String(telefono).replace(/\D/g, "").slice(-9);
}

export function normalizarCorreo(correo) {
  return String(correo).trim().toLowerCase();
}

// RUT chileno: formato 12345678-5 y dígito verificador real (algoritmo módulo 11)
export function validarRut(rutCompleto) {
  const rutLimpio = normalizarRut(rutCompleto);
  if (!/^\d{7,8}-[0-9K]$/.test(rutLimpio)) return false;

  const [cuerpo, dv] = rutLimpio.split("-");
  let suma = 0;
  let multiplicador = 2;

  // Se recorre el cuerpo de derecha a izquierda multiplicando por 2,3,4,5,6,7,2,3...
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  return dvEsperado === dv;
}

export function mensajeErrorNombre(nombre) {
  const n = String(nombre).trim();
  if (!n) return "El nombre es obligatorio.";
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(n)) return "El nombre solo puede tener letras y espacios (sin números ni símbolos).";
  if (n.length < 3) return "El nombre debe tener al menos 3 letras.";
  return "";
}

export function mensajeErrorRut(rut) {
  const r = normalizarRut(rut);
  if (!r) return "El RUT es obligatorio.";
  if (!r.includes("-")) return "Escribe el RUT con guión antes del dígito verificador. Ej: 12345678-5";
  if (!/^\d{7,8}-[0-9K]$/.test(r)) return "Formato de RUT inválido. Usa solo números, guión y dígito verificador. Ej: 12345678-5";
  if (!validarRut(r)) return "El dígito verificador no corresponde a este RUT. Revísalo.";
  return "";
}

export function mensajeErrorCorreo(correo) {
  const c = String(correo).trim();
  if (!c) return "El correo es obligatorio.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) return "Ingresa un correo válido. Ej: nombre@correo.cl";
  return "";
}

// Teléfono chileno: +56 9 XXXXXXXX (el +56 es opcional)
export function validarTelefono(telefono) {
  return /^(\+?56)?9\d{8}$/.test(String(telefono).replace(/\s/g, ""));
}

export function mensajeErrorTelefono(telefono) {
  if (!String(telefono).trim()) return "El teléfono es obligatorio.";
  if (!validarTelefono(telefono)) return "Ingresa un celular chileno válido. Ej: +56912345678 o 912345678";
  return "";
}

export function mensajeErrorClave(clave) {
  if (!clave) return "La contraseña es obligatoria.";
  if (clave.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
  return "";
}

// Monto entero positivo (lo usan los abonos, el precio y el cupo)
export function mensajeErrorMontoEntero(valor, minimo = 1) {
  const texto = String(valor).trim();
  const numero = Number(texto);
  if (texto === "" || !Number.isInteger(numero) || numero < minimo) {
    return minimo > 0 ? "Ingresa un monto entero mayor a 0." : "Ingresa un número entero igual o mayor a 0.";
  }
  return "";
}
