// Revisamos quién inició sesión
const usuarioActual = obtenerSesionActual();

// Si NADIE ha iniciado sesión, o si el que inició sesión NO es cliente, lo mandamos al login
if (!usuarioActual || usuarioActual.rol !== "cliente") {
  window.location.href = "login.html";
}

// Mostramos el correo del usuario en el saludo
document.getElementById("correo-usuario").textContent = usuarioActual.correo;
document.getElementById("titulo-bienvenida").textContent = "Bienvenido, " + usuarioActual.nombre;

// Botón para cerrar sesión
document.getElementById("btn-cerrar-sesion").addEventListener("click", function () {
  cerrarSesion();
  window.location.href = "login.html";
});

// Buscamos el div vacío donde vamos a dibujar los productos
const contenedorProductos = document.getElementById("lista-productos");

// Traemos todos los productos guardados
const productos = obtenerProductos();

// Por cada producto, creamos su "tarjeta" en HTML y la agregamos al contenedor
productos.forEach(function (producto) {
  const tarjeta = document.createElement("div");

  tarjeta.innerHTML = `
    <img src="${producto.imagen}" alt="${producto.nombre}" width="120">
    <h3>${producto.nombre}</h3>
    <p>Precio: $${producto.precio}</p>
    <p>Stock disponible: <span class="stock-actual">${producto.stock}</span></p>
    <label>Cantidad: <input type="number" class="input-cantidad" value="1" min="1"></label>
    <button class="btn-pedido">Hacer pedido</button>
    <p class="mensaje-pedido"></p>
  `;

  // Buscamos, DENTRO de esta tarjeta específica, el botón, el input y el mensaje
  const botonPedido = tarjeta.querySelector(".btn-pedido");
  const inputCantidad = tarjeta.querySelector(".input-cantidad");
  const mensajePedido = tarjeta.querySelector(".mensaje-pedido");
  const spanStock = tarjeta.querySelector(".stock-actual");

  botonPedido.addEventListener("click", function () {
    // Convertimos el valor del input (que llega como texto) a número
    const cantidad = parseInt(inputCantidad.value, 10);

    // Llamamos a la función de datos.js, usando el correo del usuario logueado
    const resultado = hacerPedido(usuarioActual.correo, producto.id, cantidad);

    mensajePedido.textContent = resultado.mensaje;

    if (resultado.exito) {
      // Si el pedido se hizo bien, actualizamos el stock que se ve en pantalla, sin recargar la página
      producto.stock = producto.stock - cantidad;
      spanStock.textContent = producto.stock;
    }
  });

  contenedorProductos.appendChild(tarjeta);
});

// Buscamos el div vacío donde vamos a mostrar el historial
const contenedorHistorial = document.getElementById("historial-compras");

// Traemos TODOS los pedidos guardados (de todos los clientes)
const todosLosPedidos = obtenerPedidos();

// Filtramos: nos quedamos solo con los pedidos de ESTE cliente
const misPedidos = todosLosPedidos.filter(function (pedido) {
  return pedido.clienteCorreo === usuarioActual.correo;
});

// Si no tiene ningún pedido todavía, mostramos un mensaje simple
if (misPedidos.length === 0) {
  contenedorHistorial.textContent = "Todavía no has hecho ningún pedido.";
} else {
  // Por cada pedido, mostramos sus datos
  misPedidos.forEach(function (pedido) {
    const filaPedido = document.createElement("div");

    filaPedido.innerHTML = `
      <p>
        ${pedido.fecha} — ${pedido.productoNombre} (x${pedido.cantidad})
        — Total: $${pedido.total} — Estado: <strong>${pedido.estado}</strong>
      </p>
    `;

    contenedorHistorial.appendChild(filaPedido);
  });
}

// Mostramos el saldo pendiente guardado en el usuario
document.getElementById("saldo-pendiente").textContent = usuarioActual.saldoPendiente;