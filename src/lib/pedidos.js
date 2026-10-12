// ========================================================
// pedidos.js - Carrito, pedidos con rebaja de stock y reportes
// ========================================================
import { borrar, escribir, leer } from "./almacen";
import { formatoPesos } from "./formato";
import { obtenerProductos, guardarProductos, UMBRAL_STOCK_BAJO } from "./productos";
import { crearMovimientoCC, cupoDisponible, guardarUsuarios, obtenerUsuarios } from "./usuarios";
import { normalizarCorreo } from "./validaciones";

export const ESTADOS_PEDIDO = ["Pendiente", "En preparación", "Enviado", "Entregado"];

// --------------------------------------------------------
// CARRITO (guardado en localStorage, no requiere cuenta)
// --------------------------------------------------------
// Siempre devuelve el carrito con nombre y precio ACTUALES del producto
// (por si el admin los cambió) y sin productos que ya fueron eliminados.
export function obtenerCarrito() {
  const carrito = leer("carrito_ferreteria", []);
  const productos = obtenerProductos();

  return carrito
    .filter((item) => productos.some((p) => p.id === item.id))
    .map((item) => {
      const p = productos.find((x) => x.id === item.id);
      return { ...item, nombre: p.nombre, precio: p.precio };
    });
}

export function guardarCarrito(carrito) {
  escribir("carrito_ferreteria", carrito);
}

export function vaciarCarrito() {
  borrar("carrito_ferreteria");
}

export function agregarAlCarrito(id, cantidad = 1) {
  const producto = obtenerProductos().find((p) => p.id === id);
  if (!producto) return { exito: false, mensaje: "El producto no existe." };
  if (producto.stock <= 0) return { exito: false, mensaje: `"${producto.nombre}" está agotado.` };

  const carrito = obtenerCarrito();
  const itemExistente = carrito.find((item) => item.id === id);

  const cantidadActual = itemExistente ? itemExistente.cantidad : 0;
  if (cantidadActual + cantidad > producto.stock) {
    return { exito: false, mensaje: `Stock insuficiente. Disponible: ${producto.stock} (ya tienes ${cantidadActual} en el carrito).` };
  }

  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad });
  }

  guardarCarrito(carrito);
  return { exito: true, mensaje: `¡${producto.nombre} agregado al carrito!` };
}

// Botones + / - del carrito. Respeta el stock y elimina el ítem si llega a 0.
export function cambiarCantidadEnCarrito(indice, cambio) {
  const carrito = obtenerCarrito();
  const item = carrito[indice];
  if (!item) return { exito: false, mensaje: "El producto ya no está en el carrito." };

  const producto = obtenerProductos().find((p) => p.id === item.id);
  if (cambio > 0 && item.cantidad + cambio > producto.stock) {
    return { exito: false, mensaje: `Stock insuficiente. Disponible: ${producto.stock}` };
  }

  item.cantidad += cambio;
  if (item.cantidad <= 0) carrito.splice(indice, 1);

  guardarCarrito(carrito);
  return { exito: true };
}

export function eliminarDelCarrito(indice) {
  const carrito = obtenerCarrito();
  carrito.splice(indice, 1);
  guardarCarrito(carrito);
}

export function totalCarrito() {
  return obtenerCarrito().reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

export function cantidadEnCarrito() {
  return obtenerCarrito().reduce((suma, item) => suma + item.cantidad, 0);
}

// --------------------------------------------------------
// PEDIDOS Y REBAJA DE STOCK
// --------------------------------------------------------
export function obtenerPedidos() {
  return leer("pedidos", []);
}

export function guardarPedidos(lista) {
  escribir("pedidos", lista);
}

// Crea UN pedido (un producto) y descuenta el stock.
// "entrega" es opcional: { tipoEntrega, direccion, formaPago } y viene del formulario del carrito.
export function hacerPedido(clienteCorreo, productoId, cantidad, entrega = {}) {
  const productos = obtenerProductos();
  const producto = productos.find((p) => p.id === productoId);

  if (!producto) return { exito: false, mensaje: "El producto no existe." };
  if (producto.stock < cantidad) {
    return { exito: false, mensaje: `Stock insuficiente de "${producto.nombre}" (Disponible: ${producto.stock}).` };
  }

  producto.stock -= cantidad;
  guardarProductos(productos);

  const nuevoPedido = {
    id: Date.now() + Math.floor(Math.random() * 100000),
    clienteCorreo,
    productoId: producto.id,
    productoNombre: producto.nombre,
    cantidad,
    total: producto.precio * cantidad,
    estado: "Pendiente",
    tipoEntrega: entrega.tipoEntrega || "retiro",
    direccion: entrega.direccion || "",
    formaPago: entrega.formaPago || "normal",
    fecha: new Date().toLocaleString("es-CL")
  };

  const pedidos = obtenerPedidos();
  pedidos.push(nuevoPedido);
  guardarPedidos(pedidos);

  return { exito: true, mensaje: "Pedido realizado con éxito.", pedido: nuevoPedido };
}

// Convierte TODO el carrito en pedidos. Primero revisa el stock de todo:
// si falta stock de algo, no se crea ningún pedido (así no quedan pedidos a medias).
// formaPago "cuenta_corriente" suma el total al saldo pendiente del cliente.
export function confirmarCarrito(clienteCorreo, entrega = {}) {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) return { exito: false, mensaje: "Tu carrito está vacío." };

  const productos = obtenerProductos();
  const problemas = [];
  carrito.forEach((item) => {
    const p = productos.find((x) => x.id === item.id);
    if (p.stock < item.cantidad) {
      problemas.push(`• ${item.nombre}: stock insuficiente (disponible: ${p.stock}).`);
    }
  });
  if (problemas.length > 0) {
    return { exito: false, mensaje: "No se pudo confirmar el pedido:\n" + problemas.join("\n") };
  }

  const usuarios = obtenerUsuarios();
  const cliente = usuarios.find((u) => normalizarCorreo(u.correo) === normalizarCorreo(clienteCorreo));
  const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);

  if (entrega.formaPago === "cuenta_corriente") {
    if (!cliente || !cliente.cuentaCorriente) {
      return { exito: false, mensaje: "Tu cuenta no tiene cuenta corriente habilitada." };
    }
    const disponible = cupoDisponible(cliente);
    if (total > disponible) {
      return {
        exito: false,
        mensaje: `Tu cupo disponible en cuenta corriente es ${formatoPesos(disponible)} y este pedido suma ${formatoPesos(total)}. Reduce el pedido o elige otra forma de pago.`
      };
    }
  }

  carrito.forEach((item) => hacerPedido(clienteCorreo, item.id, item.cantidad, entrega));

  if (entrega.formaPago === "cuenta_corriente") {
    cliente.saldoPendiente = (cliente.saldoPendiente || 0) + total;
    cliente.movimientosCC = cliente.movimientosCC || [];
    cliente.movimientosCC.push(crearMovimientoCC("compra", total, `Compra de ${carrito.length} producto(s)`));
    guardarUsuarios(usuarios);
  }

  vaciarCarrito();
  return { exito: true, mensaje: "¡Pedido realizado con éxito! Puedes seguir su estado en tu panel." };
}

// Cambia el estado de un pedido (vendedor y administrador)
export function actualizarEstadoPedido(idPedido, estado) {
  const pedidos = obtenerPedidos();
  const pedido = pedidos.find((p) => p.id === idPedido);
  if (!pedido) return { exito: false, mensaje: "El pedido no existe." };
  if (!ESTADOS_PEDIDO.includes(estado)) return { exito: false, mensaje: "Estado no válido." };
  pedido.estado = estado;
  guardarPedidos(pedidos);
  return { exito: true, mensaje: "Estado actualizado ✔" };
}

// --------------------------------------------------------
// REPORTES (los ve el administrador)
// --------------------------------------------------------
export function generarReportes() {
  const usuarios = obtenerUsuarios();
  const productos = obtenerProductos();
  const pedidos = obtenerPedidos();

  const pedidosPorEstado = {};
  ESTADOS_PEDIDO.forEach((e) => (pedidosPorEstado[e] = 0));
  pedidos.forEach((p) => { pedidosPorEstado[p.estado] = (pedidosPorEstado[p.estado] || 0) + 1; });

  const ventas = {};
  pedidos.forEach((p) => {
    if (!ventas[p.productoId]) ventas[p.productoId] = { nombre: p.productoNombre, unidades: 0, ingresos: 0 };
    ventas[p.productoId].unidades += p.cantidad;
    ventas[p.productoId].ingresos += p.total;
  });

  return {
    ventasTotales: pedidos.reduce((s, p) => s + p.total, 0),
    totalPedidos: pedidos.length,
    pedidosPorEstado,
    usuariosTotal: usuarios.length,
    usuariosActivos: usuarios.filter((u) => u.activo !== false).length,
    usuariosPorRol: {
      admin: usuarios.filter((u) => u.rol === "admin").length,
      vendedor: usuarios.filter((u) => u.rol === "vendedor").length,
      cliente: usuarios.filter((u) => u.rol === "cliente").length
    },
    totalProductos: productos.length,
    unidadesInventario: productos.reduce((s, p) => s + p.stock, 0),
    valorInventario: productos.reduce((s, p) => s + p.precio * p.stock, 0),
    stockBajo: productos.filter((p) => p.stock <= UMBRAL_STOCK_BAJO).sort((a, b) => a.stock - b.stock),
    masVendidos: Object.values(ventas).sort((a, b) => b.unidades - a.unidades).slice(0, 5),
    saldoCuentasCorrientes: usuarios.filter((u) => u.cuentaCorriente).reduce((s, u) => s + (u.saldoPendiente || 0), 0),
    clientesConCuentaCorriente: usuarios.filter((u) => u.cuentaCorriente).length,
    cupoTotalOtorgado: usuarios.filter((u) => u.cuentaCorriente).reduce((s, u) => s + (u.cupoCuentaCorriente || 0), 0)
  };
}
