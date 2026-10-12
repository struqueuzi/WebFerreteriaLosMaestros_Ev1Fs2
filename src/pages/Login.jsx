import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import CampoFormulario from "../components/CampoFormulario";
import PiePagina from "../components/PiePagina";
import { useFormulario } from "../hooks/useFormulario";
import { iniciarSesion, rutaPanelPorRol } from "../lib/usuarios";
import { mensajeErrorCorreo } from "../lib/validaciones";

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [errorLogin, setErrorLogin] = useState("");

  const form = useFormulario({ correo: "", clave: "" }, {
    correo: (v) => mensajeErrorCorreo(v.correo),
    clave: (v) => (v.clave ? "" : "Ingresa tu contraseña.")
  });

  const enviar = (e) => {
    e.preventDefault();
    setErrorLogin("");
    if (!form.validarTodo()) return;

    const res = iniciarSesion(form.valores.correo, form.valores.clave);
    if (!res.exito) {
      setErrorLogin(res.mensaje);
      return;
    }

    // Si venía desde el carrito y es cliente, vuelve al carrito para terminar su compra
    if (params.get("volver") === "carrito" && res.usuario.rol === "cliente") {
      navigate("/carrito");
    } else {
      navigate(rutaPanelPorRol(res.usuario.rol));
    }
  };

  return (
    <>
      <header className="sticky-top shadow-sm">
        <nav className="navbar navbar-dark bg-dark py-3">
          <div className="container gap-3">
            <Link className="navbar-brand fw-bold fs-3 text-warning" to="/">🛠️ LOS MAESTROS</Link>
            <div className="d-flex align-items-center gap-3">
              <Link to="/" className="text-white text-decoration-none small">← Volver a la tienda</Link>
              <Link to="/registro" className="btn btn-outline-warning btn-sm">Crear cuenta</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="container my-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card shadow-sm border-0 p-4 rounded-3">
              <h1 className="fw-bold mb-4 h2">Iniciar sesión</h1>

              {params.get("registro") === "ok" && (
                <div className="alert alert-success" role="status">¡Cuenta creada con éxito! Ya puedes iniciar sesión.</div>
              )}

              <form onSubmit={enviar} noValidate>
                <CampoFormulario label="Correo electrónico" type="email" placeholder="nombre@correo.cl" autoComplete="email" {...form.propsCampo("correo")} />
                <CampoFormulario label="Contraseña" type="password" placeholder="Tu contraseña" autoComplete="current-password" {...form.propsCampo("clave")} />
                {errorLogin && <p className="text-danger fw-bold small" role="alert">{errorLogin}</p>}
                <button type="submit" className="btn btn-warning w-100 fw-bold py-2">Ingresar</button>
              </form>

              <p className="text-center mt-3 mb-0">¿No tienes cuenta? <Link to="/registro" className="fw-bold">Regístrate aquí</Link></p>
            </div>

            <div className="card border-0 bg-white shadow-sm p-3 mt-3 small">
              <strong className="mb-2">Cuentas de prueba</strong>
              <div><span className="badge bg-secondary">Cliente</span> cliente@maestros.cl · cliente123</div>
              <div><span className="badge bg-secondary">Vendedor</span> vendedor@maestros.cl · vendedor123</div>
              <div><span className="badge bg-secondary">Admin</span> admin@maestros.cl · admin123</div>
            </div>
          </div>
        </div>
      </main>
      <PiePagina />
    </>
  );
}
