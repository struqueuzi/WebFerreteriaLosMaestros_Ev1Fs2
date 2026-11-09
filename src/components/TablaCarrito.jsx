import { formatoPesos } from "../lib/formato";

// Tabla del carrito. Props: items [{id, nombre, precio, cantidad}], onCambiar(indice, +1|-1), onEliminar(indice)
export default function TablaCarrito({ items, onCambiar, onEliminar }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th><span className="visually-hidden">Acción</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, indice) => (
            <tr key={item.id}>
              <td><span className="fw-bold">{item.nombre}</span>{item.descuento > 0 && <span className="etiqueta-oferta estatica ms-2">-{item.descuento}%</span>}</td>
              <td>{formatoPesos(item.precio)}{item.descuento > 0 && <div><s className="precio-antes small">{formatoPesos(item.precioNormal)}</s></div>}</td>
              <td>
                <div className="input-group input-group-sm" style={{ maxWidth: 120 }}>
                  <button className="btn btn-outline-warning btn-menos" type="button" aria-label="Quitar una unidad" onClick={() => onCambiar(indice, -1)}>-</button>
                  <input type="text" className="form-control text-center" value={item.cantidad} readOnly aria-label="Cantidad" />
                  <button className="btn btn-outline-warning btn-mas" type="button" aria-label="Agregar una unidad" onClick={() => onCambiar(indice, 1)}>+</button>
                </div>
              </td>
              <td className="fw-bold">{formatoPesos(item.precio * item.cantidad)}</td>
              <td>
                <button className="btn btn-sm btn-outline-danger btn-eliminar" type="button" aria-label="Eliminar del carrito" onClick={() => onEliminar(indice)}>✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
