// ============================
// datos.js
// Maneja usuarios, productos y pedidos guardados en localStorage
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

// Busca un usuario que coincida con correo y contraseña exactos
function iniciarSesion(correo, clave) {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find((u) => u.correo === correo && u.clave === clave);

  if (!usuario) {
    return { exito: false, mensaje: "Correo o contraseña incorrectos." };
  }

  // Guardamos quién inició sesión, para que otras páginas (los paneles) sepan quién es
  localStorage.setItem("sesionActual", JSON.stringify(usuario));

  return { exito: true, usuario: usuario };
}

// Trae los datos del usuario que tiene la sesión iniciada actualmente (o null si nadie ha iniciado sesión)
function obtenerSesionActual() {
  const datos = localStorage.getItem("sesionActual");
  return datos ? JSON.parse(datos) : null;
}

// Cierra la sesión actual (lo usaremos en los paneles, con un botón "Cerrar sesión")
function cerrarSesion() {
  localStorage.removeItem("sesionActual");
}

// ============================
// CATEGORÍAS Y SUBCATEGORÍAS
// ============================

// Estructura fija: cada categoría con su lista de subcategorías (la usamos para armar el menú desplegable)
const CATEGORIAS_Y_SUBCATEGORIAS = {
  "Herramientas manuales": ["Martillos", "Llaves", "Escaleras"],
  "Herramientas eléctricas": ["Taladros"],
  "Materiales de construcción": ["Pinturas", "Tornillos y anclajes"],
};

// ============================
// PRODUCTOS
// ============================

// Trae la lista de productos guardada, o un arreglo vacío si no hay ninguno todavía
function obtenerProductos() {
  const datos = localStorage.getItem("productos");
  return datos ? JSON.parse(datos) : [];
}

// Guarda la lista completa de productos en localStorage
function guardarProductos(listaProductos) {
  localStorage.setItem("productos", JSON.stringify(listaProductos));
}

// Si no hay productos guardados todavía, carga una lista de ejemplo (solo la primera vez)
function inicializarProductos() {
  const productosExistentes = obtenerProductos();

  // Si ya hay productos guardados, no hacemos nada (para no duplicar ni pisar cambios del admin)
  if (productosExistentes.length > 0) return;

  const productosDeEjemplo = [
    { id: 1, nombre: "Martillo de acero 16 oz", precio: 6990, stock: 25, imagen: "img/martillo.jpg", categoria: "Herramientas manuales", subcategoria: "Martillos" },
    { id: 2, nombre: "Taladro percutor 18V", precio: 54990, stock: 10, imagen: "img/taladro.jpg", categoria: "Herramientas eléctricas", subcategoria: "Taladros" },
    { id: 3, nombre: "Set de llaves (12 pzas)", precio: 18490, stock: 15, imagen: "img/llaves.jpg", categoria: "Herramientas manuales", subcategoria: "Llaves" },
    { id: 4, nombre: "Escalera aluminio 6 peldaños", precio: 32990, stock: 8, imagen: "img/escalera.jpg", categoria: "Herramientas manuales", subcategoria: "Escaleras" },
    { id: 5, nombre: "Pintura látex 1 galón", precio: 14990, stock: 30, imagen: "img/pintura.jpg", categoria: "Materiales de construcción", subcategoria: "Pinturas" },
    { id: 6, nombre: "Caja tornillos autoperforantes", precio: 4490, stock: 50, imagen: "img/tornillos.jpg", categoria: "Materiales de construcción", subcategoria: "Tornillos y anclajes" },
  ];

  guardarProductos(productosDeEjemplo);
}

// Ejecutamos esto apenas se carga datos.js, para asegurarnos de que siempre haya productos
inicializarProductos();

// Le asigna "Sin categoría" / "General" a cualquier producto que ya exista y no tenga esos campos todavía
// (por ejemplo, productos agregados desde el panel admin antes de que existiera este campo)
function migrarCategoriasFaltantes() {
  const productos = obtenerProductos();
  let huboCambios = false;

  productos.forEach(function (producto) {
    if (!producto.categoria) {
      producto.categoria = "Sin categoría";
      huboCambios = true;
    }
    if (!producto.subcategoria) {
      producto.subcategoria = "General";
      huboCambios = true;
    }
  });

  if (huboCambios) {
    guardarProductos(productos);
  }
}

migrarCategoriasFaltantes();

// ============================
// PEDIDOS
// ============================

// Trae la lista de pedidos guardada, o un arreglo vacío si no hay ninguno todavía
function obtenerPedidos() {
  const datos = localStorage.getItem("pedidos");
  return datos ? JSON.parse(datos) : [];
}

// Guarda la lista completa de pedidos en localStorage
function guardarPedidos(listaPedidos) {
  localStorage.setItem("pedidos", JSON.stringify(listaPedidos));
}

// Crea un pedido nuevo para un producto específico, y descuenta el stock
function hacerPedido(clienteCorreo, productoId, cantidad) {
  const productos = obtenerProductos();
  const producto = productos.find((p) => p.id === productoId);

  if (!producto) {
    return { exito: false, mensaje: "El producto no existe." };
  }

  if (producto.stock < cantidad) {
    return { exito: false, mensaje: "No hay suficiente stock disponible." };
  }

  // Descontamos el stock del producto
  producto.stock = producto.stock - cantidad;
  guardarProductos(productos);

  // Creamos el pedido nuevo
  const nuevoPedido = {
    id: Date.now(),
    clienteCorreo: clienteCorreo,
    productoId: producto.id,
    productoNombre: producto.nombre,
    cantidad: cantidad,
    total: producto.precio * cantidad,
    estado: "Pendiente",
    fecha: new Date().toLocaleString(),
  };

  const pedidos = obtenerPedidos();
  pedidos.push(nuevoPedido);
  guardarPedidos(pedidos);

  return { exito: true, mensaje: "Pedido realizado con éxito.", pedido: nuevoPedido };
}

// ============================
// ADMIN INICIAL
// ============================

// Crea una cuenta de administrador automáticamente, solo si no existe ninguna todavía
function inicializarAdmin() {
  const usuarios = obtenerUsuarios();

  // Revisamos si ya existe algún admin
  const yaExisteAdmin = usuarios.some((u) => u.rol === "admin");
  if (yaExisteAdmin) return;

  // Si no existe, creamos uno con datos fijos de prueba
  const adminInicial = {
    id: Date.now(),
    nombre: "Administrador",
    rut: "11111111-1",
    correo: "admin@ferreteria.cl",
    telefono: "+56911111111",
    clave: "admin123",
    rol: "admin",
    saldoPendiente: 0,
  };

  usuarios.push(adminInicial);
  guardarUsuarios(usuarios);
}

inicializarAdmin();