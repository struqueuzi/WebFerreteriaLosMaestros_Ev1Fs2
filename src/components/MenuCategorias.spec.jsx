import MenuCategorias from "./MenuCategorias";
import { botonPorTexto, clic, desmontarTodo, montar } from "../testing/utils";
import { guardarProductos, PRODUCTOS_DE_EJEMPLO } from "../lib/productos";

describe("Componente MenuCategorias", () => {
  beforeEach(() => {
    localStorage.clear();
    guardarProductos(PRODUCTOS_DE_EJEMPLO);
  });
  afterEach(desmontarTodo);

  it("arma el menú con las categorías que tienen productos", () => {
    const vista = montar(<MenuCategorias onElegir={() => {}} />);
    const categorias = Array.from(vista.querySelectorAll(".toggle-categoria")).map((b) => b.textContent);
    expect(categorias).toEqual([
      "Herramientas manuales ▾", "Herramientas eléctricas ▾", "Materiales de construcción ▾", "Gasfitería ▾"
    ]);
  });

  it("al hacer clic en una categoría abre su submenú (estado) y al volver a hacer clic lo cierra", () => {
    const vista = montar(<MenuCategorias onElegir={() => {}} />);
    const boton = vista.querySelector(".toggle-categoria");
    clic(boton);
    expect(boton.parentElement.classList.contains("abierto")).toBeTrue();
    expect(boton.getAttribute("aria-expanded")).toBe("true");
    clic(boton);
    expect(boton.parentElement.classList.contains("abierto")).toBeFalse();
  });

  it("un clic fuera del menú lo cierra", () => {
    const vista = montar(<MenuCategorias onElegir={() => {}} />);
    const boton = vista.querySelector(".toggle-categoria");
    clic(boton);
    clic(document.body);
    expect(boton.parentElement.classList.contains("abierto")).toBeFalse();
  });

  it("elegir una subcategoría avisa con categoría y subcategoría", () => {
    const onElegir = jasmine.createSpy("onElegir");
    const vista = montar(<MenuCategorias onElegir={onElegir} />);
    clic(botonPorTexto(vista, "Gasfitería ▾"));
    clic(botonPorTexto(vista, "Tuberías PVC"));
    expect(onElegir).toHaveBeenCalledOnceWith("Gasfitería", "Tuberías PVC");
  });

  it("«Todos los productos» quita el filtro", () => {
    const onElegir = jasmine.createSpy("onElegir");
    const vista = montar(<MenuCategorias onElegir={onElegir} />);
    clic(botonPorTexto(vista, "🧱 Todos los productos"));
    expect(onElegir).toHaveBeenCalledOnceWith(null, null);
  });
});
