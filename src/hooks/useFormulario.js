import { useState } from "react";

// ========================================================
// useFormulario - Estado y validación de un formulario.
//   valoresIniciales: { campo: valor }
//   reglas: { campo: (valores) => "mensaje de error o vacío" }
// Valida al salir del campo (blur) y en vivo mientras el usuario corrige (change).
// ========================================================
export function useFormulario(valoresIniciales, reglas) {
  const [valores, setValores] = useState(valoresIniciales);
  const [errores, setErrores] = useState({});
  const [tocados, setTocados] = useState({});

  const validarCampo = (campo, vals) => (reglas[campo] ? reglas[campo](vals) : "");

  // Cambia uno o varios campos a la vez (así no se pisan los cambios entre sí)
  const cambiarVarios = (parcial) => {
    const nuevos = { ...valores, ...parcial };
    setValores(nuevos);
    setErrores((previos) => {
      const siguientes = { ...previos };
      Object.keys(parcial).forEach((campo) => {
        if (tocados[campo]) siguientes[campo] = validarCampo(campo, nuevos);
      });
      return siguientes;
    });
  };

  const cambiar = (campo, valor) => cambiarVarios({ [campo]: valor });

  const alSalir = (campo) => {
    setTocados((t) => ({ ...t, [campo]: true }));
    setErrores((e) => ({ ...e, [campo]: validarCampo(campo, valores) }));
  };

  // Valida todos los campos con regla. Devuelve true si no hay errores.
  const validarTodo = () => {
    const nuevosErrores = {};
    const nuevosTocados = {};
    Object.keys(reglas).forEach((campo) => {
      nuevosErrores[campo] = validarCampo(campo, valores);
      nuevosTocados[campo] = true;
    });
    setErrores(nuevosErrores);
    setTocados(nuevosTocados);
    return Object.values(nuevosErrores).every((mensaje) => !mensaje);
  };

  const reiniciar = (nuevosValores = valoresIniciales) => {
    setValores(nuevosValores);
    setErrores({});
    setTocados({});
  };

  // Mensajes que vienen de la lógica de negocio (ej: "ya existe una cuenta con este RUT")
  const ponerErrores = (mensajes) => setErrores((e) => ({ ...e, ...mensajes }));

  // Propiedades listas para un <CampoFormulario>
  const propsCampo = (campo) => ({
    id: campo,
    value: valores[campo],
    onChange: (e) => cambiar(campo, e.target.value),
    onBlur: () => alSalir(campo),
    error: errores[campo] || "",
    valido: !!tocados[campo] && !errores[campo] && String(valores[campo]).trim() !== ""
  });

  return { valores, errores, cambiar, cambiarVarios, alSalir, validarTodo, reiniciar, ponerErrores, propsCampo };
}
