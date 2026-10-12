import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/styles.css";
import App from "./App.jsx";
import { inicializarDatos } from "./lib/inicializar.js";

inicializarDatos(); // productos y cuentas de demostración (solo la primera vez)

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
