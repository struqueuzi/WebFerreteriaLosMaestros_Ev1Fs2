import TarjetaProducto from "./TarjetaProducto";
import { useAviso } from "../context/AvisoContext";
import { useAlmacen } from "../hooks/useAlmacen";
import { agregarAlCarrito } from "../lib/pedidos";
import { describirFiltro, filtrarProductos, obtenerProductos, productosDestacados } from "../lib/productos";

// Catálogo con los productos reales (los que guardó el admin) filtrados según la prop "filtro".
// Responsivo con la grilla de Bootstrap: 1 columna en celular, 2 en tablet, 3-4 (o 5) en computador.
// Con "destacados" muestra solo esa cantidad de productos, primero los que están en oferta o son nuevos.
export default function Catalogo({ filtro, destacados = 0 }) {
  useAlmacen(); // si cambia el stock, el catálogo se actualiza solo
  const { mostrarAviso } = useAviso();
  const lista = destacados > 0
    ? productosDestacados(obtenerProductos(), destacados)
    : filtrarProductos(obtenerProductos(), filtro);
  const columna = destacados > 0 ? "col-12 col-sm-6 col-md-4 col-xl" : "col-12 col-sm-6 col-md-4 col-lg-3";

  const agregar = (producto) => {
    const res = agregarAlCarrito(producto.id, 1);
    mostrarAviso(res.mensaje, res.exito);
  };

  return (
    <>
      {destacados === 0 && <p className="text-secondary small mb-4" data-testid="filtro-activo">{describirFiltro(filtro, lista.length)}</p>}
      <div className={`row ${destacados > 0 ? "g-3" : "g-4"}`}>
        {lista.length === 0 ? (
          <div className="col-12 text-center py-5">
            <h4 className="text-secondary">No encontramos productos con ese filtro</h4>
          </div>
        ) : (
          lista.map((p) => (
            <div className={columna} key={p.id}>
              <TarjetaProducto producto={p} onAgregar={agregar} />
            </div>
          ))
        )}
      </div>
    </>
  );
}
