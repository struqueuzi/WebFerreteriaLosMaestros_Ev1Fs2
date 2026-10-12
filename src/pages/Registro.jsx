import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CampoFormulario from "../components/CampoFormulario";
import PiePagina from "../components/PiePagina";
import { useFormulario } from "../hooks/useFormulario";
import { mensajeDuplicado, mensajeResumenErrores, registrarUsuario, validarUsuario } from "../lib/usuarios";
import {
  mensajeErrorClave, mensajeErrorCorreo, mensajeErrorNombre, mensajeErrorRut, mensajeErrorTelefono
} from "../lib/validaciones";

export default function Registro() {
  const navigate = useNavigate();
  const [resumenError, setResumenError] = useState("");

  // Cada regla devuelve "" (todo bien) o el mensaje que se muestra bajo ese campo
  const form = useFormulario(
    { nombre: "", rut: "", correo: "", telefono: "", clave: "", clave2: "" },
    {
      nombre: (v) => mensajeErrorNombre(v.nombre),
      rut: (v) => mensajeErrorRut(v.rut) || mensajeDuplicado("rut", v.rut),
      correo: (v) => mensajeErrorCorreo(v.correo) || mensajeDuplicado("correo", v.correo),
      telefono: (v) => mensajeErrorTelefono(v.telefono) || mensajeDuplicado("telefono", v.telefono),
      clave: (v) => mensajeErrorClave(v.clave),
      clave2: (v) => (v.clave2 !== v.clave ? "Las contraseñas no coinciden." : v.clave2 ? "" : "Repite tu contraseña.")
    }
  );
  const { valores } = form;

  const enviar = (e) => {
    e.preventDefault();
    setResumenError("");

    // 1) Revisión campo por campo (formato y datos repetidos): se marca en rojo bajo cada campo
    if (!form.validarTodo()) {
      setResumenError(mensajeResumenErrores(validarUsuario(valores)));
      return;
    }

    // 2) Registro (aquí también se revisa que RUT, correo y teléfono no existan ya)
    const res = registrarUsuario(valores.nombre, valores.rut, valores.correo, valores.telefono, valores.clave);
    if (!res.exito) {
      form.ponerErrores(res.errores || {});
      setResumenError(res.mensaje);
      return;
    }
    navigate("/login?registro=ok");
  };

  return (
    <>
      <header className="sticky-top shadow-sm">
        <nav className="navbar navbar-dark bg-dark py-3">
          <div className="container gap-3">
            <Link className="navbar-brand fw-bold fs-3 text-warning" to="/">🛠️ LOS MAESTROS</Link>
            <div className="d-flex align-items-center gap-3">
              <Link to="/" className="text-white text-decoration-none small">← Volver a la tienda</Link>
              <Link to="/login" className="btn btn-outline-warning btn-sm">Iniciar sesión</Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="container my-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-6">
            <div className="card shadow-sm border-0 p-4 rounded-3">
              <h1 className="fw-bold mb-1 h2">Crear cuenta</h1>
              <p className="text-muted small mb-4">Regístrate como cliente para hacer pedidos y seguir su estado. Cada RUT, correo y teléfono solo puede usarse en una cuenta.</p>

              {resumenError && <div className="alert alert-danger" role="alert">{resumenError}</div>}

              <form onSubmit={enviar} noValidate>
                <CampoFormulario label="Nombre completo" placeholder="Ej: Juan Pérez González" autoComplete="name" ayuda="Solo letras y espacios." {...form.propsCampo("nombre")} />
                <CampoFormulario label="RUT" placeholder="Ej: 12345678-5" autoComplete="off" ayuda="Con guión y dígito verificador (puede llevar puntos)." {...form.propsCampo("rut")} />
                <CampoFormulario label="Correo electrónico" type="email" placeholder="nombre@correo.cl" autoComplete="email" {...form.propsCampo("correo")} />
                <CampoFormulario label="Teléfono celular" type="tel" placeholder="Ej: +56912345678" autoComplete="tel" ayuda="Celular chileno: empieza con 9 (el +56 es opcional)." {...form.propsCampo("telefono")} />
                <div className="row g-3 mb-3">
                  <div className="col-12 col-sm-6">
                    <CampoFormulario label="Contraseña" type="password" placeholder="Mínimo 6 caracteres" autoComplete="new-password" className="" {...form.propsCampo("clave")} />
                  </div>
                  <div className="col-12 col-sm-6">
                    <CampoFormulario label="Repetir contraseña" type="password" placeholder="Repite tu contraseña" autoComplete="new-password" className="" {...form.propsCampo("clave2")} />
                  </div>
                </div>
                <button type="submit" className="btn btn-warning w-100 fw-bold py-2">Crear cuenta</button>
              </form>

              <p className="text-center mt-3 mb-0">¿Ya tienes cuenta? <Link to="/login" className="fw-bold">Inicia sesión</Link></p>
            </div>
          </div>
        </div>
      </main>
      <PiePagina />
    </>
  );
}
