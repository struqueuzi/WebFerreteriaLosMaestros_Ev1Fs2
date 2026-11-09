import { useEffect, useState } from "react";
import { IconoFlechaArriba } from "./Iconos";

// Botón redondo que aparece al bajar por la página y te devuelve arriba
export default function BotonArriba() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const revisar = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", revisar, { passive: true });
    return () => window.removeEventListener("scroll", revisar);
  }, []);

  if (!visible) return null;
  return (
    <button type="button" className="boton-arriba" aria-label="Volver arriba" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <IconoFlechaArriba />
    </button>
  );
}
