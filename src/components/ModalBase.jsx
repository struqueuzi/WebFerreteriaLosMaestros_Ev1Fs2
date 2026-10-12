import { useEffect } from "react";

// Ventana (modal) de Bootstrap controlada con estado de React: se abre/cierra con la prop "abierto".
// Se cierra con la X, con la tecla Escape o haciendo clic fuera de la ventana.
export default function ModalBase({ abierto, titulo, idTitulo, onCerrar, onSubmit, pie, children, scrollable = false }) {
  useEffect(() => {
    if (!abierto) return undefined;
    const alTeclear = (e) => { if (e.key === "Escape") onCerrar(); };
    document.addEventListener("keydown", alTeclear);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflowAnterior;
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const Contenido = onSubmit ? "form" : "div";
  const propsContenido = onSubmit ? { onSubmit, noValidate: true } : {};

  return (
    <div
      className="modal fade show mostrar"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby={idTitulo}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div className={`modal-dialog${scrollable ? " modal-dialog-scrollable" : ""}`}>
        <Contenido className="modal-content" {...propsContenido}>
          <div className="modal-header">
            <h2 className="modal-title h5 fw-bold" id={idTitulo}>{titulo}</h2>
            <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar}></button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">{pie}</div>
        </Contenido>
      </div>
    </div>
  );
}
