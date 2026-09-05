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

// Buscamos el div vacío donde vamos a mostrar el inventario
const contenedorInventario = document.getElementById("lista-inventario");

// Traemos todos los productos guardados
const productos = obtenerProductos();

// Por cada producto, mostramos su info con un campo para editar el stock
productos.forEach(function (producto) {
  const fila = document.createElement("div");

  fila.innerHTML = `
    <h3>${producto.nombre}</h3>
    <p>Precio: $${producto.precio}</p>
    <label>Stock: <input type="number" class="input-stock" value="${producto.stock}" min="0"></label>
    <button class="btn-actualizar-stock">Actualizar stock</button>
    <p class="mensaje-stock"></p>
  `;

  const inputStock = fila.querySelector(".input-stock");
  const botonActualizar = fila.querySelector(".btn-actualizar-stock");
  const mensajeStock = fila.querySelector(".mensaje-stock");

  botonActualizar.addEventListener("click", function () {
    const nuevoStock = parseInt(inputStock.value, 10);

    // Actualizamos el stock de este producto específico
    producto.stock = nuevoStock;

    // Guardamos TODA la lista de productos actualizada
    guardarProductos(productos);

    mensajeStock.textContent = "Stock actualizado a " + nuevoStock + " unidades.";
  });

  contenedorInventario.appendChild(fila);
});

// Buscamos el div vacío donde vamos a mostrar TODOS los pedidos
const contenedorPedidos = document.getElementById("lista-pedidos-vendedor");

// Traemos todos los pedidos (de todos los clientes, a diferencia del panel-cliente que filtraba)
const pedidos = obtenerPedidos();

if (pedidos.length === 0) {
  contenedorPedidos.textContent = "No hay pedidos todavía.";
} else {
  pedidos.forEach(function (pedido) {
    const fila = document.createElement("div");

    fila.innerHTML = `
      <p>
        ${pedido.fecha} — Cliente: ${pedido.clienteCorreo} —
        ${pedido.productoNombre} (x${pedido.cantidad}) — Total: $${pedido.total}
      </p>
      <label>Estado:
        <select class="select-estado">
          <option value="Pendiente">Pendiente</option>
          <option value="En preparación">En preparación</option>
          <option value="Enviado">Enviado</option>
          <option value="Entregado">Entregado</option>
        </select>
      </label>
      <button class="btn-actualizar-estado">Actualizar estado</button>
      <p class="mensaje-estado"></p>
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