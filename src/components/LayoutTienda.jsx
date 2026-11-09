import BarraTienda from "./BarraTienda";
import BotonArriba from "./BotonArriba";
import PiePagina from "./PiePagina";

// Plantilla de las páginas públicas: encabezado + contenido + pie de página.
// "anchoCompleto" deja que la página maneje sus propios márgenes (lo usa el Inicio).
// "categoriasFijas": en el inicio la lista de categorías ya se ve al lado del banner.
export default function LayoutTienda({ children, filtro, onFiltro, anchoCompleto = false, categoriasFijas = false }) {
  return (
    <>
      <BarraTienda filtro={filtro} onFiltro={onFiltro} categoriasFijas={categoriasFijas} />
      {anchoCompleto ? <main>{children}</main> : <main className="container my-5">{children}</main>}
      <PiePagina />
      <BotonArriba />
    </>
  );
}
