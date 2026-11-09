import TarjetaProducto from "./TarjetaProducto";
import { clic, desmontarTodo, montar } from "../testing/utils";

const producto = {
  id: 3, nombre: "Martillo de Carpintero 16oz", precio: 8990, stock: 14,
  imagen: "assets/imgs/martillo.jpg", categoria: "Herramientas manuales", subcategoria: "Martillos"
};

describe("Componente TarjetaProducto", () => {
  afterEach(desmontarTodo);

  it("muestra nombre, precio formateado, stock y categoría (props)", () => {
    const vista = montar(<TarjetaProducto producto={producto} onAgregar={() => {}} />);
    expect(vista.textContent).toContain("Martillo de Carpintero 16oz");
    expect(vista.textContent).toContain("$8.990");
    expect(vista.textContent).toContain("Stock: 14 u.");
    expect(vista.textContent).toContain("Herramientas manuales › Martillos");
    expect(vista.querySelector("img").getAttribute("alt")).toBe(producto.nombre);
  });

  it("al presionar «Añadir al carro» llama a onAgregar con el producto (mock con espía)", () => {
    const onAgregar = jasmine.createSpy("onAgregar");
    const vista = montar(<TarjetaProducto producto={producto} onAgregar={onAgregar} />);
    clic(vista.querySelector("button"));
    expect(onAgregar).toHaveBeenCalledOnceWith(producto);
  });

  it("marca el stock bajo en amarillo", () => {
    const vista = montar(<TarjetaProducto producto={{ ...producto, stock: 5 }} onAgregar={() => {}} />);
    expect(vista.querySelector(".text-warning").textContent).toContain("Stock: 5 u.");
  });

  it("si está agotado muestra «Agotado» y deshabilita el botón", () => {
    const onAgregar = jasmine.createSpy("onAgregar");
    const vista = montar(<TarjetaProducto producto={{ ...producto, stock: 0 }} onAgregar={onAgregar} />);
    const boton = vista.querySelector("button");
    expect(vista.textContent).toContain("Agotado");
    expect(boton.disabled).toBeTrue();
    clic(boton);
    expect(onAgregar).not.toHaveBeenCalled();
  });

  it("enlaza al detalle del producto", () => {
    const vista = montar(<TarjetaProducto producto={producto} onAgregar={() => {}} />);
    expect(vista.querySelector("a").getAttribute("href")).toContain("/producto/3");
  });

  it("con descuento muestra la etiqueta, el precio rebajado y el anterior tachado", () => {
    const vista = montar(<TarjetaProducto producto={{ ...producto, descuento: 15 }} onAgregar={() => {}} />);
    expect(vista.querySelector(".etiqueta-oferta").textContent).toBe("-15%");
    expect(vista.querySelector(".precio").textContent).toBe("$7.640");
    expect(vista.querySelector(".precio-antes").textContent).toBe("$8.990");
  });

  it("un producto nuevo sin descuento muestra la etiqueta «Nuevo»", () => {
    const vista = montar(<TarjetaProducto producto={{ ...producto, esNuevo: true }} onAgregar={() => {}} />);
    expect(vista.querySelector(".etiqueta-oferta").textContent).toBe("Nuevo");
    expect(vista.querySelector(".precio-antes")).toBeNull();
  });
});

