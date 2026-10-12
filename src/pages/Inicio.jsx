import { useState } from "react";
import Carrusel from "../components/Carrusel";
import Catalogo from "../components/Catalogo";
import LayoutTienda from "../components/LayoutTienda";
import { FILTRO_VACIO } from "../lib/productos";

export default function Inicio() {
  // Estado compartido: el buscador y el menú (en la barra) cambian "filtro" y el catálogo lo recibe por props
  const [filtro, setFiltro] = useState(FILTRO_VACIO);
  return (
    <LayoutTienda conBusqueda filtro={filtro} onFiltro={setFiltro}>
      <Carrusel />
      <section aria-labelledby="titulo-destacados">
        <h2 className="fw-bold mb-1" id="titulo-destacados">✨ Productos Destacados</h2>
        <Catalogo filtro={filtro} />
      </section>
    </LayoutTienda>
  );
}
