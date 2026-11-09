import { Link } from "react-router-dom";
import CartolaCuentaCorriente from "../components/CartolaCuentaCorriente";
import CuentaCorriente from "../components/CuentaCorriente";
import { IconoChevronIzquierda } from "../components/Iconos";
import LayoutPanel from "../components/LayoutPanel";
import { useAlmacen } from "../hooks/useAlmacen";
import { useSesion } from "../hooks/useSesion";

// Página "Estado de cuenta" del cliente con cuenta corriente: la tarjeta para abonar + la cartola completa.
export default function EstadoCuenta() {
  useAlmacen();
  const { usuario } = useSesion();

  return (
    <LayoutPanel conTienda>
      <div className="mb-3">
        <Link to="/cliente" className="link-neon"><IconoChevronIzquierda tamano={16} /> Volver a mi panel</Link>
      </div>
      <h1 className="titulo-seccion h2 mb-1">Estado de cuenta corriente</h1>
      <p className="text-secondary">Todos los cargos y abonos de tu cuenta, con el medio con que pagaste cada abono.</p>

      {!usuario.cuentaCorriente ? (
        <div className="card p-4">Tu cuenta no tiene cuenta corriente habilitada. Pídesela al administrador de la tienda.</div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-5 col-xl-4">
            <CuentaCorriente usuario={usuario} conEnlace={false} />
          </div>
          <div className="col-12 col-lg-7 col-xl-8">
            <CartolaCuentaCorriente usuario={usuario} parte="resumen" />
          </div>
          <div className="col-12">
            <div className="card p-3 p-md-4">
              <h2 className="titulo-seccion h4 mb-3">Movimientos</h2>
              <CartolaCuentaCorriente usuario={usuario} parte="tabla" />
            </div>
          </div>
        </div>
      )}
    </LayoutPanel>
  );
}
