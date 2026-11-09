import { agregarAlCarrito, confirmarCarrito } from "./pedidos";
import { guardarProductos, PRODUCTOS_DE_EJEMPLO } from "./productos";
import {
  asegurarCuentasDemo, cartolaCuentaCorriente, obtenerAbonos, obtenerUsuarios, resolverAbono,
  resumenCuentaCorriente, solicitarAbono
} from "./usuarios";

const cliente = () => obtenerUsuarios().find((u) => u.correo === "cliente@maestros.cl");

describe("cuenta corriente: medios de pago y cartola", () => {
  beforeEach(() => {
    localStorage.clear();
    asegurarCuentasDemo();
    guardarProductos(PRODUCTOS_DE_EJEMPLO);
  });

  it("el abono guarda el medio de pago y el admin lo ve", () => {
    solicitarAbono(cliente().id, 5000, "", "debito");
    expect(obtenerAbonos()[0].medio).toBe("debito");
  });

  it("si no se indica el medio queda como efectivo", () => {
    solicitarAbono(cliente().id, 5000);
    expect(obtenerAbonos()[0].medio).toBe("efectivo");
  });

  it("rechaza un medio de pago que no existe", () => {
    const res = solicitarAbono(cliente().id, 5000, "", "cheque");
    expect(res.exito).toBeFalse();
    expect(obtenerAbonos().length).toBe(0);
  });

  it("la cartola calcula el saldo después de cada movimiento", () => {
    agregarAlCarrito(3, 1); // compra de $8.990 con la cuenta corriente
    confirmarCarrito("cliente@maestros.cl", { formaPago: "cuenta_corriente" });
    solicitarAbono(cliente().id, 4000, "", "credito");
    resolverAbono(obtenerAbonos()[0].id, true);

    const lineas = cartolaCuentaCorriente(cliente());
    expect(lineas.map((l) => l.saldo)).toEqual([15000, 23990, 19990]);
    expect(lineas[1].cargo).toBe(8990);
    expect(lineas[2].abono).toBe(4000);
    expect(lineas[2].medio).toBe("credito");
    expect(lineas[lineas.length - 1].saldo).toBe(cliente().saldoPendiente);
  });

  it("el resumen suma cargos, abonos y separa por medio de pago", () => {
    solicitarAbono(cliente().id, 3000, "", "efectivo");
    solicitarAbono(cliente().id, 2000, "", "transferencia");
    obtenerAbonos().forEach((a) => resolverAbono(a.id, true));

    const r = resumenCuentaCorriente(cliente());
    expect(r.totalCargos).toBe(15000); // saldo inicial
    expect(r.totalAbonos).toBe(5000);
    expect(r.porMedio.efectivo).toBe(3000);
    expect(r.porMedio.transferencia).toBe(2000);
    expect(r.porMedio.debito).toBe(0);
  });

  it("si el saldo guardado no calza con los movimientos, agrega una línea de saldo anterior", () => {
    const u = { ...cliente(), saldoPendiente: 20000, movimientosCC: [{ fecha: "x", tipo: "abono", monto: -1000, detalle: "viejo" }] };
    const lineas = cartolaCuentaCorriente(u);
    expect(lineas[0].tipo).toBe("anterior");
    expect(lineas[0].saldo).toBe(21000);
    expect(lineas[1].medio).toBe("sin_dato");
    expect(lineas[1].saldo).toBe(20000);
  });
});
