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

// Traemos todos los productos guardados (esta lista completa nunca cambia, solo la usamos para filtrar)
const todosLosProductos = obtenerProductos();

// Dibuja una lista de productos específica (puede ser todos, o un filtro por categoría/subcategoría)
function dibujarProductos(listaProductos) {
  contenedorProductos.innerHTML = ""; // limpiamos lo que hubiera antes de volver a dibujar

  if (listaProductos.length === 0) {
    contenedorProductos.textContent = "No hay productos en esta subcategoría.";
    return;
  }

  listaProductos.forEach(function (producto) {
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

    const botonPedido = tarjeta.querySelector(".btn-pedido");
    const inputCantidad = tarjeta.querySelector(".input-cantidad");
    const mensajePedido = tarjeta.querySelector(".mensaje-pedido");
    const spanStock = tarjeta.querySelector(".stock-actual");

    botonPedido.addEventListener("click", function () {
      const cantidad = parseInt(inputCantidad.value, 10);
      const resultado = hacerPedido(usuarioActual.correo, producto.id, cantidad);

      mensajePedido.textContent = resultado.mensaje;

      if (resultado.exito) {
        producto.stock = producto.stock - cantidad;
        spanStock.textContent = producto.stock;
      }
    });

    contenedorProductos.appendChild(tarjeta);
  });
}

// Al cargar la página, mostramos TODOS los productos (sin filtro)
dibujarProductos(todosLosProductos);

// ============================
// MENÚ DE CATEGORÍAS Y SUBCATEGORÍAS
// ============================

const contenedorMenu = document.getElementById("menu-categorias");

// CATEGORIAS_Y_SUBCATEGORIAS viene de datos.js: { "Herramientas manuales": ["Martillos", "Llaves", ...], ... }
let menuHtml = '<ul class="menu-categorias-lista"><li><a href="#" class="link-categoria" data-categoria="todos">Todos los productos</a></li>';

Object.keys(CATEGORIAS_Y_SUBCATEGORIAS).forEach(function (categoria) {
  const subcategorias = CATEGORIAS_Y_SUBCATEGORIAS[categoria];

  menuHtml += `
    <li class="menu-item-categoria">
      <a href="#" class="link-categoria" data-categoria="${categoria}">${categoria} ▾</a>
      <ul class="submenu-categoria">
  `;

  subcategorias.forEach(function (subcategoria) {
    menuHtml += `<li><a href="#" class="link-subcategoria" data-categoria="${categoria}" data-subcategoria="${subcategoria}">${subcategoria}</a></li>`;
  });

  menuHtml += `</ul></li>`;
});

menuHtml += "</ul>";
contenedorMenu.innerHTML = menuHtml;

// Clic en "Todos los productos": quita cualquier filtro
contenedorMenu.querySelector('[data-categoria="todos"]').addEventListener("click", function (evento) {
  evento.preventDefault();
  dibujarProductos(todosLosProductos);
});

// Clic en el nombre de una CATEGORÍA (sin subcategoría específica): filtra por toda la categoría
contenedorMenu.querySelectorAll(".menu-item-categoria > .link-categoria").forEach(function (link) {
  link.addEventListener("click", function (evento) {
    evento.preventDefault();
    const categoriaElegida = link.dataset.categoria;

    const filtrados = todosLosProductos.filter(function (producto) {
      return producto.categoria === categoriaElegida;
    });

    dibujarProductos(filtrados);
  });
});

// Clic en una SUBCATEGORÍA: filtra por categoría Y subcategoría exacta
contenedorMenu.querySelectorAll(".link-subcategoria").forEach(function (link) {
  link.addEventListener("click", function (evento) {
    evento.preventDefault();
    evento.stopPropagation(); // evita que también se dispare el clic de la categoría padre

    const categoriaElegida = link.dataset.categoria;
    const subcategoriaElegida = link.dataset.subcategoria;

    const filtrados = todosLosProductos.filter(function (producto) {
      return producto.categoria === categoriaElegida && producto.subcategoria === subcategoriaElegida;
    });

    dibujarProductos(filtrados);
  });
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