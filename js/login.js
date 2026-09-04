// Buscamos el formulario y el elemento donde mostrar errores
const formLogin = document.getElementById("form-login");
const mensajeError = document.getElementById("mensaje-error");

formLogin.addEventListener("submit", function (evento) {
  // Evita que la página se recargue sola
  evento.preventDefault();

  // Sacamos lo que el usuario escribió
  const correo = document.getElementById("correo").value;
  const clave = document.getElementById("clave").value;

  // Llamamos a la función de datos.js que verifica correo + contraseña
  const resultado = iniciarSesion(correo, clave);

  if (resultado.exito) {
    // Según el rol del usuario, lo mandamos a un panel distinto
    if (resultado.usuario.rol === "admin") {
      window.location.href = "panel-admin.html";
    } else if (resultado.usuario.rol === "vendedor") {
      window.location.href = "panel-vendedor.html";
    } else {
      window.location.href = "panel-cliente.html";
    }
  } else {
    // Si el correo o la contraseña estaban mal, mostramos el error
    mensajeError.textContent = resultado.mensaje;
  }
});