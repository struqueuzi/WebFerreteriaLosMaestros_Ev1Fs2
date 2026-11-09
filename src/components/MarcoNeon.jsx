// Marco con borde amarillo "de neón" y esquinas cortadas en diagonal.
// Son 3 capas porque clip-path recorta también el brillo: el brillo va en la capa de afuera,
// el borde es la capa amarilla del medio y el fondo oscuro va adentro.
// Props: as (etiqueta HTML de afuera), className, claseFondo, children y el resto se pasa a la etiqueta de afuera
export default function MarcoNeon({ as: Etiqueta = "div", className = "", claseFondo = "", children, ...resto }) {
  return (
    <Etiqueta className={`neon ${className}`} {...resto}>
      <span className="neon-borde">
        <span className={`neon-fondo ${claseFondo}`}>{children}</span>
      </span>
    </Etiqueta>
  );
}
