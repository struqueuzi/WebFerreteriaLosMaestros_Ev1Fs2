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