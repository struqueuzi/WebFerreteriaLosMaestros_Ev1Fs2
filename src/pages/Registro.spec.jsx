import Registro from "./Registro";
import { desmontarTodo, enviarFormulario, escribir, montar, salir } from "../testing/utils";
import { asegurarCuentasDemo, obtenerUsuarios } from "../lib/usuarios";

const llenar = (vista, datos) => {
  Object.entries(datos).forEach(([id, valor]) => escribir(vista.querySelector(`#${id}`), valor));
};

describe("Página Registro", () => {
  beforeEach(() => {
    localStorage.clear();
    asegurarCuentasDemo();
  });
  afterEach(desmontarTodo);

  it("avisa en vivo que el RUT ya existe al salir del campo", () => {
    const vista = montar(<Registro />);
    escribir(vista.querySelector("#rut"), "15234567-4"); // RUT de la cuenta de prueba
    salir(vista.querySelector("#rut"));
    expect(vista.querySelector("#rut-error").textContent).toBe("Ya existe una cuenta registrada con este RUT.");
  });

  it("avisa cuando las contraseñas no coinciden", () => {
    const vista = montar(<Registro />);
    escribir(vista.querySelector("#clave"), "abcdef");
    escribir(vista.querySelector("#clave2"), "abcdeX");
    salir(vista.querySelector("#clave2"));
    expect(vista.querySelector("#clave2-error").textContent).toBe("Las contraseñas no coinciden.");
  });

  it("con datos inválidos no crea la cuenta y muestra el resumen", () => {
    const vista = montar(<Registro />);
    enviarFormulario(vista.querySelector("form"));
    expect(vista.querySelectorAll(".invalid-feedback").length).toBe(6);
    expect(vista.querySelector(".alert-danger").textContent).toContain("Revisa los campos");
    expect(obtenerUsuarios().length).toBe(4);
  });

  it("con datos correctos crea la cuenta de cliente", () => {
    const vista = montar(<Registro />);
    llenar(vista, {
      nombre: "Juan Pérez", rut: "10000000-8", correo: "juan@correo.cl",
      telefono: "+56987654321", clave: "secreta1", clave2: "secreta1"
    });
    enviarFormulario(vista.querySelector("form"));
    const nuevo = obtenerUsuarios().find((u) => u.correo === "juan@correo.cl");
    expect(nuevo).toBeDefined();
    expect(nuevo.rol).toBe("cliente");
    expect(nuevo.cuentaCorriente).toBeFalse();
  });
});
