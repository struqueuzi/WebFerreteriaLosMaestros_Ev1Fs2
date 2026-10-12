import { Route, Routes } from "react-router-dom";
import RutaProtegida from "./RutaProtegida";
import { desmontarTodo, montar } from "../testing/utils";
import { asegurarCuentasDemo, iniciarSesion } from "../lib/usuarios";

const rutas = (
  <Routes>
    <Route path="/login" element={<p>PAGINA LOGIN</p>} />
    <Route path="/cliente" element={<p>PANEL CLIENTE</p>} />
    <Route path="/admin" element={<RutaProtegida rol="admin"><p>PANEL ADMIN</p></RutaProtegida>} />
  </Routes>
);

describe("Componente RutaProtegida (navegación)", () => {
  beforeEach(() => {
    localStorage.clear();
    asegurarCuentasDemo();
  });
  afterEach(desmontarTodo);

  it("sin sesión redirige al login", () => {
    expect(montar(rutas, { ruta: "/admin" }).textContent).toBe("PAGINA LOGIN");
  });

  it("con el rol correcto muestra el panel", () => {
    iniciarSesion("admin@maestros.cl", "admin123");
    expect(montar(rutas, { ruta: "/admin" }).textContent).toBe("PANEL ADMIN");
  });

  it("con otro rol redirige a su propio panel", () => {
    iniciarSesion("cliente@maestros.cl", "cliente123");
    expect(montar(rutas, { ruta: "/admin" }).textContent).toBe("PANEL CLIENTE");
  });
});
