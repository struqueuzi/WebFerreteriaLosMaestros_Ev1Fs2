import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { rutaCatalogo } from "./BarraTienda";
import { IconoChevron, IconoChevronIzquierda, IconoEscudo, IconoFlecha, IconoTarjeta, IconoTienda } from "./Iconos";
import { useAlmacen } from "../hooks/useAlmacen";
import { descuentoDe, obtenerProductos } from "../lib/productos";

// Foto del banner con ruta relativa (igual que las fotos de productos, así funciona con base "./" de Vite)
const FOTO_BANNER = "assets/imgs/diseno/trabajador.jpg";

function armarDiapositivas() {
  const mayorDescuento = Math.max(0, ...obtenerProductos().map(descuentoDe));
  return [
    {
      linea1: "Ferretería",
      linea2: "Los Maestros",
      bajada: ["Herramientas y soluciones", "para ", "tus proyectos"],
      ruta: "/productos",
      boton: "Descubrir más"
    },
    {
      linea1: "Ofertas",
      linea2: "de la semana",
      bajada: mayorDescuento > 0
        ? ["Productos con hasta", "un ", `${mayorDescuento}% de descuento`]
        : ["Revisa los precios", "de ", "esta semana"],
      ruta: rutaCatalogo({ especial: "ofertas" }),
      boton: "Ver ofertas"
    },
    {
      linea1: "Paga con",
      linea2: "transferencia",
      bajada: ["Te mostramos la cuenta", "al ", "confirmar tu pedido"],
      ruta: "/carrito",
      boton: "Ir al carrito"
    }
  ];
}

const VENTAJAS = [
  { Icono: IconoTienda, linea1: "Retiro", linea2: "en tienda" },
  { Icono: IconoEscudo, linea1: "Compra", linea2: "segura" },
  { Icono: IconoTarjeta, linea1: "Paga como", linea2: "quieras" }
];

// Banner principal del inicio. Cambia solo cada "intervalo" ms y también con las flechas o los puntos.
export default function Carrusel({ intervalo = 7000 }) {
  useAlmacen();
  const diapositivas = armarDiapositivas();
  const [actual, setActual] = useState(0);
  const total = diapositivas.length;

  useEffect(() => {
    const t = setInterval(() => setActual((a) => (a + 1) % total), intervalo);
    return () => clearInterval(t);
  }, [intervalo, actual, total]); // al tocar una flecha el contador parte de nuevo

  const d = diapositivas[actual];
  const mover = (paso) => setActual((a) => (a + paso + total) % total);

  return (
    <section className="hero-neon" aria-label="Destacados" aria-roledescription="carrusel">
      <img src={FOTO_BANNER} alt="" className="hero-foto" />

      <div className="hero-texto" key={actual}>
        <h1 className="hero-titulo">
          <span className="hero-titulo-metal">{d.linea1}</span>
          <span className="hero-titulo-amarillo">{d.linea2}</span>
        </h1>
        <p className="hero-bajada">
          {d.bajada[0]}<br />{d.bajada[1]}<span>{d.bajada[2]}</span>
        </p>
        <Link to={d.ruta} className="boton-neon">{d.boton} <IconoFlecha /></Link>
      </div>

      <ul className="hero-ventajas list-unstyled d-none d-xl-flex">
        {VENTAJAS.map(({ Icono, linea1, linea2 }) => (
          <li key={linea1}><Icono tamano={30} /><span>{linea1}<br />{linea2}</span></li>
        ))}
      </ul>

      <button type="button" className="hero-flecha izquierda" aria-label="Diapositiva anterior" onClick={() => mover(-1)}><IconoChevronIzquierda tamano={22} /></button>
      <button type="button" className="hero-flecha derecha" aria-label="Diapositiva siguiente" onClick={() => mover(1)}><IconoChevron tamano={22} /></button>

      <div className="hero-puntos" role="tablist" aria-label="Elegir diapositiva">
        {diapositivas.map((x, i) => (
          <button key={x.linea2} type="button" role="tab" aria-selected={i === actual} aria-label={`Diapositiva ${i + 1}`} className={i === actual ? "activo" : ""} onClick={() => setActual(i)} />
        ))}
      </div>
    </section>
  );
}
