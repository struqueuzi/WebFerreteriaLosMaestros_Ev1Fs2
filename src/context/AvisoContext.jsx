import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

// ========================================================
// AvisoContext - Avisos flotantes que desaparecen solos (reemplazan al alert() del navegador).
// Cualquier componente hace:  const { mostrarAviso } = useAviso();  mostrarAviso("texto", true|false)
// ========================================================
const AvisoContext = createContext({ mostrarAviso: () => {} });

export function AvisoProvider({ children, duracion = 3200 }) {
  const [avisos, setAvisos] = useState([]);
  const contador = useRef(0);

  const mostrarAviso = useCallback((mensaje, exito = true) => {
    contador.current += 1;
    const id = contador.current;
    setAvisos((lista) => [...lista, { id, mensaje, exito }]);
    setTimeout(() => setAvisos((lista) => lista.filter((a) => a.id !== id)), duracion);
  }, [duracion]);

  const valor = useMemo(() => ({ mostrarAviso }), [mostrarAviso]);

  return (
    <AvisoContext.Provider value={valor}>
      {children}
      <div className="position-fixed bottom-0 end-0 m-3" style={{ zIndex: 2000, maxWidth: "90vw" }} aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} role="alert" className={`alert ${a.exito ? "alert-success" : "alert-danger"} shadow mb-2`} style={{ whiteSpace: "pre-line" }}>
            {a.mensaje}
          </div>
        ))}
      </div>
    </AvisoContext.Provider>
  );
}

export function useAviso() {
  return useContext(AvisoContext);
}
