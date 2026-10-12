import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LayoutTienda from "../components/LayoutTienda";
import TablaCarrito from "../components/TablaCarrito";
import { useAviso } from "../context/AvisoContext";
import { useAlmacen } from "../hooks/useAlmacen";
import { useSesion } from "../hooks/useSesion";
import { formatoPesos } from "../lib/formato";
import { cambiarCantidadEnCarrito, confirmarCarrito, eliminarDelCarrito, obtenerCarrito, totalCarrito } from "../lib/pedidos";
import { cupoDisponible } from "../lib/usuarios";

export default function Carrito() {
  useAlmacen();
  const { usuario } = useSesion();
  const { mostrarAviso } = useAviso();
  const navigate = useNavigate();
  const [tipoEntrega, setTipoEntrega] = useState("retiro");
  const [direccion, setDireccion] = useState("");
  const [formaPago, setFormaPago] = useState("normal");

  const items = obtenerCarrito();
  const total = totalCarrito();
  // Solo el cliente con cuenta corriente puede pagar con su cupo
  const puedeCuentaCorriente = !!usuario && usuario.rol === "cliente" && !!usuario.cuentaCorriente;
  const pagaConCuentaCorriente = puedeCuentaCorriente && formaPago === "cuenta_corriente";

  const cambiar = (indice, cambio) => {
    const res = cambiarCantidadEnCarrito(indice, cambio);
    if (!res.exito) mostrarAviso(res.mensaje, false);
  };

  // Avisa en el momento si el pedido cabe o no en el cupo disponible
  let avisoCupo = null;
  if (pagaConCuentaCorriente) {
    const disponible = cupoDisponible(usuario);
    avisoCupo = total > disponible
      ? { clase: "form-text text-danger fw-bold", texto: `Este pedido (${formatoPesos(total)}) supera tu cupo disponible (${formatoPesos(disponible)}).` }
      : { clase: "form-text text-success", texto: `Tu saldo pendiente quedaría en ${formatoPesos((usuario.saldoPendiente || 0) + total)} de ${formatoPesos(usuario.cupoCuentaCorriente)}.` };
  }

  const confirmar = (e) => {
    e.preventDefault();

    if (items.length === 0) {
      mostrarAviso("Tu carrito está vacío. Agrega productos antes de confirmar.", false);
      return;
    }
    // 1) Hay que haber iniciado sesión. El carrito queda guardado mientras tanto.
    if (!usuario) {
      mostrarAviso("Para confirmar tu pedido inicia sesión o crea una cuenta. Tu carrito se mantiene guardado.", false);
      setTimeout(() => navigate("/login?volver=carrito"), 1800);
      return;
    }
    // 2) Quien hace pedidos es el cliente registrado
    if (usuario.rol !== "cliente") {
      mostrarAviso("Solo las cuentas de cliente pueden hacer pedidos. Inicia sesión con una cuenta de cliente.", false);
      return;
    }
    if (tipoEntrega === "despacho" && direccion.trim().length < 5) {
      mostrarAviso("Ingresa una dirección de despacho válida.", false);
      return;
    }

    const res = confirmarCarrito(usuario.correo, {
      tipoEntrega,
      direccion: direccion.trim(),
      formaPago: pagaConCuentaCorriente ? "cuenta_corriente" : "normal"
    });
    mostrarAviso(res.mensaje, res.exito);
    if (res.exito) setTimeout(() => navigate("/cliente"), 1500); // al panel, a ver el seguimiento
  };

  return (
    <LayoutTienda>
      <h1 className="fw-bold mb-4">🛒 Mi Carrito de Compras</h1>
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0 p-4 bg-white rounded-3">
            {items.length > 0 ? (
              <TablaCarrito items={items} onCambiar={cambiar} onEliminar={eliminarDelCarrito} />
            ) : (
              <div className="text-center py-5">
                <h4 className="text-muted">Tu carrito está vacío 🛠️</h4>
                <Link to="/productos" className="btn btn-warning mt-3 fw-bold">Ir a buscar productos</Link>
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-0 p-4 bg-white rounded-3 mb-4">
            <h4 className="fw-bold mb-3">Resumen de Compra</h4>
            <hr />
            <div className="d-flex justify-content-between fs-5">
              <span>Total:</span>
              <span className="fw-bold text-primary fs-4" data-testid="total-compra">{formatoPesos(total)}</span>
            </div>
          </div>

          <div className="card shadow-sm border-0 p-4 bg-white rounded-3">
            <h5 className="fw-bold mb-3">Información de Entrega</h5>
            <form onSubmit={confirmar} noValidate>
              <div className="mb-3">
                <label htmlFor="tipoEntrega" className="form-label small fw-bold">Tipo de entrega</label>
                <select className="form-select" id="tipoEntrega" value={tipoEntrega} onChange={(e) => setTipoEntrega(e.target.value)}>
                  <option value="retiro">Retiro en Tienda (La Serena)</option>
                  <option value="despacho">Despacho a Domicilio</option>
                </select>
              </div>

              {tipoEntrega === "despacho" && (
                <div className="mb-3">
                  <label htmlFor="direccion" className="form-label small fw-bold">Dirección de obra / hogar</label>
                  <input type="text" className="form-control" id="direccion" placeholder="Ej: Av. Francisco de Aguirre 123" autoComplete="street-address" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                </div>
              )}

              {puedeCuentaCorriente && (
                <div className="mb-3">
                  <label htmlFor="formaPago" className="form-label small fw-bold">Forma de pago</label>
                  <select className="form-select" id="formaPago" value={formaPago} onChange={(e) => setFormaPago(e.target.value)}>
                    <option value="normal">Pago normal (en tienda / contra entrega)</option>
                    <option value="cuenta_corriente">Cuenta corriente (disponible {formatoPesos(cupoDisponible(usuario))})</option>
                  </select>
                  {avisoCupo && <div className={avisoCupo.clase}>{avisoCupo.texto}</div>}
                </div>
              )}

              <button type="submit" className="btn btn-warning w-100 fw-bold py-2 mt-2">Confirmar pedido</button>
              {!usuario && (
                <p className="small text-muted mt-3 mb-0">
                  Para confirmar necesitas una cuenta de cliente.{" "}
                  <Link to="/login?volver=carrito">Inicia sesión</Link> o <Link to="/registro">regístrate</Link>.
                  Tu carrito se mantiene guardado.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </LayoutTienda>
  );
}
