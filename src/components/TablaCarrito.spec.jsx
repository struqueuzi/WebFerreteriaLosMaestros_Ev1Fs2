import TablaCarrito from "./TablaCarrito";
import { clic, desmontarTodo, montar } from "../testing/utils";

const items = [
  { id: 3, nombre: "Martillo de Carpintero 16oz", precio: 8990, cantidad: 2 },
  { id: 4, nombre: "Tubo PVC Sanitario 40mm x 3mt", precio: 3290, cantidad: 1 }
];

describe("Componente TablaCarrito", () => {
  afterEach(desmontarTodo);

  it("dibuja una fila por producto con su subtotal", () => {
    const vista = montar(<TablaCarrito items={items} onCambiar={() => {}} onEliminar={() => {}} />);
    expect(vista.querySelectorAll("tbody tr").length).toBe(2);
    expect(vista.textContent).toContain("$17.980"); // 2 x 8.990
    expect(vista.querySelector("input").value).toBe("2");
  });

  it("los botones + y - avisan con el índice y el cambio", () => {
    const onCambiar = jasmine.createSpy("onCambiar");
    const vista = montar(<TablaCarrito items={items} onCambiar={onCambiar} onEliminar={() => {}} />);
    clic(vista.querySelector(".btn-mas"));
    clic(vista.querySelector(".btn-menos"));
    expect(onCambiar).toHaveBeenCalledWith(0, 1);
    expect(onCambiar).toHaveBeenCalledWith(0, -1);
  });

  it("el botón de basurero avisa con el índice de la fila", () => {
    const onEliminar = jasmine.createSpy("onEliminar");
    const vista = montar(<TablaCarrito items={items} onCambiar={() => {}} onEliminar={onEliminar} />);
    clic(vista.querySelectorAll(".btn-eliminar")[1]);
    expect(onEliminar).toHaveBeenCalledOnceWith(1);
  });
});
