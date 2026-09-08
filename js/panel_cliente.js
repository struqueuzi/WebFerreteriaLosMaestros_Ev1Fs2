// ========================================================
// panel-cliente.js - INTERFAZ INTEGRADA DEL CLIENTE
// ========================================================

const usuarioActual = obtenerSesionActual();

if (!usuarioActual || usuarioActual.rol !== "cliente") {
  window.location.href = "login.html";
}

// Mostrar datos de bienvenida
document.getElementById("correo-usuario").textContent = usuarioActual.correo;
const tituloBienvenida = document.getElementById("titulo-bienvenida");
if (tituloBienvenida) tituloBienvenida.textContent = `Bienvenido, ${usuarioActual.nombre}`;

document.getElementById("btn-cerrar-sesion").addEventListener("click", () => {
  cerrarSesion();
  window.location.href = "login.html";
});

// --------------------------------------------------------
// CATÁLOGO CON BÚSQUEDA Y FILTRADO
// --------------------------------------------------------
const contenedorProductos = document.getElementById("lista-productos");
let todosLosProductos = obtenerProductos();

function dibujarProductos(listaProductos) {
  contenedorProductos.innerHTML = "";

  if (listaProductos.length === 0) {
    contenedorProductos.innerHTML = `<div class="col-12 py-4"><p class="text-muted text-center fs-5">No se encontraron productos en esta sección 🔍</p></div>`;
    return;
  }

  listaProductos.forEach((producto) => {
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
              <span class="fs-5 fw-bold text-primary">$${producto.precio.toLocaleString("es-CL")}</span>
              <span class="small text-muted">Stock: ${producto.stock} u.</span>
            </div>
            <div class="input-group input-group-sm mb-2">
              <span class="input-group-text">Cant.</span>
              <input type="number" class="form-control input-cantidad" value="1" min="1" max="${producto.stock}">
            </div>
            <button class="btn btn-warning w-100 fw-bold btn-agregar-carrito">🛒 Agregar al carrito</button>
            <p class="mensaje-pedido small mt-2 mb-0"></p>
          </div>
        </div>
      </div>
    `;

    const btnAgregar = columna.querySelector(".btn-agregar-carrito");
    const inputCant = columna.querySelector(".input-cantidad");
    const msgPedido = columna.querySelector(".mensaje-pedido");

    btnAgregar.addEventListener("click", () => {
      const cantidad = parseInt(inputCant.value, 10);

      if (!cantidad || cantidad < 1 || cantidad > producto.stock) {
        msgPedido.textContent = "Cantidad inválida o supera el stock.";
        msgPedido.className = "mensaje-pedido small text-danger mt-2 mb-0";
        return;
      }

      let carrito = obtenerCarrito();
      const itemExistente = carrito.find((i) => i.id === producto.id);

      if (itemExistente) {
        itemExistente.cantidad += cantidad;
      } else {
        carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad });
      }

      guardarCarrito(carrito);
      renderizarTablaCarrito();

      msgPedido.textContent = "¡Agregado al carrito!";
      msgPedido.className = "mensaje-pedido small text-success mt-2 mb-0";
      setTimeout(() => (msgPedido.textContent = ""), 2500);
    });

    contenedorProductos.appendChild(columna);
  });
}

// Búsqueda en tiempo real
const inputBuscador = document.getElementById("buscador");
if (inputBuscador) {
  inputBuscador.addEventListener("input", (e) => {
    const texto = e.target.value.toLowerCase().trim();
    const filtrados = todosLosProductos.filter(
      (p) => p.nombre.toLowerCase().includes(texto) || p.categoria.toLowerCase().includes(texto)
    );
    dibujarProductos(filtrados);
  });
}

// --------------------------------------------------------
// MENÚ DE CATEGORÍAS
// --------------------------------------------------------
const contenedorMenu = document.getElementById("menu-categorias");
if (contenedorMenu) {
  let menuHtml = `<li class="nav-item"><a class="nav-link text-white p-0 link-categoria" href="#" data-categoria="todos">Todos los productos</a></li>`;

  Object.keys(CATEGORIAS_Y_SUBCATEGORIAS).forEach((cat) => {
    menuHtml += `
      <li class="nav-item menu-item-categoria">
        <a class="nav-link text-white p-0 link-categoria" href="#" data-categoria="${cat}">${cat} ▾</a>
        <ul class="submenu-categoria">
    `;
    CATEGORIAS_Y_SUBCATEGORIAS[cat].forEach((sub) => {
      menuHtml += `<li><a class="link-subcategoria" href="#" data-categoria="${cat}" data-subcategoria="${sub}">${sub}</a></li>`;
    });
    menuHtml += `</ul></li>`;
  });

  contenedorMenu.innerHTML = menuHtml;

  contenedorMenu.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    e.preventDefault();
    todosLosProductos = obtenerProductos();

    const cat = link.dataset.categoria;
    const sub = link.dataset.subcategoria;

    if (cat === "todos") {
      dibujarProductos(todosLosProductos);
    } else if (sub) {
      dibujarProductos(todosLosProductos.filter((p) => p.categoria === cat && p.subcategoria === sub));
    } else if (cat) {
      dibujarProductos(todosLosProductos.filter((p) => p.categoria === cat));
    }
  });
}

// Renderizado inicial del catálogo
dibujarProductos(todosLosProductos);

// --------------------------------------------------------
// CONTROL DEL CARRITO Y CHECKOUT
// --------------------------------------------------------
function renderizarTablaCarrito() {
  const carrito = obtenerCarrito();
  const tabla = document.getElementById("tabla-carrito");
  const contenedorVacio = document.getElementById("carrito-vacio");
  const totalTexto = document.getElementById("total-compra");

  if (!tabla) return;

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

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td class="small fw-bold">${item.nombre}</td>
      <td class="small">$${item.precio.toLocaleString("es-CL")}</td>
      <td>
        <div class="input-group input-group-sm" style="max-width: 100px;">
          <button class="btn btn-outline-secondary btn-menos" type="button">-</button>
          <input type="text" class="form-control text-center bg-white text-dark" value="${item.cantidad}" readonly>
          <button class="btn btn-outline-secondary btn-mas" type="button">+</button>
        </div>
      </td>
      <td class="small fw-bold">$${subtotal.toLocaleString("es-CL")}</td>
      <td><button class="btn btn-sm btn-outline-danger btn-eliminar">🗑️</button></td>
    `;

    fila.querySelector(".btn-menos").addEventListener("click", () => cambiarCantidadCarrito(index, -1));
    fila.querySelector(".btn-mas").addEventListener("click", () => cambiarCantidadCarrito(index, 1));
    fila.querySelector(".btn-eliminar").addEventListener("click", () => eliminarDelCarrito(index));

    tabla.appendChild(fila);
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

function eliminarDelCarrito(index) {
  let carrito = obtenerCarrito();
  carrito.splice(index, 1);
  guardarCarrito(carrito);
  renderizarTablaCarrito();
}

const formCheckout = document.getElementById("form-checkout-cliente");
if (formCheckout) {
  formCheckout.addEventListener("submit", (e) => {
    e.preventDefault();
    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
      alert("Tu carrito está vacío. Agrega productos antes de confirmar el pedido.");
      return;
    }

    const tipo = document.getElementById("tipoEntregaCliente")?.value;
    const dir = document.getElementById("direccionCliente")?.value;

    const fallidos = [];

    carrito.forEach((item) => {
      const res = hacerPedido(usuarioActual.correo, item.id, item.cantidad);
      if (!res.exito) fallidos.push(`${item.nombre}: ${res.mensaje}`);
    });

    if (fallidos.length === 0) {
      alert(`¡Pedido realizado con éxito!\nTipo: ${tipo === "retiro" ? "Retiro en Tienda" : "Despacho"}\nDirección: ${dir}`);
      vaciarCarrito();
      formCheckout.reset();
      todosLosProductos = obtenerProductos();
      dibujarProductos(todosLosProductos);
      refrescarHistorial();

      const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById("offcanvasCarrito"));
      if (offcanvas) offcanvas.hide();
    } else {
      alert(`No se pudieron procesar algunos productos por falta de stock:\n\n${fallidos.join("\n")}`);
      refrescarHistorial();
    }
  });
}

// --------------------------------------------------------
// HISTORIAL DE COMPRAS
// --------------------------------------------------------
function refrescarHistorial() {
  const contenedorHistorial = document.getElementById("historial-compras");
  if (!contenedorHistorial) return;

  const misPedidos = obtenerPedidos().filter((p) => p.clienteCorreo === usuarioActual.correo);
  contenedorHistorial.innerHTML = "";

  if (misPedidos.length === 0) {
    contenedorHistorial.innerHTML = `<p class="text-muted mb-0">Todavía no has realizado ningún pedido.</p>`;
    return;
  }

  misPedidos.forEach((pedido) => {
    const div = document.createElement("div");
    div.className = "border-bottom py-2";
    div.innerHTML = `
      <p class="mb-0 small">
        <strong>${pedido.fecha}</strong> — ${pedido.productoNombre} (x${pedido.cantidad})
        — Total: <strong>$${pedido.total.toLocaleString("es-CL")}</strong>
        — Estado: <span class="badge bg-secondary">${pedido.estado}</span>
      </p>
    `;
    contenedorHistorial.appendChild(div);
  });
}

renderizarTablaCarrito();
refrescarHistorial();