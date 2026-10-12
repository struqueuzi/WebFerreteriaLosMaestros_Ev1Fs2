# Guía para la presentación individual (Situación evaluativa 2)

Cada integrante debe poder explicar los 4 puntos de la rúbrica **con el código abierto**. Esta guía dice qué mostrar y qué decir.

## IE2.1.3 — Cómo se diseñó el proyecto con un framework de JavaScript (15%)
- **Qué decir:** usamos **React** (componentes + estado) con **Vite** y **React Router**. Separamos la *lógica* (`src/lib`) de la *interfaz* (`src/components`, `src/pages`).
- **Mostrar:** el árbol de carpetas (README), `src/App.jsx` (rutas y `RutaProtegida`) y `src/main.jsx`.
- **Frase clave:** "migramos la tienda de HTML/JS a componentes reutilizables; la lógica de negocio quedó intacta y ahora está probada".

## IE2.1.4 — Componentes React, props y estados, y diseño responsivo con Bootstrap (20%)
- **Props:** `TarjetaProducto` recibe `producto` y `onAgregar`; `CampoFormulario` recibe `value`, `onChange`, `error`; `TablaCarrito` recibe `items`, `onCambiar`, `onEliminar`.
- **Estado (`useState`):** `Carrusel` (diapositiva activa), `MenuCategorias` (categoría abierta), `ModalBase` (abierto/cerrado desde el padre), `Carrito` (tipo de entrega, dirección, forma de pago), `PanelAdmin` (pestaña activa).
- **Hook propio:** `useFormulario` (valores, errores, validación al salir del campo y en vivo).
- **Datos compartidos:** `useAlmacen` (`useSyncExternalStore`) redibuja los componentes cuando cambia el `localStorage`.
- **Bootstrap responsivo (mostrar achicando la ventana, F12 → modo celular):**
  - grilla `row` + `col-12 col-sm-6 col-md-4 col-lg-3` en `Catalogo.jsx` (1, 2, 3 y 4 columnas según el ancho);
  - `navbar-expand-lg` + botón hamburguesa en `BarraTienda.jsx`;
  - `table-responsive` en las tablas, `modal`, `card`, `badge`, `progress`, formularios con `form-control` / `is-invalid`.
- **Ejemplo de flujo:** agregar al carro en el catálogo → el contador del navbar sube solo (estado compartido).

## IE2.2.2 — Demostrar pruebas unitarias con Jasmine y Karma (15%)
- **Mostrar:** ejecutar `npm test` y señalar los resultados (SUCCESS) y el resumen de cobertura.
- **Abrir 10 pruebas** (ejemplos para elegir; cada una verifica lógica o DOM):
  1. `validaciones.spec.js` → RUT con dígito verificador correcto/incorrecto.
  2. `validaciones.spec.js` → teléfono celular chileno.
  3. `usuarios.spec.js` → registro rechaza RUT/correo/teléfono repetidos.
  4. `usuarios.spec.js` → el abono del cliente queda *Pendiente* y no baja el saldo.
  5. `usuarios.spec.js` → al aprobar el abono baja el saldo y sube el cupo disponible.
  6. `pedidos.spec.js` → no deja agregar más que el stock.
  7. `pedidos.spec.js` → con cuenta corriente no deja superar el cupo.
  8. `TarjetaProducto.spec.jsx` → botón deshabilitado cuando está agotado (DOM).
  9. `MenuCategorias.spec.jsx` → clic abre el submenú (estado) y elegir llama a `onElegir`.
  10. `Login.spec.jsx` → formulario vacío muestra los errores en rojo.
- **Frase clave:** "cada prueba sigue el patrón Preparar → Actuar → Verificar (Arrange-Act-Assert)".

## IE2.3.2 — Proceso de testeo unitario (10%)
- **Configuración del entorno:** `karma.conf.cjs` (Jasmine, Chrome headless, webpack + Babel para entender JSX, reporte de cobertura) y `babel.config.cjs` (instrumentación con istanbul).
- **Escritura de pruebas:** `describe` / `it` / `beforeEach` / `afterEach`; `localStorage.clear()` en cada `beforeEach` para que las pruebas sean independientes.
- **Mocks:** `jasmine.createSpy("onAgregar")` reemplaza la función que recibe el componente y verifica que se llamó con el producto; `spyOn(Storage.prototype, "setItem")` verifica que se guarda en `localStorage`.
- **Análisis de resultados:** abrir `coverage/html/index.html` (cobertura por archivo: sentencias, ramas, funciones, líneas) y comentar qué falta cubrir y por qué (ver el Documento de cobertura de testing).

## Preguntas típicas del docente (prepara una respuesta)
- ¿Qué diferencia hay entre props y estado? *(props vienen del padre y no se modifican; estado es propio y se cambia con `setX`)*
- ¿Por qué `key` en las listas? *(para que React identifique cada elemento al redibujar)*
- ¿Por qué un componente "controlado"? *(el valor del input vive en el estado de React)*
- ¿Qué es un mock/espía? *(un doble de prueba que registra cómo se llamó a una función)*
- ¿Qué mide la cobertura? *(qué porcentaje del código se ejecutó al correr las pruebas; no garantiza que esté bien probado)*
