import { useState } from "react";
import Catalogo from "../components/Catalogo";
import LayoutTienda from "../components/LayoutTienda";
import { FILTRO_VACIO } from "../lib/productos";

export default function Productos() {
  const [filtro, setFiltro] = useState(FILTRO_VACIO);
  return (
    <LayoutTienda conBusqueda filtro={filtro} onFiltro={setFiltro}>
      <section aria-labelledby="titulo-catalogo">
        <h1 className="fw-bold mb-1" id="titulo-catalogo">🧱 Catálogo de Productos</h1>
        <Catalogo filtro={filtro} />
      </section>
    </LayoutTienda>
  );
}
