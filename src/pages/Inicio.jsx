import { useState } from "react";
import { Link } from "react-router-dom";
import { rutaCatalogo } from "../components/BarraTienda";
import Carrusel from "../components/Carrusel";
import Catalogo from "../components/Catalogo";
import LayoutTienda from "../components/LayoutTienda";
import MarcoNeon from "../components/MarcoNeon";
import MenuLateral from "../components/MenuLateral";
import { IconoCaja, IconoChevron, IconoEstrella, IconoEtiqueta, IconoEtiquetaChica, IconoFlecha, IconoTarjeta } from "../components/Iconos";
import { useAlmacen } from "../hooks/useAlmacen";
import { descuentoDe, FILTRO_VACIO, obtenerProductos } from "../lib/productos";

export default function Inicio() {
  useAlmacen();
  // Estado compartido: el buscador (en la barra), el menú lateral y el catálogo usan el mismo "filtro"
  const [filtro, setFiltro] = useState(FILTRO_VACIO);
  const mayorDescuento = Math.max(0, ...obtenerProductos().map(descuentoDe));

  const elegirCategoria = (categoria, subcategoria) => {
    setFiltro({ ...filtro, categoria, subcategoria });
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  const accesos = [
    {
      Icono: IconoEtiqueta,
      titulo: "Ofertas imperdibles",
      texto: mayorDescuento > 0 ? `Hasta ${mayorDescuento}% de descuento` : "Revisa los precios de la semana",
      ruta: rutaCatalogo({ especial: "ofertas" })
    },
    { Icono: IconoTarjeta, titulo: "Compra ahora", texto: "y paga como quieras", ruta: "/carrito" },
    { Icono: IconoCaja, titulo: "Despacho a domicilio", texto: "o retira en nuestra tienda", ruta: "/productos" }
  ];

  return (
    <LayoutTienda filtro={filtro} onFiltro={setFiltro} anchoCompleto categoriasFijas>
      <div className="fondo-obra">
        <div className="container pt-lg-0 pt-3">
          <div className="row g-3 portada">
            <div className="col-lg-3 d-none d-lg-block">
              <div className="panel-categorias">
                <MenuLateral onElegir={elegirCategoria} activa={filtro.categoria} />
              </div>
            </div>
            <div className="col-12 col-lg-9">
              <Carrusel />
            </div>
          </div>

          <div className="row g-3 accesos">
            {accesos.map(({ Icono, titulo, texto, ruta }) => (
              <div className="col-12 col-md-4" key={titulo}>
                <MarcoNeon as={Link} to={ruta} className="acceso" claseFondo="acceso-fondo">
                  <span className="acceso-icono"><Icono tamano={titulo === "Ofertas imperdibles" ? 58 : 50} /></span>
                  <span className="acceso-texto">
                    <strong>{titulo}</strong>
                    <span>{texto}</span>
                  </span>
                  <span className="acceso-flecha" aria-hidden="true"><IconoChevron tamano={14} /></span>
                </MarcoNeon>
              </div>
            ))}
          </div>

          <MarcoNeon as="section" className="seccion-neon" claseFondo="seccion-neon-fondo" aria-labelledby="titulo-destacados">
            <span className="seccion-encabezado">
              <h2 className="titulo-neon" id="titulo-destacados"><IconoEstrella tamano={28} /> Productos destacados</h2>
              <Link to="/productos" className="link-neon">Ver todos los productos <IconoFlecha tamano={16} /></Link>
            </span>
            <Catalogo destacados={5} />
          </MarcoNeon>

          <section className="seccion" id="catalogo" aria-labelledby="titulo-catalogo">
            <div className="seccion-encabezado">
              <h2 className="titulo-neon" id="titulo-catalogo"><IconoEtiquetaChica tamano={26} /> Catálogo completo</h2>
              {(filtro.categoria || filtro.texto) && (
                <button type="button" className="link-neon" onClick={() => setFiltro(FILTRO_VACIO)}>Quitar filtro</button>
              )}
            </div>
            <Catalogo filtro={filtro} />
          </section>
        </div>
      </div>
    </LayoutTienda>
  );
}
