import {
  agregarAlCarrito, cambiarCantidadEnCarrito, confirmarCarrito, generarReportes, obtenerCarrito,
  obtenerPedidos, totalCarrito, actualizarEstadoPedido
} from "./pedidos";
import { guardarProductos, obtenerProductos, PRODUCTOS_DE_EJEMPLO } from "./productos";
import { asegurarCuentasDemo, obtenerUsuarios } from "./usuarios";

const cliente = () => obtenerUsuarios().find((u) => u.correo === "cliente@maestros.cl");

describe("pedidos: carrito", () => {
  beforeEach(() => {
    localStorage.clear();
    asegurarCuentasDemo();
    guardarProductos(PRODUCTOS_DE_EJEMPLO);
  });

  it("agrega un producto y suma cantidades si ya estaba", () => {
    agregarAlCarrito(3, 1);
    agregarAlCarrito(3, 2);
    expect(obtenerCarrito().length).toBe(1);
    expect(obtenerCarrito()[0].cantidad).toBe(3);
    expect(totalCarrito()).toBe(3 * 8990);
  });

  it("no deja superar el stock disponible", () => {
    const res = agregarAlCarrito(6, 6); // stock del producto 6 = 5
    expect(res.exito).toBeFalse();
    expect(res.mensaje).toContain("Stock insuficiente");
    expect(obtenerCarrito().length).toBe(0);
  });

  it("no permite agregar un producto agotado ni uno inexistente", () => {
    const productos = obtenerProductos();
    productos.find((p) => p.id === 3).stock = 0;
    guardarProductos(productos);
    expect(agregarAlCarrito(3, 1).mensaje).toContain("agotado");
    expect(agregarAlCarrito(999, 1).mensaje).toBe("El producto no existe.");
  });

  it("los botones + y - cambian la cantidad y quitan el producto al llegar a 0", () => {
    agregarAlCarrito(3, 1);
    cambiarCantidadEnCarrito(0, 1);
    expect(obtenerCarrito()[0].cantidad).toBe(2);
    cambiarCantidadEnCarrito(0, -1);
    cambiarCantidadEnCarrito(0, -1);
    expect(obtenerCarrito().length).toBe(0);
  });
});

describe("pedidos: confirmar compra", () => {
  beforeEach(() => {
    localStorage.clear();
    asegurarCuentasDemo();
    guardarProductos(PRODUCTOS_DE_EJEMPLO);
  });

  it("crea los pedidos, descuenta el stock y vacía el carrito", () => {
    agregarAlCarrito(3, 2);
    const res = confirmarCarrito("cliente@maestros.cl", { tipoEntrega: "retiro" });
    expect(res.exito).toBeTrue();
    expect(obtenerPedidos().length).toBe(1);
    expect(obtenerPedidos()[0].total).toBe(2 * 8990);
    expect(obtenerProductos().find((p) => p.id === 3).stock).toBe(12);
    expect(obtenerCarrito().length).toBe(0);
  });

  it("con carrito vacío no crea nada", () => {
    const res = confirmarCarrito("cliente@maestros.cl");
    expect(res.exito).toBeFalse();
    expect(res.mensaje).toBe("Tu carrito está vacío.");
  });

  it("si el stock cambió y ya no alcanza, no crea pedidos a medias", () => {
    agregarAlCarrito(3, 2);
    agregarAlCarrito(2, 1);
    const productos = obtenerProductos();
    productos.find((p) => p.id === 2).stock = 0; // alguien más compró el último
    guardarProductos(productos);

    const res = confirmarCarrito("cliente@maestros.cl");
    expect(res.exito).toBeFalse();
    expect(res.mensaje).toContain("stock insuficiente");
    expect(obtenerPedidos().length).toBe(0);
    expect(obtenerProductos().find((p) => p.id === 3).stock).toBe(14);
  });

  it("pagar con cuenta corriente suma el total al saldo pendiente", () => {
    agregarAlCarrito(3, 1); // $8.990
    const res = confirmarCarrito("cliente@maestros.cl", { formaPago: "cuenta_corriente" });
    expect(res.exito).toBeTrue();
    expect(cliente().saldoPendiente).toBe(15000 + 8990);
    expect(cliente().movimientosCC.slice(-1)[0].tipo).toBe("compra");
  });

  it("no deja comprar con cuenta corriente si supera el cupo disponible", () => {
    agregarAlCarrito(2, 1); // $45.990 > cupo disponible $25.000
    const res = confirmarCarrito("cliente@maestros.cl", { formaPago: "cuenta_corriente" });
    expect(res.exito).toBeFalse();
    expect(res.mensaje).toContain("cupo disponible");
    expect(cliente().saldoPendiente).toBe(15000);
  });

  it("el vendedor puede cambiar el estado de un pedido", () => {
    agregarAlCarrito(3, 1);
    confirmarCarrito("cliente@maestros.cl");
    const id = obtenerPedidos()[0].id;
    expect(actualizarEstadoPedido(id, "Enviado").exito).toBeTrue();
    expect(obtenerPedidos()[0].estado).toBe("Enviado");
    expect(actualizarEstadoPedido(id, "Inventado").exito).toBeFalse();
  });

  it("los reportes suman ventas y detectan stock bajo", () => {
    agregarAlCarrito(3, 2);
    confirmarCarrito("cliente@maestros.cl");
    const r = generarReportes();
    expect(r.totalPedidos).toBe(1);
    expect(r.ventasTotales).toBe(2 * 8990);
    expect(r.pedidosPorEstado["Pendiente"]).toBe(1);
    expect(r.masVendidos[0].unidades).toBe(2);
    expect(r.stockBajo.length).toBeGreaterThan(0);
  });
});
