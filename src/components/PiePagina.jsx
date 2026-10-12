export default function PiePagina({ conDireccion = false }) {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container text-center">
        {conDireccion && <p className="mb-1 small">Ferretería Los Maestros — La Serena, Región de Coquimbo</p>}
        <p className="mb-0 small">&copy; 2026 Ferretería Los Maestros. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
