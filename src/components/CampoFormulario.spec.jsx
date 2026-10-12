import CampoFormulario from "./CampoFormulario";
import { desmontarTodo, escribir, montar } from "../testing/utils";

describe("Componente CampoFormulario", () => {
  afterEach(desmontarTodo);

  it("asocia la etiqueta con el campo y muestra el valor recibido", () => {
    const vista = montar(<CampoFormulario id="rut" label="RUT" value="12345678-5" onChange={() => {}} />);
    const input = vista.querySelector("#rut");
    expect(vista.querySelector("label").getAttribute("for")).toBe("rut");
    expect(input.value).toBe("12345678-5");
  });

  it("con error pinta el campo en rojo y muestra el mensaje", () => {
    const vista = montar(<CampoFormulario id="rut" label="RUT" value="" onChange={() => {}} error="El RUT es obligatorio." />);
    const input = vista.querySelector("#rut");
    expect(input.classList.contains("is-invalid")).toBeTrue();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(vista.querySelector(".invalid-feedback").textContent).toBe("El RUT es obligatorio.");
  });

  it("si es válido lo pinta en verde y sin mensaje de error", () => {
    const vista = montar(<CampoFormulario id="rut" label="RUT" value="12345678-5" onChange={() => {}} valido />);
    expect(vista.querySelector("#rut").classList.contains("is-valid")).toBeTrue();
    expect(vista.querySelector(".invalid-feedback")).toBeNull();
  });

  it("al escribir avisa con onChange (manipulación del DOM)", () => {
    const onChange = jasmine.createSpy("onChange");
    const vista = montar(<CampoFormulario id="nombre" label="Nombre" value="" onChange={onChange} />);
    escribir(vista.querySelector("#nombre"), "Ana");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("muestra el texto de ayuda", () => {
    const vista = montar(<CampoFormulario id="x" label="X" value="" onChange={() => {}} ayuda="Solo letras." />);
    expect(vista.querySelector(".form-text").textContent).toBe("Solo letras.");
  });
});
