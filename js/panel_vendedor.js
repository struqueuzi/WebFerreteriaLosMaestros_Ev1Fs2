// ========================================================
// panel_vendedor.js - GESTIÓN DE STOCK Y PEDIDOS DE CLIENTES
// ========================================================

const usuarioActual = obtenerSesionActual();

if (!usuarioActual || usuarioActual.rol !== "vendedor") {
  window.location.href = "login.html";
}

document.getElementById("correo-usuario").textContent = usuarioActual.correo;
document.getElementById("btn-cerrar-sesion")?.addEventListener("click", () => {
  cerrarSesion();
  window.location.href = "login.html";
});

// --------------------------------------------------------
// INVENTARIO RÁPIDO
// --------------------------------------------------------
const contenedorInventario = document.getElementById("lista-inventario");
if (contenedorInventario) {
  const productos = obtenerProductos();

  productos.forEach((producto) => {
    const columna = document.createElement("div");
    columna.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-3";

    columna.innerHTML = `
      <div class="card h-100 shadow-sm border-1 p-3">
        <h6 class="fw-bold text-dark mb-1">${producto.nombre}</h6>
        <p class="text-primary fw-bold mb-2">$${producto.precio.toLocaleString("es-CL")}</p>
        <label class="form-label small mb-1">Stock disponible</label>
        <input type="number" class="form-control form-control-sm input-stock mb-2" value="${producto.stock}" min="0">
        <button class="btn btn-warning btn-sm fw-bold btn-actualizar-stock">Actualizar stock</button>
        <p class="mensaje-stock small text-success mt-2 mb-0"></p>
      </div>
    `;

    const inputStock = columna.querySelector(".input-stock");
    const msgStock = columna.querySelector(".mensaje-stock");

    columna.querySelector(".btn-actualizar-stock").addEventListener("click", () => {
      producto.stock = parseInt(inputStock.value, 10);
      guardarProductos(productos);
      msgStock.textContent = `Stock actualizado: ${producto.stock} u.`;
      setTimeout(() => (msgStock.textContent = ""), 2000);
    });

    contenedorInventario.appendChild(columna);
  });
}

// --------------------------------------------------------
// PEDIDOS DE CLIENTES
// --------------------------------------------------------
const contenedorPedidos = document.getElementById("lista-pedidos-vendedor");
if (contenedorPedidos) {
  const pedidos = obtenerPedidos();

  if (pedidos.length === 0) {
    contenedorPedidos.innerHTML = `<tr><td colspan="7" class="text-muted text-center py-3">No hay pedidos registrados aún.</td></tr>`;
  } else {
    pedidos.forEach((pedido) => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${pedido.fecha}</td>
        <td>${pedido.clienteCorreo}</td>
        <td>${pedido.productoNombre}</td>
        <td>${pedido.cantidad}</td>
        <td>$${pedido.total.toLocaleString("es-CL")}</td>
        <td>
          <select class="form-select form-select-sm select-estado">
            <option value="Pendiente">Pendiente</option>
            <option value="En preparación">En preparación</option>
            <option value="Enviado">Enviado</option>
            <option value="Entregado">Entregado</option>
          </select>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary btn-actualizar-estado">Actualizar</button>
          <p class="mensaje-estado small text-success mb-0 mt-1"></p>
        </td>
      `;

      const selectEstado = fila.querySelector(".select-estado");
      selectEstado.value = pedido.estado;

      fila.querySelector(".btn-actualizar-estado").addEventListener("click", () => {
        pedido.estado = selectEstado.value;
        guardarPedidos(pedidos);
        const msgEstado = fila.querySelector(".mensaje-estado");
        msgEstado.textContent = "Estado actualizado";
        setTimeout(() => (msgEstado.textContent = ""), 2000);
      });

      contenedorPedidos.appendChild(fila);
    });
  }
}