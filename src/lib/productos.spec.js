import {
  agruparCategorias, describirFiltro, filtrarProductos, guardarProductos, obtenerProductos,
  PRODUCTOS_DE_EJEMPLO, subcategoriasDe
} from "./productos";

describe("productos: filtros y menú", () => {
  beforeEach(() => localStorage.clear());

  it("filtra por categoría", () => {
    const r = filtrarProductos(PRODUCTOS_DE_EJEMPLO, { categoria: "Gasfitería" });
    expect(r.length).toBe(1);
    expect(r[0].nombre).toContain("PVC");
  });

  it("filtra por subcategoría", () => {
    const r = filtrarProductos(PRODUCTOS_DE_EJEMPLO, { categoria: "Herramientas eléctricas", subcategoria: "Rotomartillos" });
    expect(r.length).toBe(2);
  });

  it("busca por texto sin distinguir mayúsculas", () => {
    expect(filtrarProductos(PRODUCTOS_DE_EJEMPLO, { texto: "CEMENTO" }).length).toBe(2);
    expect(filtrarProductos(PRODUCTOS_DE_EJEMPLO, { texto: "zzz" }).length).toBe(0);
  });

  it("sin filtros devuelve todos los productos", () => {
    expect(filtrarProductos(PRODUCTOS_DE_EJEMPLO).length).toBe(PRODUCTOS_DE_EJEMPLO.length);
  });

  it("agrupa solo las categorías con productos y respeta el orden", () => {
    const grupos = agruparCategorias(PRODUCTOS_DE_EJEMPLO);
    expect(grupos.map((g) => g.categoria)).toEqual([
      "Herramientas manuales", "Herramientas eléctricas", "Materiales de construcción", "Gasfitería"
    ]);
    expect(grupos[2].subcategorias).toEqual(["Cementos"]);
  });

  it("describe el filtro activo con la cantidad de resultados", () => {
    expect(describirFiltro({}, 6)).toBe("Mostrando todos los productos (6)");
    expect(describirFiltro({ categoria: "Gasfitería", subcategoria: "Tuberías PVC" }, 1)).toBe("Mostrando: Gasfitería › Tuberías PVC (1)");
  });

  it("subcategoriasDe incluye una subcategoría personalizada ya elegida", () => {
    expect(subcategoriasDe("Gasfitería")).toEqual(["Tuberías PVC"]);
    expect(subcategoriasDe("Gasfitería", "Grifería")).toEqual(["Tuberías PVC", "Grifería"]);
  });

  it("guarda y lee los productos desde localStorage (se espía setItem)", () => {
    const espia = spyOn(Storage.prototype, "setItem").and.callThrough();
    guardarProductos(PRODUCTOS_DE_EJEMPLO);
    expect(espia).toHaveBeenCalledWith("productos", jasmine.any(String));
    expect(obtenerProductos().length).toBe(6);
  });
});
