import { useState } from "react";
import { useFormulario } from "./useFormulario";
import CampoFormulario from "../components/CampoFormulario";
import { botonPorTexto, clic, desmontarTodo, escribir, montar, salir } from "../testing/utils";

// Componente de prueba que usa el hook
function Demo() {
  const form = useFormulario({ nombre: "" }, { nombre: (v) => (v.nombre.trim() ? "" : "Falta el nombre.") });
  const [resultado, setResultado] = useState("");
  return (
    <>
      <CampoFormulario label="Nombre" {...form.propsCampo("nombre")} />
      <button type="button" onClick={() => setResultado(String(form.validarTodo()))}>Validar</button>
      <output>{resultado}</output>
    </>
  );
}

describe("Hook useFormulario", () => {
  afterEach(desmontarTodo);

  it("no muestra errores antes de que el usuario toque el campo", () => {
    const vista = montar(<Demo />);
    expect(vista.querySelector(".invalid-feedback")).toBeNull();
  });

  it("valida al salir del campo (blur)", () => {
    const vista = montar(<Demo />);
    salir(vista.querySelector("#nombre"));
    expect(vista.querySelector(".invalid-feedback").textContent).toBe("Falta el nombre.");
  });

  it("corrige el error en vivo mientras el usuario escribe", () => {
    const vista = montar(<Demo />);
    salir(vista.querySelector("#nombre"));
    escribir(vista.querySelector("#nombre"), "Ana");
    expect(vista.querySelector(".invalid-feedback")).toBeNull();
    expect(vista.querySelector("#nombre").classList.contains("is-valid")).toBeTrue();
  });

  it("validarTodo devuelve false si hay errores y true si todo está bien", () => {
    const vista = montar(<Demo />);
    clic(botonPorTexto(vista, "Validar"));
    expect(vista.querySelector("output").textContent).toBe("false");
    escribir(vista.querySelector("#nombre"), "Ana");
    clic(botonPorTexto(vista, "Validar"));
    expect(vista.querySelector("output").textContent).toBe("true");
  });
});
