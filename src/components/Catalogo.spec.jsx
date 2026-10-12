import Catalogo from "./Catalogo";
import { clic, desmontarTodo, montar } from "../testing/utils";
import { obtenerCarrito } from "../lib/pedidos";
import { FILTRO_VACIO, guardarProductos, PRODUCTOS_DE_EJEMPLO } from "../lib/productos";

describe("Componente Catalogo", () => {
  beforeEach(() => {
    localStorage.clear();
    guardarProductos(PRODUCTOS_DE_EJEMPLO);
  });
  afterEach(desmontarTodo);

  it("sin filtro muestra todos los productos", () => {
    const vista = montar(<Catalogo filtro={FILTRO_VACIO} />);
    expect(vista.querySelectorAll(".card").length).toBe(6);
    expect(vista.querySelector("[data-testid=filtro-activo]").textContent).toBe("Mostrando todos los productos (6)");
  });

  it("muestra solo los productos que cumplen el filtro (props)", () => {
    const vista = montar(<Catalogo filtro={{ ...FILTRO_VACIO, texto: "cemento" }} />);
    expect(vista.querySelectorAll(".card").length).toBe(2);
    expect(vista.querySelector("[data-testid=filtro-activo]").textContent).toContain("(2)");
  });

  it("si no hay coincidencias muestra un mensaje", () => {
    const vista = montar(<Catalogo filtro={{ ...FILTRO_VACIO, texto: "zzzz" }} />);
    expect(vista.querySelectorAll(".card").length).toBe(0);
    expect(vista.textContent).toContain("No encontramos productos");
  });

  it("al añadir al carro guarda el producto y muestra un aviso", () => {
    const vista = montar(<Catalogo filtro={{ ...FILTRO_VACIO, categoria: "Gasfitería" }} />);
    clic(vista.querySelector("button"));
    expect(obtenerCarrito().length).toBe(1);
    expect(obtenerCarrito()[0].nombre).toContain("PVC");
    expect(vista.querySelector("[role=alert]").textContent).toContain("agregado al carrito");
  });
});
