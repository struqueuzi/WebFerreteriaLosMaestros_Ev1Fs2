import {
  agregarAlCarrito, agruparVentas, confirmarCarrito, filtrarVentas, guardarPedidos, numerarPedidosAntiguos,
  obtenerPedidos, ordenarVentas, rangoRapido
} from "./pedidos";
import { guardarProductos, PRODUCTOS_DE_EJEMPLO } from "./productos";
import { asegurarCuentasDemo } from "./usuarios";

describe("pedidos: historial 'Mis compras'", () => {
  beforeEach(() => {
    localStorage.clear();
    asegurarCuentasDemo();
    guardarProductos(PRODUCTOS_DE_EJEMPLO);
  });

  it("los rangos rápidos arman las fechas correctas", () => {
    const hoy = new Date(2026, 10, 9); // 9 de noviembre de 2026
    expect(rangoRapido("7", hoy)).toEqual({ desde: "2026-11-03", hasta: "2026-11-09" });
    expect(rangoRapido("30", hoy)).toEqual({ desde: "2026-10-11", hasta: "2026-11-09" });
    expect(rangoRapido("mes", hoy)).toEqual({ desde: "2026-11-01", hasta: "2026-11-09" });
    expect(rangoRapido("anio", hoy)).toEqual({ desde: "2026-01-01", hasta: "2026-11-09" });
    expect(rangoRapido("todo", hoy)).toEqual({ desde: "", hasta: "" });
  });

  it("ordena por fecha y por monto", () => {
    agregarAlCarrito(3, 1); // $8.990
    confirmarCarrito("cliente@maestros.cl");
    agregarAlCarrito(2, 1); // $45.990
    confirmarCarrito("cliente@maestros.cl");
    const ventas = agruparVentas();
    expect(ordenarVentas(ventas, "recientes")[0].numeroVenta).toBe(1002);
    expect(ordenarVentas(ventas, "antiguas")[0].numeroVenta).toBe(1001);
    expect(ordenarVentas(ventas, "mayor")[0].total).toBe(45990);
    expect(ordenarVentas(ventas, "menor")[0].total).toBe(8990);
  });

  it("filtra por estado del pago", () => {
    agregarAlCarrito(3, 1);
    confirmarCarrito("cliente@maestros.cl", { formaPago: "transferencia" });
    agregarAlCarrito(1, 1);
    confirmarCarrito("cliente@maestros.cl");
    expect(filtrarVentas(agruparVentas(), { estadoPago: "Por confirmar" }).length).toBe(1);
  });

  it("a los pedidos antiguos sin número les pone uno corto, una sola vez", () => {
    guardarPedidos([
      { id: 1791778130267, clienteCorreo: "cliente@maestros.cl", productoId: 3, productoNombre: "Martillo", cantidad: 1, total: 8990, estado: "Pendiente" },
      { id: 1791778000000, clienteCorreo: "cliente@maestros.cl", productoId: 1, productoNombre: "Cemento", cantidad: 1, total: 4890, estado: "Entregado" }
    ]);
    expect(numerarPedidosAntiguos()).toBe(2);
    const numeros = obtenerPedidos().map((p) => p.numeroVenta).sort();
    expect(numeros).toEqual([1001, 1002]);
    expect(obtenerPedidos().find((p) => p.id === 1791778000000).numeroVenta).toBe(1001); // el más viejo primero
    expect(numerarPedidosAntiguos()).toBe(0);

    agregarAlCarrito(2, 1);
    expect(confirmarCarrito("cliente@maestros.cl").numeroVenta).toBe(1003); // sigue la numeración
  });
});
