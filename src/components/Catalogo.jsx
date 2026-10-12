import TarjetaProducto from "./TarjetaProducto";
import { useAviso } from "../context/AvisoContext";
import { useAlmacen } from "../hooks/useAlmacen";
import { agregarAlCarrito } from "../lib/pedidos";
import { describirFiltro, filtrarProductos, obtenerProductos } from "../lib/productos";

// Catálogo con los productos reales (los que guardó el admin) filtrados según la prop "filtro".
// Responsivo con la grilla de Bootstrap: 1 columna en celular, 2 en tablet, 3-4 en computador.
export default function Catalogo({ filtro }) {
  useAlmacen(); // si cambia el stock, el catálogo se actualiza solo
  const { mostrarAviso } = useAviso();
  const lista = filtrarProductos(obtenerProductos(), filtro);

  const agregar = (producto) => {
    const res = agregarAlCarrito(producto.id, 1);
    mostrarAviso(res.mensaje, res.exito);
  };

  return (
    <>
      <p className="text-muted small mb-4" data-testid="filtro-activo">{describirFiltro(filtro, lista.length)}</p>
      <div className="row g-4">
        {lista.length === 0 ? (
          <div className="col-12 text-center py-5">
            <h4 className="text-muted">No encontramos productos con ese filtro 🔍</h4>
          </div>
        ) : (
          lista.map((p) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p.id}>
              <TarjetaProducto producto={p} onAgregar={agregar} />
            </div>
          ))
        )}
      </div>
    </>
  );
}
