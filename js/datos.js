// ========================================================
// datos.js - NÚCLEO CENTRALIZADO DE DATOS Y LÓGICA DE NEGOCIO
// ========================================================

// --------------------------------------------------------
// 1. GESTIÓN DE USUARIOS Y SESIÓN
// --------------------------------------------------------
function obtenerUsuarios() {
  const datos = localStorage.getItem("usuarios");
  return datos ? JSON.parse(datos) : [];
}

function guardarUsuarios(listaUsuarios) {
  localStorage.setItem("usuarios", JSON.stringify(listaUsuarios));
}

function buscarUsuarioDuplicado(rut, correo, telefono) {
  const usuarios = obtenerUsuarios();
  return usuarios.find(
    (u) => u.rut === rut || u.correo === correo || u.telefono === telefono
  );
}

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
  let dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);

  return dvEsperado === dv;
}

function validarNombre(nombre) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/.test(nombre.trim());
}

function validarTelefono(telefono) {
  return /^(\+?56)?\s?9\d{8}$/.test(telefono.replace(/\s/g, ""));
}

function registrarUsuario(nombre, rut, correo, telefono, clave, rol = "cliente") {
  if (!validarNombre(nombre)) {
    return { exito: false, mensaje: "El nombre solo puede contener letras (mínimo 3 caracteres)." };
  }
  if (!validarRut(rut)) {
    return { exito: false, mensaje: "El RUT ingresado no es válido (Ej: 12345678-9)." };
  }
  if (!validarTelefono(telefono)) {
    return { exito: false, mensaje: "El teléfono no es válido. Ej: +56912345678" };
  }

  if (buscarUsuarioDuplicado(rut, correo, telefono)) {
    return { exito: false, mensaje: "Ya existe una cuenta registrada con ese RUT, correo o teléfono." };
  }

  const usuarios = obtenerUsuarios();
  const nuevoUsuario = {
    id: Date.now(),
    nombre: nombre.trim(),
    rut: rut.trim(),
    correo: correo.trim().toLowerCase(),
    telefono: telefono.trim(),
    clave,
    rol,
    saldoPendiente: 0
  };

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);

  return { exito: true, mensaje: "Cuenta creada correctamente." };
}

function iniciarSesion(correo, clave) {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(
    (u) => u.correo.toLowerCase() === correo.trim().toLowerCase() && u.clave === clave
  );

  if (!usuario) {
    return { exito: false, mensaje: "Correo o contraseña incorrectos." };
  }

  localStorage.setItem("sesionActual", JSON.stringify(usuario));
  return { exito: true, usuario };
}

function obtenerSesionActual() {
  const datos = localStorage.getItem("sesionActual");
  return datos ? JSON.parse(datos) : null;
}

function cerrarSesion() {
  localStorage.removeItem("sesionActual");
}

function inicializarAdmin() {
  const usuarios = obtenerUsuarios();
  if (!usuarios.some((u) => u.rol === "admin")) {
    usuarios.push({
      id: Date.now(),
      nombre: "Administrador",
      rut: "11111111-1",
      correo: "admin@ferreteria.cl",
      telefono: "+56911111111",
      clave: "admin123",
      rol: "admin",
      saldoPendiente: 0
    });
    guardarUsuarios(usuarios);
  }
}

// --------------------------------------------------------
// 2. CATEGORÍAS Y PRODUCTOS
// --------------------------------------------------------
const CATEGORIAS_Y_SUBCATEGORIAS = {
  "Herramientas manuales": ["Martillos", "Llaves", "Escaleras"],
  "Herramientas eléctricas": ["Taladros", "Rotomartillos"],
  "Materiales de construcción": ["Pinturas", "Tornillos y anclajes", "Cementos"],
  "Gasfitería": ["Tuberías PVC"]
};

function obtenerProductos() {
  const datos = localStorage.getItem("productos");
  return datos ? JSON.parse(datos) : [];
}

function guardarProductos(listaProductos) {
  localStorage.setItem("productos", JSON.stringify(listaProductos));
}

function inicializarProductos() {
  const productosExistentes = obtenerProductos();
  if (productosExistentes.length > 0) return;

  const productosDeEjemplo = [
    { id: 1, nombre: "Martillo de acero 16 oz", precio: 6990, stock: 25, imagen: "img/martillo.jpg", categoria: "Herramientas manuales", subcategoria: "Martillos" },
    { id: 2, nombre: "Taladro percutor 18V", precio: 54990, stock: 10, imagen: "img/taladro.jpg", categoria: "Herramientas eléctricas", subcategoria: "Taladros" },
    { id: 3, nombre: "Set de llaves (12 pzas)", precio: 18490, stock: 15, imagen: "img/llaves.jpg", categoria: "Herramientas manuales", subcategoria: "Llaves" },
    { id: 4, nombre: "Escalera aluminio 6 peldaños", precio: 32990, stock: 8, imagen: "img/escalera.jpg", categoria: "Herramientas manuales", subcategoria: "Escaleras" },
    { id: 5, nombre: "Pintura látex 1 galón", precio: 14990, stock: 30, imagen: "img/pintura.jpg", categoria: "Materiales de construcción", subcategoria: "Pinturas" },
    { id: 6, nombre: "Caja tornillos autoperforantes", precio: 4490, stock: 50, imagen: "img/tornillos.jpg", categoria: "Materiales de construcción", subcategoria: "Tornillos y anclajes" },
    { id: 7, nombre: "Cemento Polpaico Especial 25kg", precio: 4890, stock: 120, imagen: "img/cemento.jpg", categoria: "Materiales de construcción", subcategoria: "Cementos" },
    { id: 8, nombre: "Tubo PVC Sanitario 40mm x 3mt", precio: 3290, stock: 45, imagen: "img/tubo-pvc.webp", categoria: "Gasfitería", subcategoria: "Tuberías PVC" }
  ];

  guardarProductos(productosDeEjemplo);
}

// --------------------------------------------------------
// 3. CARRITO DE COMPRAS CENTRALIZADO
// --------------------------------------------------------
function obtenerCarrito() {
  const datos = localStorage.getItem("carrito_ferreteria");
  return datos ? JSON.parse(datos) : [];
}

function guardarCarrito(carrito) {
  localStorage.setItem("carrito_ferreteria", JSON.stringify(carrito));
  actualizarContadorCarritoGlobal();
}

function vaciarCarrito() {
  localStorage.removeItem("carrito_ferreteria");
  actualizarContadorCarritoGlobal();
}

function actualizarContadorCarritoGlobal() {
  const contador = document.getElementById("contador-carrito");
  if (contador) {
    const carrito = obtenerCarrito();
    const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    contador.innerText = totalItems;
  }
}

// --------------------------------------------------------
// 4. PEDIDOS
// --------------------------------------------------------
function obtenerPedidos() {
  const datos = localStorage.getItem("pedidos");
  return datos ? JSON.parse(datos) : [];
}

function guardarPedidos(listaPedidos) {
  localStorage.setItem("pedidos", JSON.stringify(listaPedidos));
}

function hacerPedido(clienteCorreo, productoId, cantidad) {
  const productos = obtenerProductos();
  const producto = productos.find((p) => p.id === productoId);

  if (!producto) {
    return { exito: false, mensaje: "El producto no existe." };
  }

  if (producto.stock < cantidad) {
    return { exito: false, mensaje: `Stock insuficiente (Disponible: ${producto.stock}).` };
  }

  producto.stock -= cantidad;
  guardarProductos(productos);

  const nuevoPedido = {
    id: Date.now(),
    clienteCorreo,
    productoId: producto.id,
    productoNombre: producto.nombre,
    cantidad,
    total: producto.precio * cantidad,
    estado: "Pendiente",
    fecha: new Date().toLocaleString("es-CL")
  };

  const pedidos = obtenerPedidos();
  pedidos.push(nuevoPedido);
  guardarPedidos(pedidos);

  return { exito: true, mensaje: "Pedido realizado con éxito.", pedido: nuevoPedido };
}

// Inicializaciones automáticas al cargar la librería
inicializarAdmin();
inicializarProductos();