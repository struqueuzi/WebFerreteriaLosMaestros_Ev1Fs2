// Revisamos quién inició sesión
const usuarioActual = obtenerSesionActual();

// Si NADIE ha iniciado sesión, o si el que inició sesión NO es vendedor, lo mandamos al login
if (!usuarioActual || usuarioActual.rol !== "vendedor") {
  window.location.href = "login.html";
}

// Mostramos el correo del vendedor
document.getElementById("correo-usuario").textContent = usuarioActual.correo;

// Botón para cerrar sesión
document.getElementById("btn-cerrar-sesion").addEventListener("click", function () {
  cerrarSesion();
  window.location.href = "login.html";
});

// ============================
// INVENTARIO (cards Bootstrap)
// ============================

const contenedorInventario = document.getElementById("lista-inventario");

// Traemos todos los productos guardados
const productos = obtenerProductos();

// Por cada producto, mostramos su info con un campo para editar el stock
productos.forEach(function (producto) {
  const columna = document.createElement("div");
  columna.className = "col-12 col-sm-6 col-md-4 col-lg-3";

  columna.innerHTML = `
    <div class="card h-100 shadow-sm border-1 p-3">
      <h6 class="fw-bold text-dark mb-1">${producto.nombre}</h6>
      <p class="text-primary fw-bold mb-3">$${producto.precio.toLocaleString('es-CL')}</p>

      <label class="form-label small mb-1">Stock</label>
      <input type="number" class="form-control form-control-sm input-stock mb-2" value="${producto.stock}" min="0">

      <button class="btn btn-warning btn-sm fw-bold btn-actualizar-stock">Actualizar stock</button>
      <p class="mensaje-stock small text-success mt-2 mb-0"></p>
    </div>
  `;

  const inputStock = columna.querySelector(".input-stock");
  const botonActualizar = columna.querySelector(".btn-actualizar-stock");
  const mensajeStock = columna.querySelector(".mensaje-stock");

  botonActualizar.addEventListener("click", function () {
    const nuevoStock = parseInt(inputStock.value, 10);

    // Actualizamos el stock de este producto específico
    producto.stock = nuevoStock;

    // Guardamos TODA la lista de productos actualizada
    guardarProductos(productos);

    mensajeStock.textContent = "Stock actualizado a " + nuevoStock + " unidades.";
  });

  contenedorInventario.appendChild(columna);
});

// ============================
// PEDIDOS DE CLIENTES (tabla Bootstrap)
// ============================

const contenedorPedidos = document.getElementById("lista-pedidos-vendedor");

// Traemos todos los pedidos (de todos los clientes, a diferencia del panel-cliente que filtraba)
const pedidos = obtenerPedidos();

if (pedidos.length === 0) {
  // colspan=7 para que el mensaje ocupe todo el ancho de la tabla
  contenedorPedidos.innerHTML = `<tr><td colspan="7" class="text-muted">No hay pedidos todavía.</td></tr>`;
} else {
  pedidos.forEach(function (pedido) {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${pedido.fecha}</td>
      <td>${pedido.clienteCorreo}</td>
      <td>${pedido.productoNombre}</td>
      <td>${pedido.cantidad}</td>
      <td>$${pedido.total.toLocaleString('es-CL')}</td>
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

    // Dejamos seleccionada la opción que ya tenía el pedido guardado
    const selectEstado = fila.querySelector(".select-estado");
    selectEstado.value = pedido.estado;

    const botonEstado = fila.querySelector(".btn-actualizar-estado");
    const mensajeEstado = fila.querySelector(".mensaje-estado");

    botonEstado.addEventListener("click", function () {
      // Actualizamos el estado de ESTE pedido específico
      pedido.estado = selectEstado.value;

      // Guardamos TODA la lista de pedidos actualizada
      guardarPedidos(pedidos);

      mensajeEstado.textContent = "Estado actualizado a: " + pedido.estado;
    });

    contenedorPedidos.appendChild(fila);
  });
}