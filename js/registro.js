// registro.js
const formRegistro = document.getElementById("form-registro");
const mensajeErrorRegistro = document.getElementById("mensaje-error");

if (formRegistro) {
  formRegistro.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const rut = document.getElementById("rut").value;
    const correo = document.getElementById("correo").value;
    const telefono = document.getElementById("telefono").value;
    const clave = document.getElementById("clave").value;

    const res = registrarUsuario(nombre, rut, correo, telefono, clave);

    if (res.exito) {
      alert(res.mensaje);
      formRegistro.reset();
      window.location.href = "login.html";
    } else if (mensajeErrorRegistro) {
      mensajeErrorRegistro.textContent = res.mensaje;
    }
  });
}