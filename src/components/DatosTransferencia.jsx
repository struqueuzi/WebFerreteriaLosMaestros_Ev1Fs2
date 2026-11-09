import { useState } from "react";
import { IconoBanco } from "./Iconos";
import { formatoPesos } from "../lib/formato";
import { textoDatosTransferencia } from "../lib/transferencia";

// Copia al portapapeles. Si el navegador no lo permite (http sin "s", navegador viejo) devuelve false.
async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}

// Tarjeta con la cuenta a la que hay que transferir.
// Props: datos (de obtenerDatosTransferencia), monto (opcional), referencia (N° de pedido, opcional), titulo
export default function DatosTransferencia({ datos, monto = null, referencia = null, titulo = "Datos para la transferencia" }) {
  const [copiado, setCopiado] = useState("");

  const alCopiar = async (clave, texto) => {
    const ok = await copiar(texto);
    setCopiado(ok ? clave : "error");
    setTimeout(() => setCopiado(""), 1800);
  };

  const filas = [
    { clave: "banco", etiqueta: "Banco", valor: datos.banco },
    { clave: "tipo", etiqueta: "Tipo de cuenta", valor: datos.tipoCuenta },
    { clave: "numero", etiqueta: "N° de cuenta", valor: datos.numeroCuenta, copiable: true },
    { clave: "titular", etiqueta: "Titular", valor: datos.titular },
    { clave: "rut", etiqueta: "RUT", valor: datos.rut, copiable: true },
    { clave: "correo", etiqueta: "Correo", valor: datos.correo, copiable: true }
  ];

  return (
    <div className="datos-transferencia" data-testid="datos-transferencia">
      <div className="datos-transferencia-titulo">
        <IconoBanco /> <span>{titulo}</span>
      </div>

      {monto !== null && (
        <div className="datos-transferencia-monto">
          <span>Monto a transferir</span>
          <strong data-testid="monto-transferencia">{formatoPesos(monto)}</strong>
        </div>
      )}

      <dl className="mb-0">
        {filas.map((f) => (
          <div className="dato-fila" key={f.clave}>
            <dt>{f.etiqueta}</dt>
            <dd>
              <span>{f.valor}</span>
              {f.copiable && (
                <button type="button" className="btn-copiar" onClick={() => alCopiar(f.clave, f.valor)} aria-label={`Copiar ${f.etiqueta}`}>
                  {copiado === f.clave ? "Copiado" : "Copiar"}
                </button>
              )}
            </dd>
          </div>
        ))}
        {referencia && (
          <div className="dato-fila">
            <dt>Comentario</dt>
            <dd><span>Pedido N° {referencia}</span></dd>
          </div>
        )}
      </dl>

      <button type="button" className="btn btn-contorno-oscuro btn-sm w-100 mt-3" onClick={() => alCopiar("todo", textoDatosTransferencia(datos, monto, referencia))}>
        {copiado === "todo" ? "Datos copiados ✔" : "Copiar todos los datos"}
      </button>
      {copiado === "error" && <div className="small mt-2">No se pudo copiar, anótalos a mano.</div>}

      <p className="datos-transferencia-nota">
        {referencia
          ? `Pon "Pedido N° ${referencia}" en el comentario de la transferencia y envía el comprobante a ${datos.correo}.`
          : "Al confirmar el pedido te damos un número para que lo pongas en el comentario de la transferencia."}
        {" "}Preparamos tu pedido cuando el pago esté confirmado.
      </p>
    </div>
  );
}
