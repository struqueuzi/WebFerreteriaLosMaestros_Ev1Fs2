// ========================================================
// Utilidades para probar componentes React con Jasmine + Karma (sin librerías extra).
// Montan el componente en un <div> real del navegador (Chrome) y simulan lo que haría el usuario.
// ========================================================
import * as React from "react";
import { createRoot } from "react-dom/client";
import * as TestUtils from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import { AvisoProvider } from "../context/AvisoContext";

// Le dice a React que estamos en un entorno de pruebas (así agrupa las actualizaciones dentro de act)
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const act = React.act || TestUtils.act;

const montados = [];

// Monta un componente dentro de un Router (para <Link>/useNavigate) y del proveedor de avisos.
export function montar(elemento, { ruta = "/" } = {}) {
  const contenedor = document.createElement("div");
  document.body.appendChild(contenedor);
  const raiz = createRoot(contenedor);
  act(() => {
    raiz.render(
      <MemoryRouter initialEntries={[ruta]}>
        <AvisoProvider>{elemento}</AvisoProvider>
      </MemoryRouter>
    );
  });
  const registro = { contenedor, raiz };
  montados.push(registro);
  return contenedor;
}

// Se llama en afterEach: desmonta todo lo que montaron las pruebas
export function desmontarTodo() {
  while (montados.length) {
    const { contenedor, raiz } = montados.pop();
    act(() => raiz.unmount());
    contenedor.remove();
  }
}

// Escribe en un <input> controlado por React (usa el "setter" nativo y avisa con el evento "input")
export function escribir(input, valor) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  act(() => {
    setter.call(input, valor);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

// Elige una opción de un <select>
export function elegir(select, valor) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
  act(() => {
    setter.call(select, valor);
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

export function clic(elemento) {
  act(() => elemento.click());
}

// "Salir" de un campo (blur). React escucha "focusout".
export function salir(elemento) {
  act(() => {
    elemento.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
  });
}

export function enviarFormulario(formulario) {
  act(() => {
    formulario.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

export function teclear(tecla) {
  act(() => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: tecla, bubbles: true }));
  });
}

// Busca un botón por su texto exacto
export function botonPorTexto(contenedor, texto) {
  return Array.from(contenedor.querySelectorAll("button")).find((b) => b.textContent.trim() === texto);
}

export { act };
