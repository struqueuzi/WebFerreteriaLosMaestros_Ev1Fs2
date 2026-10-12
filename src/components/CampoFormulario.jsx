// Campo de formulario con etiqueta, mensaje de error bajo el campo (rojo) y marca de correcto (verde).
// Es un componente "controlado": el valor y los cambios los maneja quien lo usa (props value / onChange).
// "pequeno" lo muestra en tamaño compacto (tarjetas de edición).
export default function CampoFormulario({ id, label, type = "text", value, onChange, onBlur, error = "", valido = false, ayuda, pequeno = false, className = "mb-3", ...resto }) {
  const estado = error ? " is-invalid" : valido ? " is-valid" : "";
  return (
    <div className={className}>
      <label htmlFor={id} className={pequeno ? "form-label small fw-bold mb-0" : "form-label fw-bold"}>{label}</label>
      <input
        id={id}
        type={type}
        className={`form-control${pequeno ? " form-control-sm" : ""}${estado}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        {...resto}
      />
      {error && <div id={`${id}-error`} className="invalid-feedback">{error}</div>}
      {ayuda && <div className="form-text">{ayuda}</div>}
    </div>
  );
}
