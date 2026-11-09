import { useState } from "react";
import { Link } from "react-router-dom";
import { TarjetaCompra } from "../components/HistorialCompras";
import { IconoChevronIzquierda } from "../components/Iconos";
import LayoutPanel from "../components/LayoutPanel";
import { useAlmacen } from "../hooks/useAlmacen";
import { useSesion } from "../hooks/useSesion";
import { formatoPesos } from "../lib/formato";
import {
  ESTADOS_PEDIDO, filtrarVentas, FORMAS_DE_PAGO, ordenarVentas, rangoRapido, resumenVentas, ventasDelCliente
} from "../lib/pedidos";

const FILTROS_VACIOS = { texto: "", estado: "", formaPago: "", estadoPago: "", desde: "", hasta: "" };

const RANGOS = [
  { id: "todo", texto: "Todo" },
  { id: "7", texto: "Últimos 7 días" },
  { id: "30", texto: "Últimos 30 días" },
  { id: "mes", texto: "Este mes" },
  { id: "anio", texto: "Este año" }
];

// Página "Mis compras" del cliente: todo su historial con filtros por fecha, estado, forma de pago y orden.
export default function MisCompras() {
  useAlmacen();
  const { usuario } = useSesion();
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [rango, setRango] = useState("todo"); // botón de fecha rápida marcado
  const [orden, setOrden] = useState("recientes");

  const todas = ventasDelCliente(usuario.correo);
  const visibles = ordenarVentas(filtrarVentas(todas, filtros), orden);
  const resumen = resumenVentas(visibles);
  const hayFiltros = Object.values(filtros).some(Boolean);

  const cambiar = (campo) => (e) => {
    setFiltros({ ...filtros, [campo]: e.target.value });
    if (campo === "desde" || campo === "hasta") setRango(""); // eligió fechas a mano
  };

  const elegirRango = (id) => {
    setRango(id);
    setFiltros({ ...filtros, ...rangoRapido(id) });
  };

  const limpiar = () => {
    setFiltros(FILTROS_VACIOS);
    setRango("todo");
    setOrden("recientes");
  };

  // Si "desde" queda después de "hasta" no saldría nada, mejor avisarlo
  const fechasAlReves = filtros.desde && filtros.hasta && filtros.desde > filtros.hasta;

  return (
    <LayoutPanel conTienda>
      <div className="mb-3">
        <Link to="/cliente" className="link-neon"><IconoChevronIzquierda tamano={16} /> Volver a mi panel</Link>
      </div>
      <h1 className="titulo-seccion h2 mb-1">Mis compras</h1>
      <p className="text-secondary">Todo lo que has comprado en la tienda. Filtra por fecha, estado o forma de pago.</p>

      <div className="card p-3 p-md-4 mb-4 filtros-compras">
        <div className="d-flex gap-2 flex-wrap mb-3" role="group" aria-label="Rango de fechas">
          {RANGOS.map((r) => (
            <button key={r.id} type="button" className={`chip${rango === r.id ? " activo" : ""}`} aria-pressed={rango === r.id} onClick={() => elegirRango(r.id)}>
              {r.texto}
            </button>
          ))}
        </div>

        <div className="row g-2">
          <div className="col-6 col-md-3 col-xl-2">
            <label htmlFor="c-desde" className="form-label small fw-bold mb-1">Desde</label>
            <input id="c-desde" type="date" className="form-control form-control-sm" value={filtros.desde} max={filtros.hasta || undefined} onChange={cambiar("desde")} />
          </div>
          <div className="col-6 col-md-3 col-xl-2">
            <label htmlFor="c-hasta" className="form-label small fw-bold mb-1">Hasta</label>
            <input id="c-hasta" type="date" className="form-control form-control-sm" value={filtros.hasta} min={filtros.desde || undefined} onChange={cambiar("hasta")} />
          </div>
          <div className="col-12 col-md-6 col-xl-2">
            <label htmlFor="c-texto" className="form-label small fw-bold mb-1">Buscar</label>
            <input id="c-texto" type="search" className="form-control form-control-sm" placeholder="N° o producto" value={filtros.texto} onChange={cambiar("texto")} />
          </div>
          <div className="col-6 col-md-3 col-xl-2">
            <label htmlFor="c-estado" className="form-label small fw-bold mb-1">Estado</label>
            <select id="c-estado" className="form-select form-select-sm" value={filtros.estado} onChange={cambiar("estado")}>
              <option value="">Todos</option>
              {ESTADOS_PEDIDO.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-3 col-xl-2">
            <label htmlFor="c-pago" className="form-label small fw-bold mb-1">Forma de pago</label>
            <select id="c-pago" className="form-select form-select-sm" value={filtros.formaPago} onChange={cambiar("formaPago")}>
              <option value="">Todas</option>
              {Object.entries(FORMAS_DE_PAGO).map(([id, texto]) => <option key={id} value={id}>{texto}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-3 col-xl-2">
            <label htmlFor="c-orden" className="form-label small fw-bold mb-1">Ordenar</label>
            <select id="c-orden" className="form-select form-select-sm" value={orden} onChange={(e) => setOrden(e.target.value)}>
              <option value="recientes">Más recientes</option>
              <option value="antiguas">Más antiguas</option>
              <option value="mayor">Mayor monto</option>
              <option value="menor">Menor monto</option>
            </select>
          </div>
          <div className="col-12 d-flex justify-content-end">
            <button type="button" className="btn btn-contorno btn-sm px-3" disabled={!hayFiltros && orden === "recientes"} onClick={limpiar}>
              Limpiar filtros
            </button>
          </div>
        </div>
        {fechasAlReves && <div className="small text-danger mt-2">La fecha "desde" es posterior a "hasta".</div>}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3"><div className="dato-resumen"><span>Compras</span><strong data-testid="mis-compras-cantidad">{resumen.cantidad}</strong></div></div>
        <div className="col-6 col-md-3"><div className="dato-resumen"><span>Total</span><strong data-testid="mis-compras-total">{formatoPesos(resumen.total)}</strong></div></div>
        <div className="col-6 col-md-3"><div className="dato-resumen"><span>Productos</span><strong>{resumen.unidades}</strong></div></div>
        <div className="col-6 col-md-3"><div className="dato-resumen"><span>Por transferir</span><strong>{resumen.porConfirmar}</strong></div></div>
      </div>

      <p className="small text-secondary" data-testid="mis-compras-mostrando">
        {hayFiltros ? `Mostrando ${visibles.length} de ${todas.length} compras` : `${todas.length} ${todas.length === 1 ? "compra" : "compras"} en total`}
      </p>

      {todas.length === 0 ? (
        <div className="card p-4 text-center">
          <p className="mb-3">Aún no has hecho ninguna compra.</p>
          <div><Link to="/productos" className="btn btn-pill">Ir al catálogo</Link></div>
        </div>
      ) : visibles.length === 0 ? (
        <div className="card p-4 text-center">
          <p className="mb-3">No hay compras con esos filtros.</p>
          <div><button type="button" className="btn btn-contorno" onClick={limpiar}>Limpiar filtros</button></div>
        </div>
      ) : (
        visibles.map((v) => <TarjetaCompra key={v.numeroVenta} venta={v} />)
      )}
    </LayoutPanel>
  );
}
