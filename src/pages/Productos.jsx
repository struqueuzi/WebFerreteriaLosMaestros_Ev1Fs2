import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { rutaCatalogo } from "../components/BarraTienda";
import Catalogo from "../components/Catalogo";
import LayoutTienda from "../components/LayoutTienda";
import MenuCategorias from "../components/MenuCategorias";
import { FILTRO_VACIO } from "../lib/productos";

const PESTANAS = [
  { id: null, texto: "Todos" },
  { id: "ofertas", texto: "Ofertas" },
  { id: "nuevos", texto: "Novedades" }
];

// Catálogo completo. Los filtros pueden venir en la URL: ?categoria=...&sub=...&especial=ofertas&q=texto
export default function Productos() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const desdeUrl = () => ({
    ...FILTRO_VACIO,
    categoria: params.get("categoria"),
    subcategoria: params.get("sub"),
    especial: params.get("especial"),
    texto: params.get("q") || ""
  });
  const [filtro, setFiltro] = useState(desdeUrl);

  // Si cambia la URL (por ejemplo desde el menú) se actualiza el filtro
  useEffect(() => {
    setFiltro(desdeUrl());
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const titulo = filtro.especial === "ofertas" ? "Ofertas" : filtro.especial === "nuevos" ? "Novedades" : "Catálogo de productos";

  return (
    <LayoutTienda filtro={filtro} onFiltro={setFiltro}>
      <section id="catalogo" aria-labelledby="titulo-catalogo">
        <h1 className="titulo-neon mb-3" id="titulo-catalogo">{titulo}</h1>
        <div className="d-flex gap-2 flex-wrap mb-3" role="group" aria-label="Tipo de producto">
          {PESTANAS.map((p) => (
            <button
              key={p.texto}
              type="button"
              className={`chip${filtro.especial === p.id ? " activo" : ""}`}
              aria-pressed={filtro.especial === p.id}
              onClick={() => navigate(rutaCatalogo({ ...filtro, especial: p.id }))}
            >
              {p.texto}
            </button>
          ))}
        </div>
        <div className="barra-filtros mb-4">
          <MenuCategorias onElegir={(categoria, subcategoria) => setFiltro((f) => ({ ...f, categoria, subcategoria }))} />
        </div>
        <Catalogo filtro={filtro} />
      </section>
    </LayoutTienda>
  );
}
