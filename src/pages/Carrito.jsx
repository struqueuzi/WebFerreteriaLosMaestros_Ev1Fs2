import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatosTransferencia from "../components/DatosTransferencia";
import LayoutTienda from "../components/LayoutTienda";
import TablaCarrito from "../components/TablaCarrito";
import { useAviso } from "../context/AvisoContext";
import { useAlmacen } from "../hooks/useAlmacen";
import { useSesion } from "../hooks/useSesion";
import { formatoPesos } from "../lib/formato";
import { cambiarCantidadEnCarrito, confirmarCarrito, eliminarDelCarrito, FORMAS_DE_PAGO, obtenerCarrito, totalCarrito } from "../lib/pedidos";
import { obtenerDatosTransferencia } from "../lib/transferencia";
import { cupoDisponible } from "../lib/usuarios";

// Pantalla que aparece después de confirmar un pedido pagado con transferencia
function CompraConTransferencia({ compra }) {
  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-7">
        <div className="card p-4 compra-lista">
          <h1 className="titulo-seccion h2 mb-2">Pedido N° {compra.numeroVenta} registrado</h1>
          <p className="text-muted">
            Tu pedido quedó reservado. Para que lo preparemos solo falta que hagas la transferencia con estos datos.
            También los vas a encontrar en <strong>Mis compras</strong>.
          </p>
          <DatosTransferencia datos={compra.datosTransferencia} monto={compra.total} referencia={compra.numeroVenta} />
          <div className="d-flex gap-2 flex-wrap mt-4">
            <Link to="/cliente/compras" className="btn btn-pill">Ver mis compras</Link>
            <Link to="/productos" className="btn btn-contorno-oscuro">Seguir comprando</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Carrito() {
  useAlmacen();
  const { usuario } = useSesion();
  const { mostrarAviso } = useAviso();
  const navigate = useNavigate();
  const [tipoEntrega, setTipoEntrega] = useState("retiro");
  const [direccion, setDireccion] = useState("");
  const [formaPago, setFormaPago] = useState("normal");
  const [compraTransferencia, setCompraTransferencia] = useState(null);

  const items = obtenerCarrito();
  const total = totalCarrito();
  // Solo el cliente con cuenta corriente puede pagar con su cupo
  const puedeCuentaCorriente = !!usuario && usuario.rol === "cliente" && !!usuario.cuentaCorriente;
  // Si eligió cuenta corriente y después cambió de cuenta, se vuelve a pago normal
  const formaPagoReal = formaPago === "cuenta_corriente" && !puedeCuentaCorriente ? "normal" : formaPago;
  const pagaConCuentaCorriente = formaPagoReal === "cuenta_corriente";
  const pagaConTransferencia = formaPagoReal === "transferencia";

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
      formaPago: formaPagoReal
    });
    mostrarAviso(res.mensaje, res.exito);
    if (!res.exito) return;

    // Con transferencia se queda en esta página mostrando la cuenta y el monto; con lo demás va al panel
    if (res.formaPago === "transferencia") setCompraTransferencia(res);
    else setTimeout(() => navigate("/cliente/compras"), 1500);
  };

  if (compraTransferencia) {
    return (
      <LayoutTienda>
        <CompraConTransferencia compra={compraTransferencia} />
      </LayoutTienda>
    );
  }

  return (
    <LayoutTienda>
      <h1 className="titulo-seccion mb-4">Mi carrito de compras</h1>
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card p-4">
            {items.length > 0 ? (
              <TablaCarrito items={items} onCambiar={cambiar} onEliminar={eliminarDelCarrito} />
            ) : (
              <div className="text-center py-5">
                <h4 className="text-muted">Tu carrito está vacío</h4>
                <Link to="/productos" className="btn btn-pill mt-3">Ir a buscar productos</Link>
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card resumen-compra p-4 mb-4">
            <h4 className="fw-bold mb-3">Resumen de compra</h4>
            <div className="d-flex justify-content-between align-items-baseline">
              <span>Total</span>
              <span className="precio precio-grande" data-testid="total-compra">{formatoPesos(total)}</span>
            </div>
          </div>

          <div className="card p-4">
            <h5 className="fw-bold mb-3">Entrega y pago</h5>
            <form onSubmit={confirmar} noValidate>
              <div className="mb-3">
                <label htmlFor="tipoEntrega" className="form-label small fw-bold">Tipo de entrega</label>
                <select className="form-select" id="tipoEntrega" value={tipoEntrega} onChange={(e) => setTipoEntrega(e.target.value)}>
                  <option value="retiro">Retiro en tienda (La Serena)</option>
                  <option value="despacho">Despacho a domicilio</option>
                </select>
              </div>

              {tipoEntrega === "despacho" && (
                <div className="mb-3">
                  <label htmlFor="direccion" className="form-label small fw-bold">Dirección de obra / hogar</label>
                  <input type="text" className="form-control" id="direccion" placeholder="Ej: Av. Francisco de Aguirre 123" autoComplete="street-address" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="formaPago" className="form-label small fw-bold">Forma de pago</label>
                <select className="form-select" id="formaPago" value={formaPagoReal} onChange={(e) => setFormaPago(e.target.value)}>
                  <option value="normal">{FORMAS_DE_PAGO.normal}</option>
                  <option value="transferencia">{FORMAS_DE_PAGO.transferencia}</option>
                  {puedeCuentaCorriente && (
                    <option value="cuenta_corriente">Cuenta corriente (disponible {formatoPesos(cupoDisponible(usuario))})</option>
                  )}
                </select>
                {avisoCupo && <div className={avisoCupo.clase}>{avisoCupo.texto}</div>}
              </div>

              {pagaConTransferencia && (
                <div className="mb-3">
                  <DatosTransferencia datos={obtenerDatosTransferencia()} monto={total} />
                </div>
              )}

              <button type="submit" className="btn btn-pill w-100 mt-2">Confirmar pedido</button>
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
