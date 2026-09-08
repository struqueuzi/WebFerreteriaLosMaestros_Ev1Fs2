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

// ============================
// CATÁLOGO DE PRODUCTOS
// ============================

// Buscamos el div vacío donde vamos a dibujar los productos (ya tiene la clase "row g-4" en el HTML)
const contenedorProductos = document.getElementById("lista-productos");

// Traemos todos los productos guardados (esta lista completa nunca cambia, solo la usamos para filtrar)
const todosLosProductos = obtenerProductos();

// Dibuja una lista de productos específica (puede ser todos, o un filtro por categoría/subcategoría)
function dibujarProductos(listaProductos) {
  contenedorProductos.innerHTML = ""; // limpiamos lo que hubiera antes de volver a dibujar

  if (listaProductos.length === 0) {
    contenedorProductos.innerHTML = `<p class="text-muted">No hay productos en esta subcategoría.</p>`;
    return;
  }

  listaProductos.forEach(function (producto) {
    // Columna Bootstrap: 1 en celular, 2 en tablet, 3 en desktop, 4 en pantallas grandes
    const columna = document.createElement("div");
    columna.className = "col-12 col-sm-6 col-md-4 col-lg-3";

    columna.innerHTML = `
      <div class="card h-100 shadow-sm border-1">
        <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="height: 180px; object-fit: cover;">

        <div class="card-body d-flex flex-column p-3">
          <span class="badge bg-light text-secondary small align-self-start mb-2">${producto.categoria}</span>
          <h6 class="card-title fw-bold text-dark mb-2">${producto.nombre}</h6>

          <div class="mt-auto">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fs-5 fw-bold text-primary">$${producto.precio.toLocaleString('es-CL')}</span>
              <span class="small text-muted">Stock: <span class="stock-actual">${producto.stock}</span> u.</span>
            </div>

            <div class="input-group input-group-sm mb-2">
              <span class="input-group-text">Cant.</span>
              <input type="number" class="form-control input-cantidad" value="1" min="1">
            </div>

            <button class="btn btn-warning w-100 fw-bold btn-agregar-carrito">🛒 Agregar al carrito</button>
            <p class="mensaje-pedido small mt-2 mb-0"></p>
          </div>
        </div>
      </div>
    `;

    const botonAgregar = columna.querySelector(".btn-agregar-carrito");
    const inputCantidad = columna.querySelector(".input-cantidad");
    const mensajePedido = columna.querySelector(".mensaje-pedido");

    botonAgregar.addEventListener("click", function () {
      const cantidad = parseInt(inputCantidad.value, 10);

      if (!cantidad || cantidad < 1) {
        mensajePedido.textContent = "Ingresa una cantidad válida.";
        mensajePedido.classList.remove("text-success");
        mensajePedido.classList.add("text-danger");
        return;
      }

      // Si el producto ya está en el carrito, sumamos la cantidad; si no, lo agregamos nuevo
      const itemExistente = carrito.find((item) => item.id === producto.id);
      if (itemExistente) {
        itemExistente.cantidad += cantidad;
      } else {
        carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: cantidad });
      }

      actualizarLocalStorageCarrito();

      mensajePedido.textContent = "Se agregó al carrito.";
      mensajePedido.classList.remove("text-danger");
      mensajePedido.classList.add("text-success");
    });

    contenedorProductos.appendChild(columna);
  });
}

// ============================
// MENÚ DE CATEGORÍAS Y SUBCATEGORÍAS
// ============================

const contenedorMenu = document.getElementById("menu-categorias");

let menuHtml = `<li class="nav-item"><a class="nav-link text-white p-0 link-categoria" href="#" data-categoria="todos">Todos los productos</a></li>`;

Object.keys(CATEGORIAS_Y_SUBCATEGORIAS).forEach(function (categoria) {
  const subcategorias = CATEGORIAS_Y_SUBCATEGORIAS[categoria];

  menuHtml += `
    <li class="nav-item menu-item-categoria">
      <a class="nav-link text-white p-0 link-categoria" href="#" data-categoria="${categoria}">${categoria} ▾</a>
      <ul class="submenu-categoria">
  `;

  subcategorias.forEach(function (subcategoria) {
    menuHtml += `<li><a class="link-subcategoria" href="#" data-categoria="${categoria}" data-subcategoria="${subcategoria}">${subcategoria}</a></li>`;
  });

  menuHtml += `</ul></li>`;
});

contenedorMenu.innerHTML = menuHtml;

contenedorMenu.querySelector('[data-categoria="todos"]').addEventListener("click", function (evento) {
  evento.preventDefault();
  dibujarProductos(todosLosProductos);
});

contenedorMenu.querySelectorAll(".menu-item-categoria > .link-categoria").forEach(function (link) {
  link.addEventListener("click", function (evento) {
    evento.preventDefault();
    const categoriaElegida = link.dataset.categoria;
    const filtrados = todosLosProductos.filter((p) => p.categoria === categoriaElegida);
    dibujarProductos(filtrados);
  });
});

contenedorMenu.querySelectorAll(".link-subcategoria").forEach(function (link) {
  link.addEventListener("click", function (evento) {
    evento.preventDefault();
    evento.stopPropagation();
    const categoriaElegida = link.dataset.categoria;
    const subcategoriaElegida = link.dataset.subcategoria;
    const filtrados = todosLosProductos.filter(
      (p) => p.categoria === categoriaElegida && p.subcategoria === subcategoriaElegida
    );
    dibujarProductos(filtrados);
  });
});

// Al cargar la página, mostramos TODOS los productos (sin filtro)
dibujarProductos(todosLosProductos);

// ============================
// CARRITO (mismo localStorage "carrito_ferreteria" que usa el sitio público)
// ============================

let carrito = JSON.parse(localStorage.getItem("carrito_ferreteria")) || [];

function renderizarTablaCarrito() {
  const tabla = document.getElementById("tabla-carrito");
  const contenedorVacio = document.getElementById("carrito-vacio");
  const totalTexto = document.getElementById("total-compra");

  if (carrito.length === 0) {
    tabla.innerHTML = "";
    contenedorVacio.classList.remove("d-none");
    totalTexto.innerText = "$0";
    actualizarContadorCarrito();
    return;
  }

  contenedorVacio.classList.add("d-none");
  tabla.innerHTML = "";
  let totalAcumulado = 0;

  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    totalAcumulado += subtotal;

    tabla.innerHTML += `
      <tr>
        <td class="small">${item.nombre}</td>
        <td class="small">$${item.precio.toLocaleString('es-CL')}</td>
        <td>
          <div class="input-group input-group-sm">
            <button class="btn btn-outline-secondary" type="button" onclick="cambiarCantidadCarrito(${index}, -1)">-</button>
            <input type="text" class="form-control text-center bg-white text-dark" value="${item.cantidad}" readonly style="max-width: 40px;">
            <button class="btn btn-outline-secondary" type="button" onclick="cambiarCantidadCarrito(${index}, 1)">+</button>
          </div>
        </td>
        <td class="small fw-bold">$${subtotal.toLocaleString('es-CL')}</td>
        <td><button class="btn btn-sm btn-outline-danger" onclick="eliminarDelCarrito(${index})">🗑️</button></td>
      </tr>
    `;
  });

  totalTexto.innerText = `$${totalAcumulado.toLocaleString('es-CL')}`;
  actualizarContadorCarrito();
}

function cambiarCantidadCarrito(index, cambio) {
  carrito[index].cantidad += cambio;

  if (carrito[index].cantidad <= 0) {
    eliminarDelCarrito(index);
    return;
  }

  actualizarLocalStorageCarrito();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  actualizarLocalStorageCarrito();
}

function actualizarLocalStorageCarrito() {
  localStorage.setItem("carrito_ferreteria", JSON.stringify(carrito));
  renderizarTablaCarrito();
}

function actualizarContadorCarrito() {
  const contador = document.getElementById("contador-carrito");
  if (contador) {
    const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    contador.innerText = totalItems;
  }
}

renderizarTablaCarrito();

// ============================
// CHECKOUT: convierte el carrito en pedidos reales
// ============================

const formCheckoutCliente = document.getElementById("form-checkout-cliente");

formCheckoutCliente.addEventListener("submit", function (evento) {
  evento.preventDefault();

  if (carrito.length === 0) {
    alert("Tu carrito está vacío. Agrega productos antes de confirmar el pedido.");
    return;
  }

  const tipo = document.getElementById("tipoEntregaCliente").value;
  const dir = document.getElementById("direccionCliente").value;

  // Convertimos cada ítem del carrito en un pedido real
  const itemsFallidos = [];

  carrito.forEach(function (item) {
    const resultado = hacerPedido(usuarioActual.correo, item.id, item.cantidad);
    if (!resultado.exito) {
      itemsFallidos.push({ nombre: item.nombre, mensaje: resultado.mensaje });
    }
  });

  if (itemsFallidos.length === 0) {
    alert(
      `¡Pedido realizado con éxito!\n` +
      `Modalidad: ${tipo === 'retiro' ? 'Retiro en Tienda' : 'Despacho a Domicilio'}\n` +
      `Dirección: ${dir}`
    );

    carrito = [];
    actualizarLocalStorageCarrito();
    formCheckoutCliente.reset();
    refrescarHistorial(); // el pedido nuevo aparece al tiro en el historial, sin recargar

    // Cerramos el panel del carrito
    const offcanvasEl = document.getElementById("offcanvasCarrito");
    const offcanvasInstancia = bootstrap.Offcanvas.getInstance(offcanvasEl);
    if (offcanvasInstancia) offcanvasInstancia.hide();
  } else {
    // Algunos productos no se pudieron pedir (ej: sin stock suficiente): quedan en el carrito
    const nombresFallidos = itemsFallidos.map((f) => `- ${f.nombre}: ${f.mensaje}`).join("\n");

    carrito = carrito.filter((item) => itemsFallidos.some((f) => f.nombre === item.nombre));
    actualizarLocalStorageCarrito();

    alert(
      `Algunos productos no se pudieron pedir y quedaron en tu carrito:\n\n${nombresFallidos}\n\n` +
      `El resto de tu pedido sí se procesó correctamente.`
    );
    refrescarHistorial();
  }
});

// ============================
// HISTORIAL DE COMPRAS (función para poder refrescarlo tras cada compra)
// ============================

function refrescarHistorial() {
  const contenedorHistorial = document.getElementById("historial-compras");

  const todosLosPedidos = obtenerPedidos();
  const misPedidos = todosLosPedidos.filter((pedido) => pedido.clienteCorreo === usuarioActual.correo);

  contenedorHistorial.innerHTML = "";

  if (misPedidos.length === 0) {
    contenedorHistorial.innerHTML = `<p class="text-muted mb-0">Todavía no has hecho ningún pedido.</p>`;
    return;
  }

  misPedidos.forEach(function (pedido) {
    const filaPedido = document.createElement("div");
    filaPedido.className = "border-bottom py-2";

    filaPedido.innerHTML = `
      <p class="mb-0">
        ${pedido.fecha} — ${pedido.productoNombre} (x${pedido.cantidad})
        — Total: $${pedido.total.toLocaleString('es-CL')} — Estado: <strong>${pedido.estado}</strong>
      </p>
    `;

    contenedorHistorial.appendChild(filaPedido);
  });
}

refrescarHistorial();

// Mostramos el saldo pendiente guardado en el usuario
document.getElementById("saldo-pendiente").textContent = usuarioActual.saldoPendiente;