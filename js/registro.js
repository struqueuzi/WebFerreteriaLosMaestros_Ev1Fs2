// Esperamos a que el formulario exista en la página antes de trabajar con él
const formRegistro = document.getElementById("form-registro");

// El elemento donde vamos a mostrar los mensajes de error o éxito
const mensajeError = document.getElementById("mensaje-error");

// "submit" es el evento que se dispara cuando el usuario hace clic en "Crear cuenta"
formRegistro.addEventListener("submit", function (evento) {

  // evita que la página se recargue sola (comportamiento por defecto del formulario)
  evento.preventDefault();

  // Sacamos el valor que el usuario escribió en cada campo, usando su id
  const nombre = document.getElementById("nombre").value;
  const rut = document.getElementById("rut").value;
  const correo = document.getElementById("correo").value;
  const telefono = document.getElementById("telefono").value;
  const clave = document.getElementById("clave").value;

  // Llamamos a la función que creamos en datos.js, pasándole los datos del formulario
  const resultado = registrarUsuario(nombre, rut, correo, telefono, clave);

  // resultado.exito es true o false, según si se pudo crear la cuenta o no
  if (resultado.exito) {
    alert(resultado.mensaje); // muestra "Cuenta creada correctamente."
    formRegistro.reset(); // limpia todos los campos del formulario
    window.location.href = "login.html"; // redirige al usuario a la página de login
  } else {
    // Si falló (ej: RUT duplicado), mostramos el mensaje dentro del <p id="mensaje-error">
    mensajeError.textContent = resultado.mensaje;
  }
});