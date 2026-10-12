import { formatoPesos } from "../lib/formato";

// Tabla del carrito. Props: items [{id, nombre, precio, cantidad}], onCambiar(indice, +1|-1), onEliminar(indice)
export default function TablaCarrito({ items, onCambiar, onEliminar }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle mb-0">
        <thead className="table-light">
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
              <td><span className="fw-bold text-dark">{item.nombre}</span></td>
              <td>{formatoPesos(item.precio)}</td>
              <td>
                <div className="input-group input-group-sm" style={{ maxWidth: 120 }}>
                  <button className="btn btn-outline-secondary btn-menos" type="button" aria-label="Quitar una unidad" onClick={() => onCambiar(indice, -1)}>-</button>
                  <input type="text" className="form-control text-center bg-white text-dark" value={item.cantidad} readOnly aria-label="Cantidad" />
                  <button className="btn btn-outline-secondary btn-mas" type="button" aria-label="Agregar una unidad" onClick={() => onCambiar(indice, 1)}>+</button>
                </div>
              </td>
              <td className="fw-bold text-dark">{formatoPesos(item.precio * item.cantidad)}</td>
              <td>
                <button className="btn btn-sm btn-outline-danger btn-eliminar" type="button" aria-label="Eliminar del carrito" onClick={() => onEliminar(indice)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
