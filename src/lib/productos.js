// ========================================================
// productos.js - Categorías, catálogo y filtros
// ========================================================
import { escribir, leer } from "./almacen";

export const UMBRAL_STOCK_BAJO = 10;
// "especial" sirve para ver solo las ofertas ("ofertas") o solo los productos nuevos ("nuevos")
export const FILTRO_VACIO = { categoria: null, subcategoria: null, texto: "", especial: null };

export const DESCUENTO_MAXIMO = 90;
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

// Ofertas y novedades de ejemplo. Se aplican una sola vez (ver inicializar.js) para que la tienda
// no parta sin ofertas. Después el administrador las cambia desde su panel.
export const OFERTAS_DE_EJEMPLO = {
  2: { descuento: 20 },
  3: { descuento: 15 },
  4: { descuento: 10 },
  6: { esNuevo: true }
};

// --------------------------------------------------------
// PRECIOS CON DESCUENTO
// "precio" es siempre el precio normal; "descuento" es un % entero (0 = sin oferta)
// --------------------------------------------------------
export function descuentoDe(producto) {
  const d = Number(producto && producto.descuento) || 0;
  return Math.min(Math.max(Math.round(d), 0), DESCUENTO_MAXIMO);
}

export function estaEnOferta(producto) {
  return descuentoDe(producto) > 0;
}

// Precio que paga el cliente. Se redondea a la decena (en Chile no se cobran pesos sueltos)
export function precioFinal(producto) {
  const d = descuentoDe(producto);
  if (d === 0) return producto.precio;
  return Math.round((producto.precio * (100 - d)) / 100 / 10) * 10;
}

export function mensajeErrorDescuento(valor) {
  const texto = String(valor ?? "").trim();
  if (texto === "") return "";
  if (!/^\d+$/.test(texto)) return "El descuento debe ser un número entero.";
  if (Number(texto) > DESCUENTO_MAXIMO) return `El descuento no puede pasar de ${DESCUENTO_MAXIMO}%.`;
  return "";
}

export function obtenerProductos() {
  return leer("productos", []);
}

export function guardarProductos(lista) {
  escribir("productos", lista);
}

// Filtro único para todas las pantallas: por categoría, subcategoría y/o texto de búsqueda
export function filtrarProductos(productos, { categoria = null, subcategoria = null, texto = "", especial = null } = {}) {
  const t = (texto || "").toLowerCase().trim();
  return productos.filter((p) => {
    if (categoria && p.categoria !== categoria) return false;
    if (subcategoria && p.subcategoria !== subcategoria) return false;
    if (especial === "ofertas" && !estaEnOferta(p)) return false;
    if (especial === "nuevos" && !p.esNuevo) return false;
    if (t && !(p.nombre.toLowerCase().includes(t) || p.categoria.toLowerCase().includes(t) || (p.subcategoria || "").toLowerCase().includes(t))) return false;
    return true;
  });
}

// Productos para la portada: primero los que tienen oferta o son nuevos
export function productosDestacados(productos, cantidad = 5) {
  const puntaje = (p) => (estaEnOferta(p) ? 2 : 0) + (p.esNuevo ? 1 : 0);
  return [...productos].sort((a, b) => puntaje(b) - puntaje(a)).slice(0, cantidad);
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
export function describirFiltro({ categoria = null, subcategoria = null, texto = "", especial = null } = {}, cantidad = 0) {
  const partes = [];
  if (especial === "ofertas") partes.push("Ofertas");
  if (especial === "nuevos") partes.push("Novedades");
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
