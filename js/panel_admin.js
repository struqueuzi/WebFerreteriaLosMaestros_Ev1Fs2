// ========================================================
// panel_admin.js - GESTIÓN DE ROLES Y PRODUCTOS
// ========================================================

const usuarioActual = obtenerSesionActual();

if (!usuarioActual || usuarioActual.rol !== "admin") {
  window.location.href = "login.html";
}

document.getElementById("correo-usuario").textContent = usuarioActual.correo;
document.getElementById("btn-cerrar-sesion")?.addEventListener("click", () => {
  cerrarSesion();
  window.location.href = "login.html";
});

// --------------------------------------------------------
// TABLA DE USUARIOS Y ROLES
// --------------------------------------------------------
const contenedorUsuarios = document.getElementById("lista-usuarios");
if (contenedorUsuarios) {
  const usuarios = obtenerUsuarios();
  usuarios.forEach((usuario) => {
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

    const selectRol = fila.querySelector(".select-rol");
    selectRol.value = usuario.rol;

    fila.querySelector(".btn-actualizar-rol").addEventListener("click", () => {
      usuario.rol = selectRol.value;
      guardarUsuarios(usuarios);
      const mensaje = fila.querySelector(".mensaje-rol");
      mensaje.textContent = "Rol actualizado";
      setTimeout(() => (mensaje.textContent = ""), 2000);
    });

    contenedorUsuarios.appendChild(fila);
  });
}

// --------------------------------------------------------
// ADMINISTRACIÓN DE PRODUCTOS
// --------------------------------------------------------
const contenedorProductosAdmin = document.getElementById("lista-productos-admin");
let productosAdmin = obtenerProductos();
const categoriasDisponibles = Object.keys(CATEGORIAS_Y_SUBCATEGORIAS);

function dibujarProductosAdmin() {
  if (!contenedorProductosAdmin) return;
  contenedorProductosAdmin.innerHTML = "";

  productosAdmin.forEach((producto) => {
    const columna = document.createElement("div");
    columna.className = "col-12 col-md-6 col-lg-4 mb-3";

    const opcionesCat = categoriasDisponibles
      .map((c) => `<option value="${c}">${c}</option>`)
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
          <select class="form-select form-select-sm select-categoria">${opcionesCat}</select>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-warning btn-sm flex-fill fw-bold btn-guardar-producto">Guardar</button>
          <button class="btn btn-outline-danger btn-sm flex-fill btn-eliminar-producto">Eliminar</button>
        </div>
        <p class="mensaje-producto small text-success mt-2 mb-0"></p>
      </div>
    `;

    const selectCat = columna.querySelector(".select-categoria");
    selectCat.value = producto.categoria;

    columna.querySelector(".btn-guardar-producto").addEventListener("click", () => {
      producto.nombre = columna.querySelector(".input-nombre").value;
      producto.precio = parseInt(columna.querySelector(".input-precio").value, 10);
      producto.stock = parseInt(columna.querySelector(".input-stock").value, 10);
      producto.imagen = columna.querySelector(".input-imagen").value;
      producto.categoria = selectCat.value;

      guardarProductos(productosAdmin);
      const msg = columna.querySelector(".mensaje-producto");
      msg.textContent = "Producto guardado.";
      setTimeout(() => (msg.textContent = ""), 2000);
    });

    columna.querySelector(".btn-eliminar-producto").addEventListener("click", () => {
      productosAdmin = productosAdmin.filter((p) => p.id !== producto.id);
      guardarProductos(productosAdmin);
      dibujarProductosAdmin();
    });

    contenedorProductosAdmin.appendChild(columna);
  });
}

dibujarProductosAdmin();

// Formulario de creación
const formNuevo = document.getElementById("form-nuevo-producto");
if (formNuevo) {
  formNuevo.addEventListener("submit", (e) => {
    e.preventDefault();

    const nuevo = {
      id: Date.now(),
      nombre: document.getElementById("nuevo-nombre").value,
      precio: parseInt(document.getElementById("nuevo-precio").value, 10),
      stock: parseInt(document.getElementById("nuevo-stock").value, 10),
      imagen: document.getElementById("nuevo-imagen").value || "assets/imgs/cemento-especial-transex-25-kg-.jpg",
      categoria: document.getElementById("nuevo-categoria").value,
      subcategoria: "General"
    };

    productosAdmin.push(nuevo);
    guardarProductos(productosAdmin);
    dibujarProductosAdmin();
    formNuevo.reset();
  });
}