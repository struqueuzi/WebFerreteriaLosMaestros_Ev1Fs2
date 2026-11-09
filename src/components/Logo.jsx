import { Link } from "react-router-dom";
import { IconoCasa } from "./Iconos";

// Logo: casita amarilla + "LOS MAESTROS" en cursiva y abajo el lema con letras separadas.
// Props: tamano ("grande" en el pie de página), insignia (rol en los paneles)
export default function Logo({ tamano = "normal", insignia = null, claseInsignia = "insignia-rol" }) {
  return (
    <Link to="/" className={`logo-maestros${tamano === "grande" ? " logo-grande" : ""}`} aria-label="Ferretería Los Maestros, ir al inicio">
      <span className="logo-icono"><IconoCasa tamano={tamano === "grande" ? 54 : 48} /></span>
      <span className="logo-texto">
        <span className="logo-nombre">Los <span>Maestros</span></span>
        <span className="logo-lema">Ferretería · La Serena</span>
      </span>
      {insignia && <span className={`badge ms-2 ${claseInsignia}`}>{insignia}</span>}
    </Link>
  );
}
