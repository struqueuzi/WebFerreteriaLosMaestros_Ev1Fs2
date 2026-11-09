import { agregarAlCarrito, confirmarCarrito, obtenerCarrito, obtenerPedidos, totalCarrito } from "./pedidos";
import {
  descuentoDe, estaEnOferta, filtrarProductos, guardarProductos, mensajeErrorDescuento,
  obtenerProductos, precioFinal, productosDestacados, PRODUCTOS_DE_EJEMPLO
} from "./productos";
import { asegurarCuentasDemo } from "./usuarios";

describe("productos: ofertas y novedades", () => {
  const martillo = PRODUCTOS_DE_EJEMPLO.find((p) => p.id === 3); // $8.990

  it("sin descuento el precio final es el normal", () => {
    expect(precioFinal(martillo)).toBe(8990);
    expect(estaEnOferta(martillo)).toBeFalse();
  });

  it("aplica el descuento y redondea a la decena", () => {
    expect(precioFinal({ ...martillo, descuento: 15 })).toBe(7640); // 7641,5 -> 7640
    expect(precioFinal({ ...martillo, descuento: 30 })).toBe(6290);
  });

  it("el descuento queda entre 0 y 90", () => {
    expect(descuentoDe({ descuento: -5 })).toBe(0);
    expect(descuentoDe({ descuento: 150 })).toBe(90);
    expect(descuentoDe({})).toBe(0);
  });

  it("valida lo que escribe el admin", () => {
    expect(mensajeErrorDescuento("")).toBe("");
    expect(mensajeErrorDescuento("25")).toBe("");
    expect(mensajeErrorDescuento("12.5")).toContain("entero");
    expect(mensajeErrorDescuento("95")).toContain("90%");
  });

  it("filtra solo ofertas o solo nuevos", () => {
    const lista = PRODUCTOS_DE_EJEMPLO.map((p) => (p.id === 3 ? { ...p, descuento: 10 } : p.id === 6 ? { ...p, esNuevo: true } : p));
    expect(filtrarProductos(lista, { especial: "ofertas" }).map((p) => p.id)).toEqual([3]);
    expect(filtrarProductos(lista, { especial: "nuevos" }).map((p) => p.id)).toEqual([6]);
  });

  it("los destacados ponen primero las ofertas y después los nuevos", () => {
    const lista = PRODUCTOS_DE_EJEMPLO.map((p) => (p.id === 4 ? { ...p, descuento: 10 } : p.id === 6 ? { ...p, esNuevo: true } : p));
    const ids = productosDestacados(lista, 3).map((p) => p.id);
    expect(ids[0]).toBe(4);
    expect(ids[1]).toBe(6);
    expect(ids.length).toBe(3);
  });
});

describe("pedidos: se cobra el precio con descuento", () => {
  beforeEach(() => {
    localStorage.clear();
    asegurarCuentasDemo();
    guardarProductos(PRODUCTOS_DE_EJEMPLO.map((p) => (p.id === 3 ? { ...p, descuento: 15 } : p)));
  });

  it("el carrito usa el precio final y guarda el precio normal para mostrarlo tachado", () => {
    agregarAlCarrito(3, 2);
    const item = obtenerCarrito()[0];
    expect(item.precio).toBe(7640);
    expect(item.precioNormal).toBe(8990);
    expect(item.descuento).toBe(15);
    expect(totalCarrito()).toBe(2 * 7640);
  });

  it("si el admin cambia el descuento, el carrito se actualiza solo", () => {
    agregarAlCarrito(3, 1);
    const productos = obtenerProductos();
    productos.find((p) => p.id === 3).descuento = 0;
    guardarProductos(productos);
    expect(totalCarrito()).toBe(8990);
  });

  it("el pedido queda con el total rebajado y el % de descuento", () => {
    agregarAlCarrito(3, 1);
    confirmarCarrito("cliente@maestros.cl");
    expect(obtenerPedidos()[0].total).toBe(7640);
    expect(obtenerPedidos()[0].descuento).toBe(15);
  });
});
