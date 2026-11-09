import { Link } from "react-router-dom";
import Logo from "./Logo";
import { IconoCorreo, IconoFacebook, IconoInstagram, IconoTelefono, IconoTiktok, IconoUbicacion, IconoYoutube } from "./Iconos";

const REDES = [
  { nombre: "Facebook", url: "https://www.facebook.com/", Icono: IconoFacebook },
  { nombre: "Instagram", url: "https://www.instagram.com/", Icono: IconoInstagram },
  { nombre: "TikTok", url: "https://www.tiktok.com/", Icono: IconoTiktok },
  { nombre: "YouTube", url: "https://www.youtube.com/", Icono: IconoYoutube }
];

// Pie de página con 4 columnas (en celular quedan una debajo de otra).
// El id="contacto" es al que baja el botón "Contacto" del menú.
export default function PiePagina() {
  return (
    <footer className="pie" id="contacto">
      <div className="container">
        <div className="row g-4 pie-columnas">
          <div className="col-12 col-md-6 col-lg-3">
            <Logo tamano="grande" />
            <p className="pie-lema">Construyendo tus proyectos desde La Serena</p>
          </div>

          <div className="col-12 col-sm-6 col-lg-3 pie-col">
            <h2 className="pie-titulo">Enlaces rápidos</h2>
            <ul className="list-unstyled pie-lista">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/productos">Productos</Link></li>
              <li><Link to="/carrito">Mi carrito</Link></li>
              <li><Link to="/login">Mi cuenta</Link></li>
            </ul>
          </div>

          <div className="col-12 col-sm-6 col-lg-3 pie-col">
            <h2 className="pie-titulo">Contacto</h2>
            <ul className="list-unstyled pie-lista pie-contacto">
              <li><IconoTelefono /> <a href="tel:+56512345678">+56 51 234 5678</a></li>
              <li><IconoCorreo /> <a href="mailto:ventas@losmaestros.cl">ventas@losmaestros.cl</a></li>
              <li><IconoUbicacion /> La Serena, Región de Coquimbo</li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-lg-3 pie-col">
            <h2 className="pie-titulo">Síguenos</h2>
            <div className="d-flex gap-3">
              {REDES.map(({ nombre, url, Icono }) => (
                <a key={nombre} href={url} target="_blank" rel="noreferrer" className="red-social" aria-label={nombre}><Icono /></a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="pie-derechos">&copy; 2026 Ferretería Los Maestros. Todos los derechos reservados.</div>
    </footer>
  );
}
