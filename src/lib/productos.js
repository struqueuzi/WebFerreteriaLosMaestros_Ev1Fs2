// ========================================================
// productos.js - Categorías, catálogo y filtros
// ========================================================
import { escribir, leer } from "./almacen";

export const UMBRAL_STOCK_BAJO = 10;
export const FILTRO_VACIO = { categoria: null, subcategoria: null, texto: "" };
export const IMAGEN_POR_DEFECTO = "assets/imgs/329f5c6e4eaff31962d0f2cc0bd20b77.jpg";

export const CATEGORIAS_Y_SUBCATEGORIAS = {
  "Herramientas manuales": ["Martillos", "Llaves", "Escaleras"],
  "Herramientas eléctricas": ["Taladros", "Rotomartillos"],
  "Materiales de construcción": ["Pinturas", "Tornillos y anclajes", "Cementos"],
  "Gasfitería": ["Tuberías PVC"]
};

export const PRODUCTOS_DE_EJEMPLO = [
  { id: 1, nombre: "Cemento Polpaico Especial 25kg",         precio: 4890,  stock: 120, imagen: "assets/imgs/cemento-especial-transex-25-kg-.jpg", categoria: "Materiales de construcción", subcategoria: "Cementos" },
  { id: 2, nombre: "Rotomartillo Eléctrico 800W",            precio: 45990, stock: 8,   imagen: "assets/imgs/5fb962b131194-edb82be4-f66a-4c09-9089-ed06a679c1c4-1600x1600.jpg", categoria: "Herramientas eléctricas", subcategoria: "Rotomartillos" },
  { id: 3, nombre: "Martillo de Carpintero 16oz",            precio: 8990,  stock: 14,  imagen: "assets/imgs/martillo.jpg", categoria: "Herramientas manuales", subcategoria: "Martillos" },
  { id: 4, nombre: "Tubo PVC Sanitario 40mm x 3mt",          precio: 3290,  stock: 45,  imagen: "assets/imgs/tubo-pvc-u-para-alcantarillado-domiciliario-gris-3-metros.jpg", categoria: "Gasfitería", subcategoria: "Tuberías PVC" },
  { id: 5, nombre: "Cemento Polpaico Alta Resistencia 25kg", precio: 5490,  stock: 60,  imagen: "assets/imgs/cemento.jpg", categoria: "Materiales de construcción", subcategoria: "Cementos" },
  { id: 6, nombre: "Rotomartillo SDS Plus 800W 26mm",        precio: 52990, stock: 5,   imagen: "assets/imgs/rotomartillo-sds-plus-800w-26mm-shr263ka-b3.jpg", categoria: "Herramientas eléctricas", subcategoria: "Rotomartillos" }
];

export function obtenerProductos() {
  return leer("productos", []);
}

export function guardarProductos(lista) {
  escribir("productos", lista);
}

// Filtro único para todas las pantallas: por categoría, subcategoría y/o texto de búsqueda
export function filtrarProductos(productos, { categoria = null, subcategoria = null, texto = "" } = {}) {
  const t = texto.toLowerCase().trim();
  return productos.filter((p) => {
    if (categoria && p.categoria !== categoria) return false;
    if (subcategoria && p.subcategoria !== subcategoria) return false;
    if (t && !(p.nombre.toLowerCase().includes(t) || p.categoria.toLowerCase().includes(t) || (p.subcategoria || "").toLowerCase().includes(t))) return false;
    return true;
  });
}

// Arma la estructura del menú: solo las categorías/subcategorías que TIENEN productos,
// en el orden definido en CATEGORIAS_Y_SUBCATEGORIAS. Devuelve [{ categoria, subcategorias: [...] }]
export function agruparCategorias(productos) {
  const mapa = {};
  productos.forEach((p) => {
    if (!mapa[p.categoria]) mapa[p.categoria] = new Set();
    mapa[p.categoria].add(p.subcategoria);
  });

  const orden = Object.keys(CATEGORIAS_Y_SUBCATEGORIAS);
  const posicion = (c) => (orden.indexOf(c) === -1 ? 99 : orden.indexOf(c));

  return Object.keys(mapa)
    .sort((a, b) => posicion(a) - posicion(b))
    .map((categoria) => ({ categoria, subcategorias: [...mapa[categoria]] }));
}

// Texto que explica qué filtro está activo. Ej: "Mostrando: Gasfitería › Tuberías PVC (1)"
export function describirFiltro({ categoria = null, subcategoria = null, texto = "" } = {}, cantidad = 0) {
  const partes = [];
  if (categoria) partes.push(categoria);
  if (subcategoria) partes.push(subcategoria);
  if (texto) partes.push(`“${texto}”`);
  return partes.length
    ? `Mostrando: ${partes.join(" › ")} (${cantidad})`
    : `Mostrando todos los productos (${cantidad})`;
}

// Subcategorías disponibles para una categoría (más la ya elegida si es una personalizada)
export function subcategoriasDe(categoria, seleccionada = null) {
  const subs = [...(CATEGORIAS_Y_SUBCATEGORIAS[categoria] || [])];
  if (seleccionada && !subs.includes(seleccionada)) subs.push(seleccionada);
  return subs;
}

export function categoriasDisponibles(seleccionada = null) {
  const categorias = Object.keys(CATEGORIAS_Y_SUBCATEGORIAS);
  if (seleccionada && !categorias.includes(seleccionada)) categorias.push(seleccionada);
  return categorias;
}
