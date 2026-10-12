import CuentaCorriente from "./CuentaCorriente";
import { botonPorTexto, clic, desmontarTodo, enviarFormulario, escribir, montar } from "../testing/utils";
import { asegurarCuentasDemo, obtenerAbonos, obtenerUsuarios } from "../lib/usuarios";

const cliente = () => obtenerUsuarios().find((u) => u.correo === "cliente@maestros.cl");

describe("Componente CuentaCorriente (abonos del cliente)", () => {
  beforeEach(() => {
    localStorage.clear();
    asegurarCuentasDemo();
  });
  afterEach(desmontarTodo);

  it("muestra saldo pendiente y cupo disponible", () => {
    const vista = montar(<CuentaCorriente usuario={cliente()} />);
    expect(vista.querySelector("[data-testid=saldo-pendiente]").textContent).toBe("$15.000");
    expect(vista.querySelector("[data-testid=cupo-disponible]").textContent).toBe("$25.000");
    expect(vista.textContent).toContain("Cupo asignado: $40.000 · usado: 38%");
  });

  it("el botón Abonar abre la ventana del abono (estado)", () => {
    const vista = montar(<CuentaCorriente usuario={cliente()} />);
    expect(vista.querySelector(".modal")).toBeNull();
    clic(vista.querySelector("#btn-abonar"));
    expect(vista.querySelector(".modal")).not.toBeNull();
  });

  it("valida que el monto no supere el saldo", () => {
    const vista = montar(<CuentaCorriente usuario={cliente()} />);
    clic(vista.querySelector("#btn-abonar"));
    escribir(vista.querySelector("#a-monto"), "20000");
    enviarFormulario(vista.querySelector("form"));
    expect(vista.querySelector(".invalid-feedback").textContent).toContain("no puede superar $15.000");
    expect(obtenerAbonos().length).toBe(0);
  });

  it("un abono válido queda pendiente y no cambia el saldo", () => {
    const vista = montar(<CuentaCorriente usuario={cliente()} />);
    clic(vista.querySelector("#btn-abonar"));
    escribir(vista.querySelector("#a-monto"), "5000");
    escribir(vista.querySelector("#a-detalle"), "Pago en efectivo");
    enviarFormulario(vista.querySelector("form"));

    expect(obtenerAbonos().length).toBe(1);
    expect(obtenerAbonos()[0].estado).toBe("Pendiente");
    expect(cliente().saldoPendiente).toBe(15000);
    expect(vista.querySelector(".modal")).toBeNull(); // la ventana se cierra
    expect(vista.textContent).toContain("Mis abonos enviados");
  });

  it("sin saldo pendiente avisa que no hay nada que abonar", () => {
    const vista = montar(<CuentaCorriente usuario={{ ...cliente(), saldoPendiente: 0 }} />);
    clic(botonPorTexto(vista, "💵 Abonar a mi cuenta"));
    expect(vista.querySelector(".modal")).toBeNull();
    expect(vista.querySelector("[role=alert]").textContent).toContain("No tienes saldo pendiente");
  });
});
