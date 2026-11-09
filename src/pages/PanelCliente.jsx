import { useState } from "react";
import { Link } from "react-router-dom";
import Catalogo from "../components/Catalogo";
import CuentaCorriente from "../components/CuentaCorriente";
import HistorialCompras from "../components/HistorialCompras";
import LayoutPanel from "../components/LayoutPanel";
import MenuCategorias from "../components/MenuCategorias";
import { useSesion } from "../hooks/useSesion";
import { FILTRO_VACIO } from "../lib/productos";

export default function PanelCliente() {
  const { usuario } = useSesion();
  const [filtro, setFiltro] = useState(FILTRO_VACIO);

  const barra = (
    <div className="barra-filtros py-2">
      <div className="container">
        <MenuCategorias onElegir={(categoria, subcategoria) => setFiltro((f) => ({ ...f, categoria, subcategoria }))} />
      </div>
    </div>
  );

  return (
    <LayoutPanel conTienda barra={barra}>
      <section className="row g-3 mb-4" aria-label="Resumen">
        <div className={usuario.cuentaCorriente ? "col-12 col-md-7" : "col-12"}>
          <div className="card shadow-sm border-0 p-4 rounded-3 h-100">
            <h1 className="fw-bold h2">Hola, {usuario.nombre}</h1>
            <p className="text-muted">Cliente registrado · compra, revisa tu carrito y mira el historial de todo lo que has comprado.</p>
            <div>
              <Link to="/cliente/compras" className="btn btn-pill btn-pill-chico">Ver mis compras</Link>
            </div>
          </div>
        </div>
        {usuario.cuentaCorriente && (
          <div className="col-12 col-md-5">
            <CuentaCorriente usuario={usuario} />
          </div>
        )}
      </section>

      <section className="card shadow-sm border-0 p-4 rounded-3 mb-4" aria-labelledby="titulo-catalogo">
        <h2 className="titulo-seccion h4 mb-3" id="titulo-catalogo">Catálogo de productos</h2>
        <div className="mb-2">
          <label htmlFor="buscador-panel" className="visually-hidden">Buscar productos</label>
          <input type="search" id="buscador-panel" className="form-control" placeholder="Buscar producto, categoría..." autoComplete="off" value={filtro.texto} onChange={(e) => setFiltro({ ...filtro, texto: e.target.value })} />
        </div>
        <Catalogo filtro={filtro} />
      </section>

      <section className="card shadow-sm border-0 p-4 rounded-3" id="historial" aria-labelledby="titulo-historial">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h2 className="titulo-seccion h4 mb-0" id="titulo-historial">Mis compras</h2>
          <Link to="/cliente/compras" className="link-neon">Ver todas y filtrar →</Link>
        </div>
        <HistorialCompras correo={usuario.correo} />
      </section>
    </LayoutPanel>
  );
}
