// Formato de montos en pesos chilenos: 45990 -> "$45.990" (no depende del idioma del navegador)
export function formatoPesos(numero) {
  const entero = Math.round(Number(numero) || 0);
  return "$" + String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
