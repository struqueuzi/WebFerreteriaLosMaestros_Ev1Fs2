import { useState } from "react";
import AdminAbonos from "../components/AdminAbonos";
import AdminProductos from "../components/AdminProductos";
import AdminReportes from "../components/AdminReportes";
import AdminUsuarios from "../components/AdminUsuarios";
import LayoutPanel from "../components/LayoutPanel";
import TablaPedidos from "../components/TablaPedidos";
import { useAlmacen } from "../hooks/useAlmacen";
import { obtenerAbonos } from "../lib/usuarios";

const PESTANAS = [
  { id: "reportes", texto: "📊 Reportes" },
  { id: "usuarios", texto: "👥 Usuarios" },
  { id: "productos", texto: "🧱 Productos" },
  { id: "pedidos", texto: "📦 Pedidos" },
  { id: "abonos", texto: "💵 Abonos" }
];

export default function PanelAdmin() {
  useAlmacen();
  const [pestana, setPestana] = useState("reportes"); // estado: pestaña visible
  const abonosPendientes = obtenerAbonos().filter((a) => a.estado === "Pendiente").length;

  return (
    <LayoutPanel insignia="Admin" claseInsignia="bg-danger">
      <h1 className="fw-bold h2 mb-1">Panel del Administrador</h1>
      <p className="text-muted mb-3">Acceso total: reportes, usuarios, productos, pedidos y abonos.</p>

      <ul className="nav nav-pills gap-2 mb-4 flex-wrap" role="tablist">
        {PESTANAS.map((p) => (
          <li className="nav-item" role="presentation" key={p.id}>
            <button type="button" role="tab" aria-selected={pestana === p.id} className={`nav-link${pestana === p.id ? " active" : ""}`} onClick={() => setPestana(p.id)}>
              {p.texto}{" "}
              {p.id === "abonos" && abonosPendientes > 0 && <span className="badge bg-danger" data-testid="contador-abonos">{abonosPendientes}</span>}
            </button>
          </li>
        ))}
      </ul>

      {pestana === "reportes" && <AdminReportes />}
      {pestana === "usuarios" && <AdminUsuarios />}
      {pestana === "productos" && <AdminProductos />}
      {pestana === "pedidos" && (
        <div className="card shadow-sm border-0 p-4 rounded-3">
          <h2 className="fw-bold h4 mb-3">Pedidos (seguimiento)</h2>
          <TablaPedidos />
        </div>
      )}
      {pestana === "abonos" && <AdminAbonos />}
    </LayoutPanel>
  );
}
