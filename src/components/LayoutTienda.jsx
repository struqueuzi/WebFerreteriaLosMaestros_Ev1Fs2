import BarraTienda from "./BarraTienda";
import PiePagina from "./PiePagina";

// Plantilla de las páginas públicas: encabezado + contenido + pie de página
export default function LayoutTienda({ children, filtro, onFiltro, conBusqueda = false }) {
  return (
    <>
      <BarraTienda filtro={filtro} onFiltro={onFiltro} conBusqueda={conBusqueda} />
      <main className="container my-5">{children}</main>
      <PiePagina conDireccion />
    </>
  );
}
