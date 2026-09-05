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

// Buscamos el div vacío donde vamos a mostrar los usuarios
const contenedorUsuarios = document.getElementById("lista-usuarios");

// Traemos todos los usuarios registrados
const usuarios = obtenerUsuarios();

usuarios.forEach(function (usuario) {
  const fila = document.createElement("div");

  fila.innerHTML = `
    <p>
      ${usuario.nombre} — ${usuario.correo} — RUT: ${usuario.rut} — Tel: ${usuario.telefono}
    </p>
    <label>Rol:
      <select class="select-rol">
        <option value="cliente">Cliente</option>
        <option value="vendedor">Vendedor</option>
        <option value="admin">Admin</option>
      </select>
    </label>
    <button class="btn-actualizar-rol">Actualizar rol</button>
    <p class="mensaje-rol"></p>
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

// Buscamos el div vacío donde vamos a mostrar los productos
const contenedorProductosAdmin = document.getElementById("lista-productos-admin");

// Traemos todos los productos guardados
const productosAdmin = obtenerProductos();

// Función que dibuja TODOS los productos en pantalla (la hacemos función porque la vamos a volver a llamar después de eliminar uno)
function dibujarProductosAdmin() {
  contenedorProductosAdmin.innerHTML = ""; // limpiamos lo que hubiera antes de volver a dibujar

  productosAdmin.forEach(function (producto) {
    const fila = document.createElement("div");

    fila.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" width="100">
      <label>Nombre: <input type="text" class="input-nombre" value="${producto.nombre}"></label>
      <label>Precio: <input type="number" class="input-precio" value="${producto.precio}" min="0"></label>
      <label>Stock: <input type="number" class="input-stock" value="${producto.stock}" min="0"></label>
      <label>Imagen (ruta): <input type="text" class="input-imagen" value="${producto.imagen}"></label>
      <button class="btn-guardar-producto">Guardar cambios</button>
      <button class="btn-eliminar-producto">Eliminar producto</button>
      <p class="mensaje-producto"></p>
    `;

    const inputNombre = fila.querySelector(".input-nombre");
    const inputPrecio = fila.querySelector(".input-precio");
    const inputStock = fila.querySelector(".input-stock");
    const inputImagen = fila.querySelector(".input-imagen");
    const botonGuardar = fila.querySelector(".btn-guardar-producto");
    const botonEliminar = fila.querySelector(".btn-eliminar-producto");
    const mensajeProducto = fila.querySelector(".mensaje-producto");

    botonGuardar.addEventListener("click", function () {
      producto.nombre = inputNombre.value;
      producto.precio = parseInt(inputPrecio.value, 10);
      producto.stock = parseInt(inputStock.value, 10);
      producto.imagen = inputImagen.value;

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

    contenedorProductosAdmin.appendChild(fila);
  });
}

dibujarProductosAdmin();

// Buscamos el formulario de agregar producto
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
  };

  // Lo agregamos al arreglo que ya teníamos en memoria, y guardamos
  productosAdmin.push(productoNuevo);
  guardarProductos(productosAdmin);

  // Volvemos a dibujar la lista completa, ahora con el producto nuevo incluido
  dibujarProductosAdmin();

  // Limpiamos el formulario para que quede listo para agregar otro
  formNuevoProducto.reset();
});