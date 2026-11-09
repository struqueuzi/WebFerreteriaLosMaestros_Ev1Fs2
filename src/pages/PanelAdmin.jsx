import { useState } from "react";
import AdminAbonos from "../components/AdminAbonos";
import AdminProductos from "../components/AdminProductos";
import AdminReportes from "../components/AdminReportes";
import AdminTransferencia from "../components/AdminTransferencia";
import AdminUsuarios from "../components/AdminUsuarios";
import AdminVentas from "../components/AdminVentas";
import LayoutPanel from "../components/LayoutPanel";
import TablaPedidos from "../components/TablaPedidos";
import { useAlmacen } from "../hooks/useAlmacen";
import { agruparVentas } from "../lib/pedidos";
import { obtenerAbonos } from "../lib/usuarios";

const PESTANAS = [
  { id: "reportes", texto: "Reportes" },
  { id: "ventas", texto: "Historial de ventas" },
  { id: "pedidos", texto: "Pedidos" },
  { id: "usuarios", texto: "Usuarios" },
  { id: "productos", texto: "Productos" },
  { id: "abonos", texto: "Cuentas corrientes" },
  { id: "transferencia", texto: "Datos de transferencia" }
];

export default function PanelAdmin() {
  useAlmacen();
  const [pestana, setPestana] = useState("reportes"); // estado: pestaña visible
  const abonosPendientes = obtenerAbonos().filter((a) => a.estado === "Pendiente").length;
  const pagosPorConfirmar = agruparVentas().filter((v) => v.estadoPago === "Por confirmar").length;
  const contador = { abonos: abonosPendientes, ventas: pagosPorConfirmar };

  return (
    <LayoutPanel insignia="Admin">
      <h1 className="fw-bold h2 mb-1">Panel del administrador</h1>
      <p className="text-muted mb-3">Acceso total: reportes, ventas, usuarios, productos, pedidos, abonos y la cuenta para transferencias.</p>

      <ul className="nav nav-pills pestanas gap-2 mb-4 flex-wrap" role="tablist">
        {PESTANAS.map((p) => (
          <li className="nav-item" role="presentation" key={p.id}>
            <button type="button" role="tab" aria-selected={pestana === p.id} className={`nav-link${pestana === p.id ? " active" : ""}`} onClick={() => setPestana(p.id)}>
              {p.texto}{" "}
              {contador[p.id] > 0 && <span className="badge bg-danger" data-testid={`contador-${p.id}`}>{contador[p.id]}</span>}
            </button>
          </li>
        ))}
      </ul>

      {pestana === "reportes" && <AdminReportes />}
      {pestana === "ventas" && <AdminVentas />}
      {pestana === "usuarios" && <AdminUsuarios />}
      {pestana === "productos" && <AdminProductos />}
      {pestana === "pedidos" && (
        <div className="card p-4">
          <h2 className="titulo-seccion h4 mb-3">Pedidos (seguimiento)</h2>
          <TablaPedidos />
        </div>
      )}
      {pestana === "abonos" && <AdminAbonos />}
      {pestana === "transferencia" && <AdminTransferencia />}
    </LayoutPanel>
  );
}
