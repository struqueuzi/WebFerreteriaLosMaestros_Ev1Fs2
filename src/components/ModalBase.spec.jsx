import ModalBase from "./ModalBase";
import { botonPorTexto, clic, desmontarTodo, montar, teclear } from "../testing/utils";

describe("Componente ModalBase", () => {
  afterEach(desmontarTodo);

  it("cerrado no dibuja nada", () => {
    const vista = montar(<ModalBase abierto={false} titulo="Hola" idTitulo="t" onCerrar={() => {}}>contenido</ModalBase>);
    expect(vista.querySelector(".modal")).toBeNull();
  });

  it("abierto muestra título, contenido y pie", () => {
    const vista = montar(<ModalBase abierto titulo="Editar usuario" idTitulo="t" onCerrar={() => {}} pie={<button type="button">Guardar</button>}>Datos</ModalBase>);
    expect(vista.querySelector("#t").textContent).toBe("Editar usuario");
    expect(vista.querySelector(".modal-body").textContent).toBe("Datos");
    expect(botonPorTexto(vista, "Guardar")).toBeDefined();
  });

  it("se cierra con la X y con la tecla Escape", () => {
    const onCerrar = jasmine.createSpy("onCerrar");
    const vista = montar(<ModalBase abierto titulo="Hola" idTitulo="t" onCerrar={onCerrar}>x</ModalBase>);
    clic(vista.querySelector(".btn-close"));
    teclear("Escape");
    expect(onCerrar).toHaveBeenCalledTimes(2);
  });
});
