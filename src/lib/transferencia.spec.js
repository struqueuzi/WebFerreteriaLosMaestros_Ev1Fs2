import {
  DATOS_TRANSFERENCIA_POR_DEFECTO, guardarDatosTransferencia, obtenerDatosTransferencia,
  restablecerDatosTransferencia, textoDatosTransferencia, validarDatosTransferencia
} from "./transferencia";

describe("transferencia: datos de la cuenta", () => {
  beforeEach(() => localStorage.clear());

  it("sin datos guardados entrega los de ejemplo", () => {
    expect(obtenerDatosTransferencia()).toEqual(DATOS_TRANSFERENCIA_POR_DEFECTO);
  });

  it("los datos de ejemplo pasan la validación", () => {
    expect(validarDatosTransferencia(DATOS_TRANSFERENCIA_POR_DEFECTO)).toEqual({});
  });

  it("no guarda datos inválidos y dice qué campo está mal", () => {
    const res = guardarDatosTransferencia({ banco: "", tipoCuenta: "Otra", numeroCuenta: "12ab", titular: "J", rut: "123", correo: "malo" });
    expect(res.exito).toBeFalse();
    expect(Object.keys(res.errores)).toEqual(["banco", "tipoCuenta", "numeroCuenta", "titular", "rut", "correo"]);
    expect(obtenerDatosTransferencia()).toEqual(DATOS_TRANSFERENCIA_POR_DEFECTO);
  });

  it("el administrador guarda una cuenta nueva", () => {
    const res = guardarDatosTransferencia({ ...DATOS_TRANSFERENCIA_POR_DEFECTO, banco: "Banco de Chile", numeroCuenta: "0012 3456 78", correo: "Caja@LosMaestros.cl" });
    expect(res.exito).toBeTrue();
    const datos = obtenerDatosTransferencia();
    expect(datos.banco).toBe("Banco de Chile");
    expect(datos.numeroCuenta).toBe("0012345678");
    expect(datos.correo).toBe("caja@losmaestros.cl");
  });

  it("restablecer vuelve a los datos de ejemplo", () => {
    guardarDatosTransferencia({ ...DATOS_TRANSFERENCIA_POR_DEFECTO, banco: "Tenpo" });
    restablecerDatosTransferencia();
    expect(obtenerDatosTransferencia().banco).toBe(DATOS_TRANSFERENCIA_POR_DEFECTO.banco);
  });

  it("arma el texto para copiar con monto y número de pedido", () => {
    const texto = textoDatosTransferencia(DATOS_TRANSFERENCIA_POR_DEFECTO, 8990, 1001);
    expect(texto).toContain("N° de cuenta: 29870014563");
    expect(texto).toContain("Monto: $8.990");
    expect(texto).toContain("Pedido N° 1001");
  });
});
