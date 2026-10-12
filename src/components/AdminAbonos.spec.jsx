import AdminAbonos from "./AdminAbonos";
import { clic, desmontarTodo, montar } from "../testing/utils";
import { asegurarCuentasDemo, obtenerUsuarios, solicitarAbono } from "../lib/usuarios";

const cliente = () => obtenerUsuarios().find((u) => u.correo === "cliente@maestros.cl");

describe("Componente AdminAbonos (el admin ve y aprueba los abonos del cliente)", () => {
  beforeEach(() => {
    localStorage.clear();
    asegurarCuentasDemo();
  });
  afterEach(desmontarTodo);

  it("sin abonos muestra un mensaje vacío", () => {
    const vista = montar(<AdminAbonos />);
    expect(vista.textContent).toContain("Aún no hay abonos");
  });

  it("muestra el abono pendiente del cliente con sus botones", () => {
    solicitarAbono(cliente().id, 10000, "efectivo");
    const vista = montar(<AdminAbonos />);
    expect(vista.textContent).toContain("Cliente Maestros");
    expect(vista.textContent).toContain("$10.000");
    expect(vista.querySelector(".badge.bg-warning").textContent).toBe("Pendiente");
    expect(vista.querySelector(".btn-aprobar")).not.toBeNull();
  });

  it("al aprobar baja el saldo del cliente y el abono pasa a Aprobado", () => {
    solicitarAbono(cliente().id, 10000);
    const vista = montar(<AdminAbonos />);
    clic(vista.querySelector(".btn-aprobar"));
    expect(cliente().saldoPendiente).toBe(5000);
    expect(vista.querySelector(".badge.bg-success").textContent).toBe("Aprobado");
    expect(vista.querySelector(".btn-aprobar")).toBeNull();
  });

  it("al rechazar el saldo queda igual", () => {
    solicitarAbono(cliente().id, 10000);
    const vista = montar(<AdminAbonos />);
    clic(vista.querySelector(".btn-rechazar"));
    expect(cliente().saldoPendiente).toBe(15000);
    expect(vista.querySelector(".badge.bg-danger").textContent).toBe("Rechazado");
  });
});
