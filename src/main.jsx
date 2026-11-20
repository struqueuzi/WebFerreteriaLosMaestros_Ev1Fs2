import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/styles.css";
import App from "./App.jsx";
import { iniciarApi } from "./lib/api.js";

const raiz = createRoot(document.getElementById("root"));
iniciarApi().then(() => raiz.render(<React.StrictMode><App /></React.StrictMode>))
  .catch((error) => raiz.render(
    <main className="container py-5">
      <h1>No pudimos conectar con la ferretería</h1>
      <p role="alert">{error.message}</p>
      <button className="btn btn-warning" onClick={() => window.location.reload()}>Reintentar</button>
    </main>
  ));
