# Ferretería Los Maestros

Frontend React y Bootstrap. Evaluación Parcial 3 de Desarrollo Fullstack II.

## Inicio

1. Levanta el [backend de la ferretería](https://github.com/struqueuzi/api-rest_ferreterialm) con el perfil `demo` o `demo-mysql`.
2. Ejecuta `npm ci` y `npm run dev` desde esta carpeta.
3. Abre la URL de Vite, normalmente <http://localhost:5173>.

Vite redirige las solicitudes `/api` a Spring Boot en `http://127.0.0.1:8080`. Define `API_TARGET` antes de iniciar Vite si usas otro puerto. Para un despliegue con archivos estáticos, configura el proxy equivalente en el servidor.

## Cuentas locales de demostración

| Rol | Correo | Clave |
|---|---|---|
| Admin | admin@maestros.cl | admin123 |
| Vendedor | vendedor@maestros.cl | vendedor123 |
| Cliente | cliente@maestros.cl | cliente123 |

El catálogo consume el CRUD versionado. El carrito conserva su selección en el navegador y envía IDs y cantidades a la API. Spring calcula el precio final, revisa stock y crea la orden. El navegador mantiene el JWT de acceso en memoria y recupera la sesión al recargar con la cookie HttpOnly. El panel vendedor permite consultar productos y órdenes.

## Verificación

Ejecuta `npm run build` para compilar y `npm test` para Jasmine y Karma. Si el navegador no se detecta, configura `CHROME_BIN`.

## Alcance de la integración

La integración cubre catálogo, registro, sesión por rol, compra, seguimiento de órdenes, administración de usuarios, cuentas corrientes, abonos y datos de transferencia. El carrito conserva su selección en el navegador. Los datos bancarios del perfil de demostración son ficticios.
