import {
  actualizarUsuario, asegurarCuentasDemo, cambiarEstadoUsuario, cerrarSesion, cupoDisponible, iniciarSesion,
  obtenerAbonos, obtenerSesionActual, obtenerUsuarios, registrarUsuario, resolverAbono, solicitarAbono, totalAbonosPendientes
} from "./usuarios";

const cliente = () => obtenerUsuarios().find((u) => u.correo === "cliente@maestros.cl");

describe("usuarios: registro y sesión", () => {
  beforeEach(() => {
    localStorage.clear();
    asegurarCuentasDemo();
  });

  it("crea las 4 cuentas de demostración (admin, admin, vendedor y cliente)", () => {
    expect(obtenerUsuarios().length).toBe(4);
  });

  it("registra un cliente nuevo con los datos normalizados", () => {
    const res = registrarUsuario("Juan Pérez", "10.000.000-8", "JUAN@Correo.cl", "+56 9 8765 4321", "secreta1");
    expect(res.exito).toBeTrue();
    expect(res.usuario.rol).toBe("cliente");
    expect(res.usuario.correo).toBe("juan@correo.cl");
    expect(res.usuario.rut).toBe("10000000-8");
  });

  it("no permite registrar un RUT, correo o teléfono repetido", () => {
    const res = registrarUsuario("Otra Persona", "15234567-4", "cliente@maestros.cl", "+56915234567", "secreta1");
    expect(res.exito).toBeFalse();
    expect(res.errores.rut).toContain("Ya existe");
    expect(res.errores.correo).toContain("Ya existe");
    expect(res.errores.telefono).toContain("Ya existe");
    expect(res.mensaje).toContain("RUT, correo y teléfono");
  });

  it("inicia sesión con credenciales correctas y la recuerda", () => {
    const res = iniciarSesion("CLIENTE@maestros.cl", "cliente123");
    expect(res.exito).toBeTrue();
    expect(obtenerSesionActual().correo).toBe("cliente@maestros.cl");
  });

  it("rechaza credenciales incorrectas", () => {
    const res = iniciarSesion("cliente@maestros.cl", "mala");
    expect(res.exito).toBeFalse();
    expect(res.mensaje).toBe("Correo o contraseña incorrectos.");
    expect(obtenerSesionActual()).toBeNull();
  });

  it("una cuenta desactivada no puede iniciar sesión", () => {
    cambiarEstadoUsuario(cliente().id, false);
    const res = iniciarSesion("cliente@maestros.cl", "cliente123");
    expect(res.exito).toBeFalse();
    expect(res.mensaje).toContain("desactivada");
  });

  it("cierra la sesión", () => {
    iniciarSesion("cliente@maestros.cl", "cliente123");
    cerrarSesion();
    expect(obtenerSesionActual()).toBeNull();
  });

  it("no deja desactivar al último administrador activo", () => {
    const admins = obtenerUsuarios().filter((u) => u.rol === "admin");
    expect(cambiarEstadoUsuario(admins[0].id, false).exito).toBeTrue();
    const res = cambiarEstadoUsuario(admins[1].id, false);
    expect(res.exito).toBeFalse();
    expect(res.mensaje).toContain("al menos un administrador");
  });

  it("el saldo pendiente no puede superar el cupo asignado", () => {
    const res = actualizarUsuario(cliente().id, { saldoPendiente: 50000 });
    expect(res.exito).toBeFalse();
    expect(res.errores.saldo).toContain("no puede superar el cupo");
  });
});

describe("usuarios: cuenta corriente y abonos", () => {
  beforeEach(() => {
    localStorage.clear();
    asegurarCuentasDemo();
  });

  it("el cupo disponible es el cupo menos el saldo pendiente", () => {
    expect(cliente().cupoCuentaCorriente).toBe(40000);
    expect(cliente().saldoPendiente).toBe(15000);
    expect(cupoDisponible(cliente())).toBe(25000);
  });

  it("un abono del cliente queda pendiente y NO baja el saldo todavía", () => {
    const res = solicitarAbono(cliente().id, 10000, "efectivo");
    expect(res.exito).toBeTrue();
    expect(obtenerAbonos()[0].estado).toBe("Pendiente");
    expect(cliente().saldoPendiente).toBe(15000);
    expect(totalAbonosPendientes(cliente().id)).toBe(10000);
  });

  it("no permite abonar más que el saldo (considerando abonos pendientes)", () => {
    solicitarAbono(cliente().id, 10000);
    const res = solicitarAbono(cliente().id, 6000);
    expect(res.exito).toBeFalse();
    expect(res.mensaje).toContain("$5.000");
  });

  it("rechaza montos inválidos", () => {
    expect(solicitarAbono(cliente().id, 0).exito).toBeFalse();
    expect(solicitarAbono(cliente().id, 1500.5).exito).toBeFalse();
  });

  it("al aprobar el abono baja el saldo, sube el cupo disponible y queda en los movimientos", () => {
    solicitarAbono(cliente().id, 10000);
    const res = resolverAbono(obtenerAbonos()[0].id, true);
    expect(res.exito).toBeTrue();
    expect(cliente().saldoPendiente).toBe(5000);
    expect(cupoDisponible(cliente())).toBe(35000);
    expect(cliente().movimientosCC.slice(-1)[0].monto).toBe(-10000);
    expect(obtenerAbonos()[0].estado).toBe("Aprobado");
  });

  it("al rechazar el abono el saldo no cambia", () => {
    solicitarAbono(cliente().id, 10000);
    resolverAbono(obtenerAbonos()[0].id, false);
    expect(cliente().saldoPendiente).toBe(15000);
    expect(obtenerAbonos()[0].estado).toBe("Rechazado");
  });

  it("un abono ya resuelto no se puede resolver de nuevo", () => {
    solicitarAbono(cliente().id, 5000);
    const id = obtenerAbonos()[0].id;
    resolverAbono(id, true);
    expect(resolverAbono(id, true).exito).toBeFalse();
  });

  it("una cuenta sin cuenta corriente no puede abonar", () => {
    const vendedor = obtenerUsuarios().find((u) => u.rol === "vendedor");
    expect(solicitarAbono(vendedor.id, 1000).exito).toBeFalse();
  });
});
