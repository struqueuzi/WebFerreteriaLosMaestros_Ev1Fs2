// ========================================================
// pedidos.js - Carrito, pedidos con rebaja de stock, historial de ventas y reportes
// ========================================================
import { borrar, escribir, leer } from "./almacen";
import { formatoPesos } from "./formato";
import { descuentoDe, obtenerProductos, guardarProductos, precioFinal, UMBRAL_STOCK_BAJO } from "./productos";
import { obtenerDatosTransferencia } from "./transferencia";
import { crearMovimientoCC, cupoDisponible, guardarUsuarios, obtenerUsuarios } from "./usuarios";
import { normalizarCorreo } from "./validaciones";

export const ESTADOS_PEDIDO = ["Pendiente", "En preparación", "Enviado", "Entregado"];

// Formas de pago que acepta la tienda (la cuenta corriente solo aparece si el cliente la tiene habilitada)
export const FORMAS_DE_PAGO = {
  normal: "Pago en tienda / contra entrega",
  transferencia: "Transferencia bancaria",
  cuenta_corriente: "Cuenta corriente"
};

// Estado del pago cuando el cliente eligió transferencia (lo cambia el administrador)
export const ESTADOS_PAGO_TRANSFERENCIA = ["Por confirmar", "Confirmado", "Rechazado"];

export function nombreFormaPago(formaPago) {
  return FORMAS_DE_PAGO[formaPago] || FORMAS_DE_PAGO.normal;
}

// --------------------------------------------------------
// CARRITO (guardado en localStorage, no requiere cuenta)
// --------------------------------------------------------
// Siempre devuelve el carrito con nombre y precio ACTUALES del producto (con descuento si tiene)
// (por si el admin los cambió) y sin productos que ya fueron eliminados.
export function obtenerCarrito() {
  const carrito = leer("carrito_ferreteria", []);
  const productos = obtenerProductos();

  return carrito
    .filter((item) => productos.some((p) => p.id === item.id))
    .map((item) => {
      const p = productos.find((x) => x.id === item.id);
      return { ...item, nombre: p.nombre, precio: precioFinal(p), precioNormal: p.precio, descuento: descuentoDe(p) };
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
    carrito.push({ id: producto.id, nombre: producto.nombre, precio: precioFinal(producto), cantidad });
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
    total: precioFinal(producto) * cantidad,
    descuento: descuentoDe(producto),
    estado: "Pendiente",
    tipoEntrega: entrega.tipoEntrega || "retiro",
    direccion: entrega.direccion || "",
    formaPago: entrega.formaPago || "normal",
    fecha: new Date().toLocaleString("es-CL"),
    fechaISO: new Date().toISOString()
  };

  // Todos los productos de una misma compra comparten el número de venta
  if (entrega.numeroVenta) nuevoPedido.numeroVenta = entrega.numeroVenta;
  if (nuevoPedido.formaPago === "transferencia") {
    nuevoPedido.estadoPago = "Por confirmar";
    nuevoPedido.datosTransferencia = entrega.datosTransferencia || obtenerDatosTransferencia();
  }

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

  // Número de venta: agrupa todos los productos de esta compra (sirve como referencia de la transferencia)
  const numeroVenta = siguienteNumeroVenta();
  const formaPago = FORMAS_DE_PAGO[entrega.formaPago] ? entrega.formaPago : "normal";
  const datosTransferencia = formaPago === "transferencia" ? obtenerDatosTransferencia() : undefined;
  carrito.forEach((item) => hacerPedido(clienteCorreo, item.id, item.cantidad, { ...entrega, formaPago, numeroVenta, datosTransferencia }));

  if (entrega.formaPago === "cuenta_corriente") {
    cliente.saldoPendiente = (cliente.saldoPendiente || 0) + total;
    cliente.movimientosCC = cliente.movimientosCC || [];
    cliente.movimientosCC.push(crearMovimientoCC("compra", total, `Compra de ${carrito.length} producto(s)`));
    guardarUsuarios(usuarios);
  }

  vaciarCarrito();
  const mensaje = formaPago === "transferencia"
    ? `¡Pedido N° ${numeroVenta} registrado! Transfiere ${formatoPesos(total)} para que lo preparemos.`
    : "¡Pedido realizado con éxito! Puedes seguir su estado en tu panel.";
  return { exito: true, mensaje, numeroVenta, total, formaPago, datosTransferencia };
}

// Números de venta correlativos (1001, 1002, ...) para que sean fáciles de dictar o escribir
export function siguienteNumeroVenta() {
  const usados = obtenerPedidos().map((p) => p.numeroVenta || 0);
  const ultimo = Math.max(1000, leer("ultimo_numero_venta", 1000), ...usados);
  escribir("ultimo_numero_venta", ultimo + 1);
  return ultimo + 1;
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
// --------------------------------------------------------
// HISTORIAL DE VENTAS
// Un "pedido" es una línea (un producto). Una "venta" junta todas las líneas de la misma compra.
// --------------------------------------------------------
const ORDEN_ESTADO = Object.fromEntries(ESTADOS_PEDIDO.map((e, i) => [e, i]));

export function agruparVentas(pedidos = obtenerPedidos()) {
  const mapa = new Map();
  pedidos.forEach((p) => {
    // Los pedidos antiguos (antes de existir numeroVenta) quedan como una venta cada uno
    const clave = p.numeroVenta || p.id;
    if (!mapa.has(clave)) {
      mapa.set(clave, {
        numeroVenta: clave,
        fecha: p.fecha,
        fechaISO: p.fechaISO || null,
        clienteCorreo: p.clienteCorreo,
        tipoEntrega: p.tipoEntrega,
        direccion: p.direccion,
        formaPago: p.formaPago || "normal",
        estadoPago: p.estadoPago || null,
        datosTransferencia: p.datosTransferencia || null,
        items: [],
        unidades: 0,
        total: 0,
        estado: p.estado
      });
    }
    const venta = mapa.get(clave);
    venta.items.push({ idPedido: p.id, productoId: p.productoId, productoNombre: p.productoNombre, cantidad: p.cantidad, total: p.total, estado: p.estado });
    venta.unidades += p.cantidad;
    venta.total += p.total;
    // El estado de la venta es el del producto más atrasado (si uno sigue "Pendiente", la venta también)
    if ((ORDEN_ESTADO[p.estado] ?? 0) < (ORDEN_ESTADO[venta.estado] ?? 0)) venta.estado = p.estado;
  });
  return [...mapa.values()].sort((a, b) => fechaDeVenta(b) - fechaDeVenta(a) || b.numeroVenta - a.numeroVenta);
}

// Fecha como número (para ordenar y filtrar). Si no hay fechaISO se usa el id, que nace de Date.now()
export function fechaDeVenta(venta) {
  if (venta.fechaISO) return new Date(venta.fechaISO).getTime();
  const id = venta.items && venta.items[0] ? venta.items[0].idPedido : venta.numeroVenta;
  return Number(id) || 0;
}

export function ventasDelCliente(correo) {
  return agruparVentas().filter((v) => normalizarCorreo(v.clienteCorreo) === normalizarCorreo(correo));
}

// filtros: { texto, formaPago, estado, estadoPago, desde, hasta }  (desde / hasta en formato "AAAA-MM-DD")
export function filtrarVentas(ventas, filtros = {}) {
  const t = (filtros.texto || "").toLowerCase().trim();
  const desde = filtros.desde ? new Date(`${filtros.desde}T00:00:00`).getTime() : null;
  const hasta = filtros.hasta ? new Date(`${filtros.hasta}T23:59:59`).getTime() : null;

  return ventas.filter((v) => {
    if (filtros.formaPago && v.formaPago !== filtros.formaPago) return false;
    if (filtros.estado && v.estado !== filtros.estado) return false;
    if (filtros.estadoPago && v.estadoPago !== filtros.estadoPago) return false;
    const f = fechaDeVenta(v);
    if (desde !== null && f < desde) return false;
    if (hasta !== null && f > hasta) return false;
    if (t) {
      const enTexto = String(v.numeroVenta).includes(t)
        || v.clienteCorreo.toLowerCase().includes(t)
        || v.items.some((i) => i.productoNombre.toLowerCase().includes(t));
      if (!enTexto) return false;
    }
    return true;
  });
}

export function resumenVentas(ventas) {
  const validas = ventas.filter((v) => v.estadoPago !== "Rechazado");
  const total = validas.reduce((s, v) => s + v.total, 0);
  return {
    cantidad: validas.length,
    total,
    promedio: validas.length ? Math.round(total / validas.length) : 0,
    unidades: validas.reduce((s, v) => s + v.unidades, 0),
    porConfirmar: ventas.filter((v) => v.estadoPago === "Por confirmar").length
  };
}

// Orden del historial: "recientes" (por defecto), "antiguas", "mayor" o "menor" monto
export function ordenarVentas(ventas, orden = "recientes") {
  const copia = [...ventas];
  if (orden === "antiguas") return copia.sort((a, b) => fechaDeVenta(a) - fechaDeVenta(b) || a.numeroVenta - b.numeroVenta);
  if (orden === "mayor") return copia.sort((a, b) => b.total - a.total);
  if (orden === "menor") return copia.sort((a, b) => a.total - b.total);
  return copia.sort((a, b) => fechaDeVenta(b) - fechaDeVenta(a) || b.numeroVenta - a.numeroVenta);
}

// Fecha local en formato AAAA-MM-DD (toISOString usaría la hora UTC y en Chile puede cambiar el día)
export function fechaLocal(fecha = new Date()) {
  const dos = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}

// Rangos rápidos para los filtros de fecha: "7" y "30" días, "mes" (este mes) o "anio" (este año)
export function rangoRapido(tipo, hoy = new Date()) {
  const hasta = fechaLocal(hoy);
  if (tipo === "7" || tipo === "30") {
    const desde = new Date(hoy);
    desde.setDate(desde.getDate() - (Number(tipo) - 1));
    return { desde: fechaLocal(desde), hasta };
  }
  if (tipo === "mes") return { desde: fechaLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), hasta };
  if (tipo === "anio") return { desde: fechaLocal(new Date(hoy.getFullYear(), 0, 1)), hasta };
  return { desde: "", hasta: "" };
}

// Los pedidos que se hicieron antes de existir el número de venta quedaban con el id largo
// (ej: 1791778130267). Esto les da un número corto correlativo, una sola vez.
export function numerarPedidosAntiguos() {
  const pedidos = obtenerPedidos();
  // se numeran del más antiguo al más nuevo (fechaISO si existe; si no, el id, que nace de Date.now())
  const momento = (p) => (p.fechaISO ? Date.parse(p.fechaISO) : p.id);
  const sinNumero = pedidos.filter((p) => !p.numeroVenta).sort((a, b) => momento(a) - momento(b));
  if (sinNumero.length === 0) return 0;

  let ultimo = Math.max(1000, leer("ultimo_numero_venta", 1000), ...pedidos.map((p) => p.numeroVenta || 0));
  sinNumero.forEach((p) => {
    ultimo += 1;
    p.numeroVenta = ultimo;
  });
  escribir("ultimo_numero_venta", ultimo);
  guardarPedidos(pedidos);
  return sinNumero.length;
}

// El administrador confirma o rechaza la transferencia de una venta.
// Si la rechaza, el stock de esos productos vuelve al inventario.
export function resolverPagoTransferencia(numeroVenta, aprobar) {
  const pedidos = obtenerPedidos();
  const lineas = pedidos.filter((p) => (p.numeroVenta || p.id) === numeroVenta && p.formaPago === "transferencia");
  if (lineas.length === 0) return { exito: false, mensaje: "No se encontró esa venta con transferencia." };
  if (lineas[0].estadoPago !== "Por confirmar") return { exito: false, mensaje: "Este pago ya fue revisado." };

  lineas.forEach((p) => { p.estadoPago = aprobar ? "Confirmado" : "Rechazado"; });

  if (!aprobar) {
    const productos = obtenerProductos();
    lineas.forEach((p) => {
      const prod = productos.find((x) => x.id === p.productoId);
      if (prod) prod.stock += p.cantidad;
    });
    guardarProductos(productos);
  }

  guardarPedidos(pedidos);
  return {
    exito: true,
    mensaje: aprobar ? `Pago de la venta N° ${numeroVenta} confirmado ✔` : `Pago de la venta N° ${numeroVenta} rechazado. El stock volvió al inventario.`
  };
}

// Archivo CSV (se abre en Excel) con el historial que se está viendo
export function ventasACsv(ventas) {
  const celda = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const encabezado = ["N° venta", "Fecha", "Cliente", "Productos", "Unidades", "Entrega", "Forma de pago", "Estado del pago", "Estado", "Total"];
  const filas = ventas.map((v) => [
    v.numeroVenta,
    v.fecha,
    v.clienteCorreo,
    v.items.map((i) => `${i.productoNombre} x${i.cantidad}`).join(" | "),
    v.unidades,
    v.tipoEntrega === "despacho" ? `Despacho: ${v.direccion}` : "Retiro en tienda",
    nombreFormaPago(v.formaPago),
    v.estadoPago || "-",
    v.estado,
    v.total
  ]);
  return [encabezado, ...filas].map((f) => f.map(celda).join(";")).join("\n");
}

export function generarReportes() {
  const usuarios = obtenerUsuarios();
  const productos = obtenerProductos();
  // Las ventas con la transferencia rechazada no cuentan como venta
  const pedidos = obtenerPedidos().filter((p) => p.estadoPago !== "Rechazado");

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
    cupoTotalOtorgado: usuarios.filter((u) => u.cuentaCorriente).reduce((s, u) => s + (u.cupoCuentaCorriente || 0), 0),
    transferenciasPorConfirmar: agruparVentas().filter((v) => v.estadoPago === "Por confirmar").length
  };
}
