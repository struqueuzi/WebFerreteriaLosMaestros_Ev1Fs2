// ============================
// datos.js
// Maneja usuarios y productos guardados en localStorage
// ============================

// Trae la lista de usuarios guardada, o un arreglo vacío si no hay ninguno todavía
function obtenerUsuarios() {
  const datos = localStorage.getItem("usuarios");
  return datos ? JSON.parse(datos) : [];
}

// Guarda la lista completa de usuarios en localStorage
function guardarUsuarios(listaUsuarios) {
  localStorage.setItem("usuarios", JSON.stringify(listaUsuarios));
}

// Revisa si ya existe un usuario con el mismo RUT, correo o teléfono
function buscarUsuarioDuplicado(rut, correo, telefono) {
  const usuarios = obtenerUsuarios();
  return usuarios.find(
    (u) => u.rut === rut || u.correo === correo || u.telefono === telefono
  );
}

// Valida que el RUT chileno tenga formato correcto y dígito verificador válido
function validarRut(rutCompleto) {
  const rutLimpio = rutCompleto.replace(/\./g, "").replace(/\s/g, "").toUpperCase();
  const formatoValido = /^\d{7,8}-[0-9K]$/.test(rutLimpio);
  if (!formatoValido) return false;

  const [cuerpo, dv] = rutLimpio.split("-");
  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = 11 - (suma % 11);
  let dvEsperado;
  if (resto === 11) dvEsperado = "0";
  else if (resto === 10) dvEsperado = "K";
  else dvEsperado = String(resto);

  return dvEsperado === dv;
}

// Valida que el nombre tenga solo letras y espacios (con tildes y ñ incluidas), mínimo 3 caracteres
function validarNombre(nombre) {
  const patronSoloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/;
  return patronSoloLetras.test(nombre.trim());
}

// Valida que el teléfono tenga solo números (puede empezar con +56), sin letras ni símbolos raros
function validarTelefono(telefono) {
  const patronTelefono = /^(\+?56)?\s?9\d{8}$/;
  return patronTelefono.test(telefono.replace(/\s/g, ""));
}

function registrarUsuario(nombre, rut, correo, telefono, clave, rol = "cliente") {
  // Validamos el nombre: solo letras, sin números
  if (!validarNombre(nombre)) {
    return {
      exito: false,
      mensaje: "El nombre solo puede contener letras (mínimo 3 caracteres).",
    };
  }

  // Validamos el RUT (formato + dígito verificador)
  if (!validarRut(rut)) {
    return {
      exito: false,
      mensaje: "El RUT ingresado no es válido. Verifica el número y el dígito verificador.",
    };
  }

  // Validamos el teléfono: solo números, formato chileno (+56 9 XXXXXXXX)
  if (!validarTelefono(telefono)) {
    return {
      exito: false,
      mensaje: "El teléfono no es válido. Usa solo números, ej: +56912345678",
    };
  }

  const duplicado = buscarUsuarioDuplicado(rut, correo, telefono);

  if (duplicado) {
    return {
      exito: false,
      mensaje: "Ya existe una cuenta registrada con ese RUT, correo o teléfono.",
    };
  }

  const usuarios = obtenerUsuarios();

  const nuevoUsuario = {
    id: Date.now(),
    nombre,
    rut,
    correo,
    telefono,
    clave,
    rol,
    saldoPendiente: 0,
  };

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);

  return { exito: true, mensaje: "Cuenta creada correctamente." };
}