// ==========================================
// LÓGICA DE VISTA DE CARRITO DE COMPRAS
// ==========================================

function renderizarTablaCarrito() {
  const tabla = document.getElementById("tabla-carrito");
  const contenedorVacio = document.getElementById("carrito-vacio");
  const totalTexto = document.getElementById("total-compra");

  if (!tabla) return;

  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    tabla.innerHTML = "";
    if (contenedorVacio) contenedorVacio.classList.remove("d-none");
    if (totalTexto) totalTexto.innerText = "$0";
    actualizarContadorCarritoGlobal();
    return;
  }

  if (contenedorVacio) contenedorVacio.classList.add("d-none");
  tabla.innerHTML = "";
  let totalAcumulado = 0;

  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    totalAcumulado += subtotal;

    const filaHTML = `
      <tr>
        <td><span class="fw-bold text-dark">${item.nombre}</span></td>
        <td>$${item.precio.toLocaleString("es-CL")}</td>
        <td>
          <div class="input-group input-group-sm" style="max-width: 110px;">
            <button class="btn btn-outline-secondary" type="button" onclick="cambiarCantidadCarrito(${index}, -1)">-</button>
            <input type="text" class="form-control text-center bg-white text-dark" value="${item.cantidad}" readonly>
            <button class="btn btn-outline-secondary" type="button" onclick="cambiarCantidadCarrito(${index}, 1)">+</button>
          </div>
        </td>
        <td class="fw-bold text-dark">$${subtotal.toLocaleString("es-CL")}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarProductoCarrito(${index})">🗑️</button>
        </td>
      </tr>
    `;
    tabla.innerHTML += filaHTML;
  });

  if (totalTexto) totalTexto.innerText = `$${totalAcumulado.toLocaleString("es-CL")}`;
  actualizarContadorCarritoGlobal();
}

function cambiarCantidadCarrito(index, cambio) {
  let carrito = obtenerCarrito();
  carrito[index].cantidad += cambio;

  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
  }

  guardarCarrito(carrito);
  renderizarTablaCarrito();
}

function eliminarProductoCarrito(index) {
  let carrito = obtenerCarrito();
  carrito.splice(index, 1);
  guardarCarrito(carrito);
  renderizarTablaCarrito();
}

function procesarCompra(event) {
  event.preventDefault();
  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    alert("Tu carrito está vacío. Agrega productos antes de realizar la compra.");
    return;
  }

  const sesion = obtenerSesionActual();
  const correoCliente = sesion ? sesion.correo : "invitado@ferreteria.cl";

  const fallidos = [];
  carrito.forEach((item) => {
    const res = hacerPedido(correoCliente, item.id, item.cantidad);
    if (!res.exito) fallidos.push(`${item.nombre}: ${res.mensaje}`);
  });

  if (fallidos.length === 0) {
    alert("¡Pedido realizado con éxito! Tu orden pasará a revisión de stock.");
    vaciarCarrito();
    renderizarTablaCarrito();
  } else {
    alert(`Algunos productos no se completaron por falta de stock:\n\n${fallidos.join("\n")}`);
    renderizarTablaCarrito();
  }
}

document.addEventListener("DOMContentLoaded", renderizarTablaCarrito);