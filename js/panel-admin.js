// Revisamos quién inició sesión
const usuarioActual = obtenerSesionActual();

// Si NADIE ha iniciado sesión, o si el que inició sesión NO es admin, lo mandamos al login
if (!usuarioActual || usuarioActual.rol !== "admin") {
  window.location.href = "login.html";
}

// Mostramos el correo del admin
document.getElementById("correo-usuario").textContent = usuarioActual.correo;

// Botón para cerrar sesión
document.getElementById("btn-cerrar-sesion").addEventListener("click", function () {
  cerrarSesion();
  window.location.href = "login.html";
});

// ============================
// USUARIOS (tabla Bootstrap)
// ============================

const contenedorUsuarios = document.getElementById("lista-usuarios");
const usuarios = obtenerUsuarios();

usuarios.forEach(function (usuario) {
  const fila = document.createElement("tr");

  fila.innerHTML = `
    <td>${usuario.nombre}</td>
    <td>${usuario.correo}</td>
    <td>${usuario.rut}</td>
    <td>${usuario.telefono}</td>
    <td>
      <select class="form-select form-select-sm select-rol">
        <option value="cliente">Cliente</option>
        <option value="vendedor">Vendedor</option>
        <option value="admin">Admin</option>
      </select>
    </td>
    <td class="text-end">
      <button class="btn btn-sm btn-outline-primary btn-actualizar-rol">Actualizar</button>
      <p class="mensaje-rol small text-success mb-0 mt-1"></p>
    </td>
  `;

  // Dejamos seleccionado el rol que ya tiene ese usuario
  const selectRol = fila.querySelector(".select-rol");
  selectRol.value = usuario.rol;

  const botonRol = fila.querySelector(".btn-actualizar-rol");
  const mensajeRol = fila.querySelector(".mensaje-rol");

  botonRol.addEventListener("click", function () {
    // Actualizamos el rol de ESTE usuario específico
    usuario.rol = selectRol.value;

    // Guardamos TODA la lista de usuarios actualizada
    guardarUsuarios(usuarios);

    mensajeRol.textContent = "Rol actualizado a: " + usuario.rol;
  });

  contenedorUsuarios.appendChild(fila);
});

// ============================
// PRODUCTOS (cards editables Bootstrap)
// ============================

const contenedorProductosAdmin = document.getElementById("lista-productos-admin");
const productosAdmin = obtenerProductos();

// Lista de categorías disponibles (la reutilizamos para armar el <select> de cada producto)
const categoriasDisponibles = ["Herramientas manuales", "Herramientas eléctricas", "Materiales de construcción", "Sin categoría"];

// Función que dibuja TODOS los productos en pantalla (la hacemos función porque la vamos a volver a llamar después de eliminar uno)
function dibujarProductosAdmin() {
  contenedorProductosAdmin.innerHTML = ""; // limpiamos lo que hubiera antes de volver a dibujar

  productosAdmin.forEach(function (producto) {
    const columna = document.createElement("div");
    columna.className = "col-12 col-md-6 col-lg-4";

    // Armamos las opciones del <select> de categoría dinámicamente a partir del arreglo de arriba
    const opcionesCategoria = categoriasDisponibles
      .map((cat) => `<option value="${cat}">${cat}</option>`)
      .join("");

    columna.innerHTML = `
      <div class="card h-100 shadow-sm border-1 p-3">
        <img src="${producto.imagen}" class="rounded mb-3" alt="${producto.nombre}" style="height: 140px; object-fit: cover;">

        <div class="mb-2">
          <label class="form-label small mb-1">Nombre</label>
          <input type="text" class="form-control form-control-sm input-nombre" value="${producto.nombre}">
        </div>
        <div class="row g-2 mb-2">
          <div class="col-6">
            <label class="form-label small mb-1">Precio</label>
            <input type="number" class="form-control form-control-sm input-precio" value="${producto.precio}" min="0">
          </div>
          <div class="col-6">
            <label class="form-label small mb-1">Stock</label>
            <input type="number" class="form-control form-control-sm input-stock" value="${producto.stock}" min="0">
          </div>
        </div>
        <div class="mb-2">
          <label class="form-label small mb-1">Imagen (ruta)</label>
          <input type="text" class="form-control form-control-sm input-imagen" value="${producto.imagen}">
        </div>
        <div class="mb-3">
          <label class="form-label small mb-1">Categoría</label>
          <select class="form-select form-select-sm select-categoria">${opcionesCategoria}</select>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-warning btn-sm flex-fill fw-bold btn-guardar-producto">Guardar</button>
          <button class="btn btn-outline-danger btn-sm flex-fill btn-eliminar-producto">Eliminar</button>
        </div>
        <p class="mensaje-producto small text-success mt-2 mb-0"></p>
      </div>
    `;

    const inputNombre = columna.querySelector(".input-nombre");
    const inputPrecio = columna.querySelector(".input-precio");
    const inputStock = columna.querySelector(".input-stock");
    const inputImagen = columna.querySelector(".input-imagen");
    const selectCategoria = columna.querySelector(".select-categoria");
    const botonGuardar = columna.querySelector(".btn-guardar-producto");
    const botonEliminar = columna.querySelector(".btn-eliminar-producto");
    const mensajeProducto = columna.querySelector(".mensaje-producto");

    // Dejamos seleccionada la categoría que el producto ya tiene
    selectCategoria.value = producto.categoria;

    botonGuardar.addEventListener("click", function () {
      producto.nombre = inputNombre.value;
      producto.precio = parseInt(inputPrecio.value, 10);
      producto.stock = parseInt(inputStock.value, 10);
      producto.imagen = inputImagen.value;
      producto.categoria = selectCategoria.value;

      guardarProductos(productosAdmin);
      mensajeProducto.textContent = "Producto actualizado correctamente.";
    });

    botonEliminar.addEventListener("click", function () {
      // Buscamos la posición de este producto en el arreglo, para sacarlo
      const indice = productosAdmin.indexOf(producto);
      productosAdmin.splice(indice, 1); // elimina 1 elemento desde esa posición

      guardarProductos(productosAdmin);
      dibujarProductosAdmin(); // volvemos a dibujar la lista, ya sin este producto
    });

    contenedorProductosAdmin.appendChild(columna);
  });
}

dibujarProductosAdmin();

// ============================
// FORMULARIO NUEVO PRODUCTO
// ============================

const formNuevoProducto = document.getElementById("form-nuevo-producto");

formNuevoProducto.addEventListener("submit", function (evento) {
  evento.preventDefault();

  // Armamos el producto nuevo con lo que escribió el admin
  const productoNuevo = {
    id: Date.now(),
    nombre: document.getElementById("nuevo-nombre").value,
    precio: parseInt(document.getElementById("nuevo-precio").value, 10),
    stock: parseInt(document.getElementById("nuevo-stock").value, 10),
    imagen: document.getElementById("nuevo-imagen").value,
    categoria: document.getElementById("nuevo-categoria").value,
  };

  // Lo agregamos al arreglo que ya teníamos en memoria, y guardamos
  productosAdmin.push(productoNuevo);
  guardarProductos(productosAdmin);

  // Volvemos a dibujar la lista completa, ahora con el producto nuevo incluido
  dibujarProductosAdmin();

  // Limpiamos el formulario para que quede listo para agregar otro
  formNuevoProducto.reset();
});