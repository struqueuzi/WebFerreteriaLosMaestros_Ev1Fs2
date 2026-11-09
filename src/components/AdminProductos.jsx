import { useState } from "react";
import CampoFormulario from "./CampoFormulario";
import { useAlmacen } from "../hooks/useAlmacen";
import { useFormulario } from "../hooks/useFormulario";
import { useAviso } from "../context/AvisoContext";
import { formatoPesos } from "../lib/formato";
import {
  categoriasDisponibles, descuentoDe, guardarProductos, IMAGEN_POR_DEFECTO, mensajeErrorDescuento,
  obtenerProductos, precioFinal, subcategoriasDe
} from "../lib/productos";
import { mensajeErrorMontoEntero } from "../lib/validaciones";

function SelectCategoria({ categoria, subcategoria, onCambio, idBase = "" }) {
  return (
    <div className="row g-2 mb-3">
      <div className="col-6">
        <label htmlFor={`${idBase}categoria`} className="form-label small fw-bold mb-0">Categoría</label>
        <select id={`${idBase}categoria`} className="form-select form-select-sm" value={categoria}
          onChange={(e) => onCambio({ categoria: e.target.value, subcategoria: subcategoriasDe(e.target.value)[0] || "" })}>
          {categoriasDisponibles(categoria).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="col-6">
        <label htmlFor={`${idBase}subcategoria`} className="form-label small fw-bold mb-0">Subcategoría</label>
        <select id={`${idBase}subcategoria`} className="form-select form-select-sm" value={subcategoria}
          onChange={(e) => onCambio({ subcategoria: e.target.value })}>
          {subcategoriasDe(categoria, subcategoria).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}

// Descuento (%) y casilla "Nuevo". Muestra al tiro cuánto va a pagar el cliente.
function CamposOferta({ idBase, precio, descuento, esNuevo, error, onCambio }) {
  const precioNum = Number(precio) || 0;
  const valido = !error && precioNum > 0;
  const final = valido ? precioFinal({ precio: precioNum, descuento: Number(descuento) || 0 }) : 0;

  return (
    <div className="row g-2 align-items-end mb-2">
      <div className="col-6">
        <label htmlFor={`${idBase}descuento`} className="form-label small fw-bold mb-0">Descuento (%)</label>
        <input
          id={`${idBase}descuento`}
          type="number" min="0" max="90" inputMode="numeric" placeholder="0"
          className={`form-control form-control-sm${error ? " is-invalid" : ""}`}
          value={descuento}
          onChange={(e) => onCambio({ descuento: e.target.value })}
        />
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
      <div className="col-6">
        <div className="form-check mb-1">
          <input id={`${idBase}nuevo`} type="checkbox" className="form-check-input" checked={esNuevo} onChange={(e) => onCambio({ esNuevo: e.target.checked })} />
          <label htmlFor={`${idBase}nuevo`} className="form-check-label small fw-bold">Etiqueta "Nuevo"</label>
        </div>
      </div>
      {valido && Number(descuento) > 0 && (
        <div className="col-12 small text-warning" data-testid={`${idBase}precio-final`}>
          El cliente paga {formatoPesos(final)} (antes {formatoPesos(precioNum)})
        </div>
      )}
    </div>
  );
}

// Tarjeta para editar o eliminar UN producto existente (estado propio del formulario de la tarjeta)
function ProductoEditable({ producto }) {
  const { mostrarAviso } = useAviso();
  const [campos, setCampos] = useState({
    nombre: producto.nombre, precio: String(producto.precio), stock: String(producto.stock),
    imagen: producto.imagen, categoria: producto.categoria, subcategoria: producto.subcategoria,
    descuento: descuentoDe(producto) ? String(descuentoDe(producto)) : "", esNuevo: !!producto.esNuevo
  });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const cambiar = (parcial) => setCampos((c) => ({ ...c, ...parcial }));
  const campo = (nombre) => ({ id: `${nombre}-${producto.id}`, value: campos[nombre], onChange: (e) => cambiar({ [nombre]: e.target.value }), error: errores[nombre] || "", pequeno: true, className: "mb-2" });

  const guardar = () => {
    const nuevos = {};
    if (campos.nombre.trim().length < 3) nuevos.nombre = "El nombre debe tener al menos 3 caracteres.";
    if (mensajeErrorMontoEntero(campos.precio, 1)) nuevos.precio = "El precio debe ser un entero mayor a 0.";
    if (mensajeErrorMontoEntero(campos.stock, 0)) nuevos.stock = "El stock debe ser un entero igual o mayor a 0.";
    const eDescuento = mensajeErrorDescuento(campos.descuento);
    if (eDescuento) nuevos.descuento = eDescuento;
    setErrores(nuevos);
    setMensaje("");
    if (Object.keys(nuevos).length > 0) return;

    const todos = obtenerProductos();
    const objetivo = todos.find((p) => p.id === producto.id);
    if (!objetivo) return;
    Object.assign(objetivo, {
      nombre: campos.nombre.trim(), precio: Number(campos.precio), stock: Number(campos.stock),
      imagen: campos.imagen.trim() || IMAGEN_POR_DEFECTO, categoria: campos.categoria, subcategoria: campos.subcategoria,
      descuento: Number(campos.descuento) || 0, esNuevo: campos.esNuevo
    });
    guardarProductos(todos);
    setMensaje("Producto actualizado correctamente ✔");
  };

  const eliminar = () => {
    if (!window.confirm(`¿Eliminar "${producto.nombre}" del catálogo? Esta acción no se puede deshacer.`)) return;
    guardarProductos(obtenerProductos().filter((p) => p.id !== producto.id));
    mostrarAviso("Producto eliminado.");
  };

  return (
    <div className="card h-100 p-3 producto-editable">
      <div className="position-relative">
        <img src={producto.imagen} alt={producto.nombre} className="rounded mb-3 w-100" style={{ height: 120, objectFit: "contain", background: "#fff" }} />
        {descuentoDe(producto) > 0 && <span className="etiqueta-oferta">-{descuentoDe(producto)}%</span>}
        {!descuentoDe(producto) && producto.esNuevo && <span className="etiqueta-oferta nuevo">Nuevo</span>}
      </div>
      <CampoFormulario label="Nombre" {...campo("nombre")} />
      <div className="row g-2">
        <div className="col-6"><CampoFormulario label="Precio ($)" type="number" min="1" {...campo("precio")} /></div>
        <div className="col-6"><CampoFormulario label="Stock" type="number" min="0" {...campo("stock")} /></div>
      </div>
      <CampoFormulario label="Imagen (ruta o URL)" list="imagenes-sugeridas" {...campo("imagen")} />
      <SelectCategoria categoria={campos.categoria} subcategoria={campos.subcategoria} onCambio={cambiar} idBase={`p${producto.id}-`} />
      <CamposOferta idBase={`p${producto.id}-`} precio={campos.precio} descuento={campos.descuento} esNuevo={campos.esNuevo} error={errores.descuento} onCambio={cambiar} />
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-warning btn-sm fw-bold flex-fill btn-guardar" onClick={guardar}>Guardar cambios</button>
        <button type="button" className="btn btn-outline-danger btn-sm btn-eliminar" onClick={eliminar}>Eliminar</button>
      </div>
      {mensaje && <div className="small mt-2 text-success">{mensaje}</div>}
    </div>
  );
}

const NUEVO_VACIO = {
  nombre: "", precio: "", stock: "", imagen: "", descuento: "", esNuevo: true,
  categoria: categoriasDisponibles()[0], subcategoria: subcategoriasDe(categoriasDisponibles()[0])[0]
};

// Formulario "Agregar producto nuevo"
function FormularioProducto() {
  const { mostrarAviso } = useAviso();
  const form = useFormulario(NUEVO_VACIO, {
    nombre: (v) => (v.nombre.trim().length < 3 ? "El nombre debe tener al menos 3 caracteres." : ""),
    precio: (v) => (mensajeErrorMontoEntero(v.precio, 1) ? "El precio debe ser un entero mayor a 0." : ""),
    stock: (v) => (mensajeErrorMontoEntero(v.stock, 0) ? "El stock debe ser un entero igual o mayor a 0." : ""),
    descuento: (v) => mensajeErrorDescuento(v.descuento)
  });
  const { valores } = form;

  const agregar = (e) => {
    e.preventDefault();
    if (!form.validarTodo()) return;
    guardarProductos([
      ...obtenerProductos(),
      {
        id: Date.now(), nombre: valores.nombre.trim(), precio: Number(valores.precio), stock: Number(valores.stock),
        imagen: valores.imagen.trim() || IMAGEN_POR_DEFECTO, categoria: valores.categoria, subcategoria: valores.subcategoria,
        descuento: Number(valores.descuento) || 0, esNuevo: valores.esNuevo
      }
    ]);
    form.reiniciar();
    mostrarAviso("Producto agregado al catálogo.");
  };

  return (
    <form onSubmit={agregar} noValidate>
      <div className="row g-3">
        <div className="col-12 col-md-6"><CampoFormulario label="Nombre" placeholder="Ej: Llave Stillson 14 pulgadas" {...form.propsCampo("nombre")} id="nuevo-nombre" className="" /></div>
        <div className="col-6 col-md-3"><CampoFormulario label="Precio ($)" type="number" min="1" placeholder="9990" {...form.propsCampo("precio")} id="nuevo-precio" className="" /></div>
        <div className="col-6 col-md-3"><CampoFormulario label="Stock inicial" type="number" min="0" placeholder="20" {...form.propsCampo("stock")} id="nuevo-stock" className="" /></div>
        <div className="col-12">
          <SelectCategoria categoria={valores.categoria} subcategoria={valores.subcategoria} onCambio={form.cambiarVarios} idBase="nuevo-" />
        </div>
        <div className="col-12 col-md-6">
          <CamposOferta idBase="nuevo-" precio={valores.precio} descuento={valores.descuento} esNuevo={valores.esNuevo} error={form.errores ? form.errores.descuento : ""} onCambio={form.cambiarVarios} />
        </div>
        <div className="col-12">
          <CampoFormulario label="Imagen (ruta o URL, opcional)" list="imagenes-sugeridas" placeholder="Elige una sugerida o pega una URL (https://...)" ayuda="Si la dejas vacía se usa una imagen por defecto." {...form.propsCampo("imagen")} id="nuevo-imagen" className="" />
        </div>
      </div>
      <button type="submit" className="btn btn-warning fw-bold mt-3">Agregar producto</button>
    </form>
  );
}

// Pestaña "Productos": editar, eliminar y agregar productos del catálogo.
export default function AdminProductos() {
  useAlmacen();
  const productos = obtenerProductos();

  return (
    <>
      <div className="card p-4 mb-4">
        <h2 className="titulo-neon h4 mb-1">Productos del catálogo</h2>
        <p className="text-secondary small">Para poner un producto en oferta escribe el % de descuento. Con 0 (o vacío) vuelve a su precio normal.</p>
        {productos.length === 0 ? (
          <p className="text-muted">No hay productos. Agrega el primero con el formulario de abajo.</p>
        ) : (
          <div className="row g-3">
            {productos.map((p) => (
              <div className="col-12 col-md-6 col-xl-4" key={p.id}>
                <ProductoEditable producto={p} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-4">
        <h2 className="titulo-neon h4 mb-3">Agregar producto nuevo</h2>
        <FormularioProducto />
        <datalist id="imagenes-sugeridas">
          <option value="assets/imgs/martillo.jpg"></option>
          <option value="assets/imgs/cemento.jpg"></option>
          <option value="assets/imgs/rotomartillo-sds-plus-800w-26mm-shr263ka-b3.jpg"></option>
          <option value="assets/imgs/tubo-pvc-u-para-alcantarillado-domiciliario-gris-3-metros.jpg"></option>
          <option value="assets/imgs/cemento-especial-transex-25-kg-.jpg"></option>
        </datalist>
      </div>
    </>
  );
}
