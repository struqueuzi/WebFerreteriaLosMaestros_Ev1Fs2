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

  // Estandarización de rutas a assets/imgs/
  const productosDeEjemplo = [
    { id: 1, nombre: "Cemento Polpaico Especial 25kg", precio: 4890, stock: 120, imagen: "assets/imgs/cemento-especial-transex-25-kg-.jpg", categoria: "Materiales de construcción", subcategoria: "Cementos" },
    { id: 2, nombre: "Rotomartillo Eléctrico 800W", precio: 45990, stock: 8, imagen: "assets/imgs/5fb962b131194-edb82be4-f66a-4c09-9089-ed06a679c1c4-1600x1600.jpg", categoria: "Herramientas eléctricas", subcategoria: "Rotomartillos" },
    { id: 3, nombre: "Martillo de Carpintero 16oz", precio: 8990, stock: 14, imagen: "assets/imgs/martillo.jpg", categoria: "Herramientas manuales", subcategoria: "Martillos" },
    { id: 4, nombre: "Tubo PVC Sanitario 40mm x 3mt", precio: 3290, stock: 45, imagen: "assets/imgs/tubo-pvc-u-para-alcantarillado-domiciliario-gris-3-metros.jpg", categoria: "Gasfitería", subcategoria: "Tuberías PVC" }
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

function agregarAlCarritoGlobal(id, cantidad = 1) {
  const productos = obtenerProductos();
  const producto = productos.find((p) => p.id === id);
  if (!producto) return { exito: false, mensaje: "El producto no existe." };

  let carrito = obtenerCarrito();
  const itemExistente = carrito.find((item) => item.id === id);

  const cantidadActual = itemExistente ? itemExistente.cantidad : 0;
  if (cantidadActual + cantidad > producto.stock) {
    return { exito: false, mensaje: `Stock insuficiente. Disponible: ${producto.stock}` };
  }

  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: cantidad
    });
  }

  guardarCarrito(carrito);
  return { exito: true, mensaje: `¡${producto.nombre} agregado al carrito!` };
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
// 4. PEDIDOS Y REBAJA DE STOCK
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
    return { exito: false, mensaje: `Stock insuficiente de "${producto.nombre}" (Disponible: ${producto.stock}).` };
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

// Inicialización automática al cargar scripts
document.addEventListener("DOMContentLoaded", () => {
  inicializarAdmin();
  inicializarProductos();
  actualizarContadorCarritoGlobal();
});