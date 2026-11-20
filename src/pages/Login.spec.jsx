import { act } from "react-dom/test-utils";
import { cerrarSesionApi, usuarioRemoto } from "../lib/api";
import Login from "./Login";
import { desmontarTodo, enviarFormulario, escribir, montar } from "../testing/utils";
import { asegurarCuentasDemo, obtenerSesionActual } from "../lib/usuarios";

describe("Página Login", () => {
  beforeEach(() => {
    localStorage.clear();
    asegurarCuentasDemo();
  });
  afterEach(async () => {
    desmontarTodo();
    if (usuarioRemoto()) await cerrarSesionApi();
  });

  it("enviar el formulario vacío marca los dos campos en rojo", () => {
    const vista = montar(<Login />);
    enviarFormulario(vista.querySelector("form"));
    const mensajes = Array.from(vista.querySelectorAll(".invalid-feedback")).map((m) => m.textContent);
    expect(mensajes).toEqual(["El correo es obligatorio.", "Ingresa tu contraseña."]);
  });

  it("un correo con formato inválido no intenta iniciar sesión", () => {
    const vista = montar(<Login />);
    escribir(vista.querySelector("#correo"), "sin-arroba");
    escribir(vista.querySelector("#clave"), "cliente123");
    enviarFormulario(vista.querySelector("form"));
    expect(vista.querySelector(".invalid-feedback").textContent).toContain("correo válido");
    expect(obtenerSesionActual()).toBeNull();
  });

  it("con credenciales incorrectas muestra el error y no inicia sesión", async () => {
    spyOn(window, "fetch").and.resolveTo(new Response(JSON.stringify({ message: "Correo o contraseña incorrectos." }), { status: 401 }));
    const vista = montar(<Login />);
    escribir(vista.querySelector("#correo"), "cliente@maestros.cl");
    escribir(vista.querySelector("#clave"), "incorrecta");
    await act(async () => enviarFormulario(vista.querySelector("form")));
    expect(vista.querySelector("p[role=alert]").textContent).toBe("Correo o contraseña incorrectos.");
    expect(obtenerSesionActual()).toBeNull();
  });

  it("con credenciales correctas inicia sesión", async () => {
    spyOn(window, "fetch").and.returnValues(
      Promise.resolve(new Response(JSON.stringify({ token: "prueba", usuario: { rol: "cliente" } }))),
      Promise.resolve(new Response("[]")),
      Promise.resolve(new Response(null, { status: 204 }))
    );
    const vista = montar(<Login />);
    escribir(vista.querySelector("#correo"), "cliente@maestros.cl");
    escribir(vista.querySelector("#clave"), "cliente123");
    await act(async () => enviarFormulario(vista.querySelector("form")));
    expect(usuarioRemoto().rol).toBe("cliente");
  });

  it("muestra el aviso verde cuando viene de registrarse", () => {
    const vista = montar(<Login />, { ruta: "/login?registro=ok" });
    expect(vista.querySelector(".alert-success").textContent).toContain("Cuenta creada con éxito");
  });
});
