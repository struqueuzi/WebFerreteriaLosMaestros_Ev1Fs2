// login.js
const formLogin = document.getElementById("form-login");
const mensajeErrorLogin = document.getElementById("mensaje-error");

if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value;
    const clave = document.getElementById("clave").value;
    const res = iniciarSesion(correo, clave);

    if (res.exito) {
      if (res.usuario.rol === "admin") window.location.href = "panel-admin.html";
      else if (res.usuario.rol === "vendedor") window.location.href = "panel-vendedor.html";
      else window.location.href = "panel-cliente.html";
    } else {
      mensajeErrorLogin.textContent = res.mensaje;
    }
  });
}