import { notificar } from "./almacen";

let activa = false;
let sesion = null;
let renovacion = null;
let versionSesion = 0;
let productos = [];
let pedidos = [];
let usuarios = [];
let abonos = [];
let cuentaBancaria = null;
let ultimaCargaProductos = 0;

export const apiActiva = () => activa;
export const usuarioRemoto = () => sesion?.usuario ?? null;
export const productosRemotos = () => productos;
export const pedidosRemotos = () => pedidos;
export const usuariosRemotos = () => usuarios;
export const abonosRemotos = () => abonos;
export const transferenciaRemota = () => cuentaBancaria;

const fechaLocal = (iso) => new Date(iso).toLocaleString("es-CL");
function cargarPerfil(perfil) {
  return { ...perfil, movimientosCC: perfil.movimientosCC?.map((m) => ({ ...m, fecha: fechaLocal(m.fechaISO) })) || [] };
}

async function enviar(ruta, { metodo = "GET", datos, token } = {}) {
  const respuesta = await fetch("/api/v1" + ruta, {
    method: metodo,
    credentials: "same-origin",
    headers: {
      ...(datos === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: datos === undefined ? undefined : JSON.stringify(datos)
  });
  if (!respuesta.ok) {
    const detalle = await respuesta.json().catch(() => null);
    throw Object.assign(new Error(detalle?.message || `La API respondió ${respuesta.status}`), { estado: respuesta.status });
  }
  return respuesta.status === 204 || respuesta.headers.get("content-length") === "0" ? null
    : respuesta.text().then((texto) => texto ? JSON.parse(texto) : null);
}

function renovar() {
  if (renovacion) return renovacion;
  const version = versionSesion;
  renovacion = enviar("/auth/refresh", { metodo: "POST" })
    .then((nueva) => { if (version === versionSesion) sesion = { ...nueva, usuario: cargarPerfil(nueva.usuario) }; })
    .catch((error) => {
      if (error.estado !== 401) throw error;
      if (version === versionSesion) {
        sesion = null;
        pedidos = [];
        usuarios = [];
        abonos = [];
      }
    })
    .finally(() => { renovacion = null; notificar(); });
  return renovacion;
}

export async function peticion(ruta, opciones = {}, privada = false) {
  const token = privada ? sesion?.token : null;
  try {
    return await enviar(ruta, { ...opciones, token });
  } catch (error) {
    if (!privada || error.estado !== 401 || !sesion) throw error;
    if (token === sesion.token) await renovar();
    if (!sesion) throw new Error("Tu sesión terminó. Vuelve a iniciar sesión.");
    return enviar(ruta, { ...opciones, token: sesion.token });
  }
}

export async function cargarProductos() {
  const carga = ++ultimaCargaProductos;
  const lista = await peticion("/productos");
  if (carga === ultimaCargaProductos) {
    productos = lista.map((p) => ({ ...p, imagen: p.imagen?.startsWith("assets/") ? "/" + p.imagen : p.imagen }));
    notificar();
  }
}

export async function cambiarProducto(id, metodo, datos) {
  await peticion("/productos" + (id == null ? "" : "/" + id), { metodo, datos }, true);
  await cargarProductos();
}

export async function cargarPedidos() {
  const version = versionSesion;
  const ordenes = await peticion("/ordenes", {}, true);
  if (version !== versionSesion || !sesion) return;
  pedidos = [...ordenes].reverse().flatMap((orden) => orden.items.map((item, indice) => ({
    ...orden, ...item, id: `${orden.id}-${indice}`, ordenId: orden.id, numeroVenta: orden.id,
    fecha: new Date(orden.fechaISO).toLocaleString("es-CL"), total: item.precioUnitario * item.cantidad
  })));
  notificar();
}

export async function cargarCuentaBancaria() {
  cuentaBancaria = await peticion("/transferencia");
  notificar();
}

export async function cargarDatosDeCuenta() {
  const version = versionSesion;
  const rol = sesion?.usuario.rol;
  if (!rol) return;
  const [perfil, listaUsuarios, listaAbonos] = await Promise.all([
    peticion("/auth/perfil", {}, true),
    rol === "admin" ? peticion("/usuarios", {}, true) : [],
    rol !== "vendedor" ? peticion("/abonos", {}, true) : []
  ]);
  if (version !== versionSesion || !sesion) return;
  sesion.usuario = cargarPerfil(perfil);
  usuarios = listaUsuarios.map(cargarPerfil);
  abonos = listaAbonos.map((a) => ({ ...a, fecha: fechaLocal(a.fechaISO) }));
  notificar();
}

export async function iniciarSesionApi(correo, clave) {
  try {
    await renovacion;
    const nueva = await enviar("/auth/login", { metodo: "POST", datos: { correo, clave } });
    versionSesion++;
    sesion = { ...nueva, usuario: cargarPerfil(nueva.usuario) };
    pedidos = [];
    usuarios = [];
    abonos = [];
    notificar();
    await Promise.all([cargarPedidos(), ...(activa ? [cargarDatosDeCuenta()] : [])]);
    return { exito: true, usuario: sesion.usuario };
  } catch (error) {
    return { exito: false, mensaje: error.message };
  }
}

export async function cerrarSesionApi() {
  versionSesion++;
  sesion = null;
  pedidos = [];
  usuarios = [];
  abonos = [];
  notificar();
  await renovacion?.catch(() => {});
  await enviar("/auth/logout", { metodo: "POST" });
}

export async function iniciarApi() {
  activa = true;
  await Promise.all([cargarProductos(), cargarCuentaBancaria(), renovar()]);
  if (sesion) await Promise.all([cargarPedidos(), cargarDatosDeCuenta()]);
}
