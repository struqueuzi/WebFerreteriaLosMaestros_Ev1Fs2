import {
  mensajeErrorClave, mensajeErrorCorreo, mensajeErrorMontoEntero, mensajeErrorNombre, mensajeErrorRut,
  mensajeErrorTelefono, normalizarCorreo, normalizarRut, normalizarTelefono, validarRut, validarTelefono
} from "./validaciones";

describe("validaciones: RUT", () => {
  it("acepta un RUT con dígito verificador correcto", () => {
    expect(validarRut("12345678-5")).toBeTrue();
    expect(validarRut("11111111-1")).toBeTrue();
  });

  it("rechaza un RUT con dígito verificador incorrecto", () => {
    expect(validarRut("12345678-9")).toBeFalse();
  });

  it("acepta puntos y los ignora al normalizar", () => {
    expect(normalizarRut("12.345.678-5")).toBe("12345678-5");
    expect(validarRut("12.345.678-5")).toBeTrue();
  });

  it("entrega un mensaje específico según el error", () => {
    expect(mensajeErrorRut("")).toBe("El RUT es obligatorio.");
    expect(mensajeErrorRut("123456785")).toContain("con guión");
    expect(mensajeErrorRut("12345678-9")).toContain("dígito verificador");
    expect(mensajeErrorRut("12345678-5")).toBe("");
  });
});

describe("validaciones: correo, teléfono, nombre y clave", () => {
  it("valida el formato del correo", () => {
    expect(mensajeErrorCorreo("")).toBe("El correo es obligatorio.");
    expect(mensajeErrorCorreo("sin-arroba")).toContain("correo válido");
    expect(mensajeErrorCorreo("juan@correo.cl")).toBe("");
  });

  it("normaliza el correo (minúsculas y sin espacios)", () => {
    expect(normalizarCorreo("  Juan@Correo.CL ")).toBe("juan@correo.cl");
  });

  it("acepta celulares chilenos con o sin +56 y rechaza el resto", () => {
    expect(validarTelefono("+56912345678")).toBeTrue();
    expect(validarTelefono("912345678")).toBeTrue();
    expect(validarTelefono("+56 9 1234 5678")).toBeTrue();
    expect(validarTelefono("22345678")).toBeFalse();
    expect(mensajeErrorTelefono("")).toBe("El teléfono es obligatorio.");
  });

  it("normaliza el teléfono a sus últimos 9 dígitos", () => {
    expect(normalizarTelefono("+56 9 1234 5678")).toBe("912345678");
  });

  it("el nombre solo admite letras y mínimo 3 caracteres", () => {
    expect(mensajeErrorNombre("")).toBe("El nombre es obligatorio.");
    expect(mensajeErrorNombre("Juan123")).toContain("solo puede tener letras");
    expect(mensajeErrorNombre("Al")).toContain("al menos 3");
    expect(mensajeErrorNombre("Juan Pérez")).toBe("");
  });

  it("la contraseña necesita al menos 6 caracteres", () => {
    expect(mensajeErrorClave("")).toBe("La contraseña es obligatoria.");
    expect(mensajeErrorClave("12345")).toContain("al menos 6");
    expect(mensajeErrorClave("123456")).toBe("");
  });

  it("valida montos enteros (mayor a 0, o igual o mayor a 0)", () => {
    expect(mensajeErrorMontoEntero("")).not.toBe("");
    expect(mensajeErrorMontoEntero("0")).not.toBe("");
    expect(mensajeErrorMontoEntero("12.5")).not.toBe("");
    expect(mensajeErrorMontoEntero("5000")).toBe("");
    expect(mensajeErrorMontoEntero("0", 0)).toBe("");
  });
});
