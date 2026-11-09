import {
  agregarAlCarrito, agruparVentas, confirmarCarrito, filtrarVentas, generarReportes,
  obtenerPedidos, resolverPagoTransferencia, resumenVentas, ventasACsv, ventasDelCliente
} from "./pedidos";
import { guardarProductos, obtenerProductos, PRODUCTOS_DE_EJEMPLO } from "./productos";
import { asegurarCuentasDemo } from "./usuarios";

describe("pedidos: transferencia e historial de ventas", () => {
  beforeEach(() => {
    localStorage.clear();
    asegurarCuentasDemo();
    guardarProductos(PRODUCTOS_DE_EJEMPLO);
  });

  it("al pagar con transferencia la venta queda 'Por confirmar' y guarda la cuenta informada", () => {
    agregarAlCarrito(3, 1);
    const res = confirmarCarrito("cliente@maestros.cl", { formaPago: "transferencia" });
    expect(res.exito).toBeTrue();
    expect(res.numeroVenta).toBe(1001);
    expect(res.mensaje).toContain("Transfiere $8.990");
    const pedido = obtenerPedidos()[0];
    expect(pedido.estadoPago).toBe("Por confirmar");
    expect(pedido.datosTransferencia.numeroCuenta).toBeTruthy();
  });

  it("todos los productos de una compra quedan en la misma venta", () => {
    agregarAlCarrito(3, 2);
    agregarAlCarrito(1, 1);
    confirmarCarrito("cliente@maestros.cl");
    const ventas = agruparVentas();
    expect(obtenerPedidos().length).toBe(2);
    expect(ventas.length).toBe(1);
    expect(ventas[0].items.length).toBe(2);
    expect(ventas[0].total).toBe(2 * 8990 + 4890);
  });

  it("los números de venta son correlativos", () => {
    agregarAlCarrito(3, 1);
    confirmarCarrito("cliente@maestros.cl");
    agregarAlCarrito(1, 1);
    const res = confirmarCarrito("cliente@maestros.cl");
    expect(res.numeroVenta).toBe(1002);
    expect(agruparVentas()[0].numeroVenta).toBe(1002); // la más nueva primero
  });

  it("filtra por forma de pago, texto y fecha", () => {
    agregarAlCarrito(3, 1);
    confirmarCarrito("cliente@maestros.cl", { formaPago: "transferencia" });
    agregarAlCarrito(2, 1);
    confirmarCarrito("cliente@maestros.cl");
    const todas = agruparVentas();
    expect(filtrarVentas(todas, { formaPago: "transferencia" }).length).toBe(1);
    expect(filtrarVentas(todas, { texto: "rotomartillo" }).length).toBe(1);
    expect(filtrarVentas(todas, { texto: "1001" }).length).toBe(1);
    expect(filtrarVentas(todas, { hasta: "2020-01-01" }).length).toBe(0);
  });

  it("el cliente solo ve sus compras", () => {
    agregarAlCarrito(3, 1);
    confirmarCarrito("cliente@maestros.cl");
    expect(ventasDelCliente("cliente@maestros.cl").length).toBe(1);
    expect(ventasDelCliente("otro@correo.cl").length).toBe(0);
  });

  it("confirmar la transferencia cambia el estado del pago", () => {
    agregarAlCarrito(3, 1);
    confirmarCarrito("cliente@maestros.cl", { formaPago: "transferencia" });
    expect(resolverPagoTransferencia(1001, true).exito).toBeTrue();
    expect(obtenerPedidos()[0].estadoPago).toBe("Confirmado");
    expect(resolverPagoTransferencia(1001, true).exito).toBeFalse(); // ya estaba revisada
  });

  it("rechazar la transferencia devuelve el stock y no cuenta como venta", () => {
    agregarAlCarrito(3, 2);
    confirmarCarrito("cliente@maestros.cl", { formaPago: "transferencia" });
    expect(obtenerProductos().find((p) => p.id === 3).stock).toBe(12);
    resolverPagoTransferencia(1001, false);
    expect(obtenerProductos().find((p) => p.id === 3).stock).toBe(14);
    expect(generarReportes().ventasTotales).toBe(0);
    expect(resumenVentas(agruparVentas()).cantidad).toBe(0);
  });

  it("el CSV trae el encabezado y una fila por venta", () => {
    agregarAlCarrito(3, 1);
    confirmarCarrito("cliente@maestros.cl");
    const lineas = ventasACsv(agruparVentas()).split("\n");
    expect(lineas.length).toBe(2);
    expect(lineas[0]).toContain("N° venta");
    expect(lineas[1]).toContain("Martillo de Carpintero 16oz x1");
  });
});
