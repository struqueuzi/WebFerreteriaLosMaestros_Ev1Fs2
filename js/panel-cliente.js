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
    <p>Stock disponible: ${producto.stock}</p>
    <button>Hacer pedido</button>
  `;

  contenedorProductos.appendChild(tarjeta);
});