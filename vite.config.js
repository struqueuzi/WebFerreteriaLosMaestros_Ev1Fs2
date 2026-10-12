import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" para que las rutas de las imágenes (assets/imgs/...) funcionen en cualquier carpeta o hosting
export default defineConfig({
  base: "./",
  plugins: [react()]
});
