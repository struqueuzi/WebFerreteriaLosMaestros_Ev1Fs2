import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import RutaProtegida from "./components/RutaProtegida";
import { AvisoProvider } from "./context/AvisoContext";
import Carrito from "./pages/Carrito";
import DetalleProducto from "./pages/DetalleProducto";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import PanelAdmin from "./pages/PanelAdmin";
import PanelCliente from "./pages/PanelCliente";
import PanelVendedor from "./pages/PanelVendedor";
import Productos from "./pages/Productos";
import Registro from "./pages/Registro";

// Navegación de la app (React Router). HashRouter: las rutas viajan en el "#" y funciona abriendo
// el sitio en cualquier hosting estático sin configurar el servidor.
export default function App() {
  return (
    <HashRouter>
      <AvisoProvider>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/cliente" element={<RutaProtegida rol="cliente"><PanelCliente /></RutaProtegida>} />
          <Route path="/vendedor" element={<RutaProtegida rol="vendedor"><PanelVendedor /></RutaProtegida>} />
          <Route path="/admin" element={<RutaProtegida rol="admin"><PanelAdmin /></RutaProtegida>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AvisoProvider>
    </HashRouter>
  );
}
