import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DIAPOSITIVAS = [
  { clase: "bg-warning text-dark", titulo: "¡Gran Apertura Online!", texto: "Revisa el stock disponible para tus obras en la Región de Coquimbo.", ruta: "/productos", boton: "Ver Catálogo Completo", claseBoton: "btn-dark" },
  { clase: "bg-dark text-white", titulo: "Compra como contratista", texto: "Crea tu cuenta, haz tus pedidos y sigue su estado en tiempo real.", ruta: "/registro", boton: "Crear mi cuenta", claseBoton: "btn-warning" }
];

// Carrusel de promociones con clases de Bootstrap; la diapositiva activa es un estado de React.
export default function Carrusel({ intervalo = 6000 }) {
  const [actual, setActual] = useState(0);
  const cambiar = (delta) => setActual((a) => (a + delta + DIAPOSITIVAS.length) % DIAPOSITIVAS.length);

  useEffect(() => {
    const temporizador = setInterval(() => cambiar(1), intervalo);
    return () => clearInterval(temporizador);
  }, [intervalo]);

  return (
    <section className="mb-5 shadow-sm rounded-3 overflow-hidden" aria-label="Promociones">
      <div className="carousel slide">
        <div className="carousel-inner">
          {DIAPOSITIVAS.map((d, i) => (
            <div key={d.titulo} className={`carousel-item ${i === actual ? "active" : ""} ${d.clase} p-5 text-center`}>
              <h2 className="fw-bold display-6">{d.titulo}</h2>
              <p className="lead">{d.texto}</p>
              <Link to={d.ruta} className={`btn ${d.claseBoton} fw-bold`}>{d.boton}</Link>
            </div>
          ))}
        </div>
        <button className="carousel-control-prev" type="button" aria-label="Anterior" onClick={() => cambiar(-1)}>
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        </button>
        <button className="carousel-control-next" type="button" aria-label="Siguiente" onClick={() => cambiar(1)}>
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
        </button>
      </div>
    </section>
  );
}
