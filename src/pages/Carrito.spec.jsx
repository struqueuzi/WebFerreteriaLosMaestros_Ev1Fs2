import Carrito from "./Carrito";
import { clic, desmontarTodo, elegir, enviarFormulario, montar } from "../testing/utils";
import { agregarAlCarrito, obtenerCarrito, obtenerPedidos } from "../lib/pedidos";
import { guardarProductos, PRODUCTOS_DE_EJEMPLO } from "../lib/productos";
import { asegurarCuentasDemo, iniciarSesion, obtenerUsuarios } from "../lib/usuarios";

describe("Página Carrito", () => {
  beforeEach(() => {
    localStorage.clear();
    asegurarCuentasDemo();
    guardarProductos(PRODUCTOS_DE_EJEMPLO);
  });
  afterEach(desmontarTodo);

  it("con el carrito vacío muestra el mensaje y el total en $0", () => {
    const vista = montar(<Carrito />);
    expect(vista.textContent).toContain("Tu carrito está vacío");
    expect(vista.querySelector("[data-testid=total-compra]").textContent).toBe("$0");
  });

  it("el botón + aumenta la cantidad y actualiza el total (estado)", () => {
    agregarAlCarrito(3, 1);
    const vista = montar(<Carrito />);
    expect(vista.querySelector("[data-testid=total-compra]").textContent).toBe("$8.990");
    clic(vista.querySelector(".btn-mas"));
    expect(vista.querySelector("[data-testid=total-compra]").textContent).toBe("$17.980");
    expect(obtenerCarrito()[0].cantidad).toBe(2);
  });

  it("al elegir despacho aparece el campo de dirección", () => {
    const vista = montar(<Carrito />);
    expect(vista.querySelector("#direccion")).toBeNull();
    elegir(vista.querySelector("#tipoEntrega"), "despacho");
    expect(vista.querySelector("#direccion")).not.toBeNull();
  });

  it("sin sesión no confirma el pedido y avisa que hay que iniciar sesión", () => {
    agregarAlCarrito(3, 1);
    const vista = montar(<Carrito />);
    enviarFormulario(vista.querySelector("form"));
    expect(vista.querySelector("[role=alert]").textContent).toContain("inicia sesión");
    expect(obtenerPedidos().length).toBe(0);
  });

  it("el cliente con cuenta corriente ve la opción de pagar con su cupo y el aviso del saldo", () => {
    iniciarSesion("cliente@maestros.cl", "cliente123");
    agregarAlCarrito(3, 1);
    const vista = montar(<Carrito />);
    elegir(vista.querySelector("#formaPago"), "cuenta_corriente");
    expect(vista.textContent).toContain("Tu saldo pendiente quedaría en $23.990 de $40.000");
  });

  it("avisa cuando el pedido supera el cupo disponible", () => {
    iniciarSesion("cliente@maestros.cl", "cliente123");
    agregarAlCarrito(2, 1); // $45.990
    const vista = montar(<Carrito />);
    elegir(vista.querySelector("#formaPago"), "cuenta_corriente");
    expect(vista.querySelector(".text-danger").textContent).toContain("supera tu cupo disponible");
  });

  it("el cliente confirma el pedido con cuenta corriente y se suma al saldo", () => {
    iniciarSesion("cliente@maestros.cl", "cliente123");
    agregarAlCarrito(3, 1);
    const vista = montar(<Carrito />);
    elegir(vista.querySelector("#formaPago"), "cuenta_corriente");
    enviarFormulario(vista.querySelector("form"));
    expect(obtenerPedidos().length).toBe(1);
    expect(obtenerUsuarios().find((u) => u.correo === "cliente@maestros.cl").saldoPendiente).toBe(23990);
  });
});
