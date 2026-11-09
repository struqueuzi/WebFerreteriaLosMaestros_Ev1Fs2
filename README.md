# 🛠️ Ferretería Los Maestros — Frontend en React + Bootstrap

Evaluación Parcial N° 2 · DSY1104 Desarrollo Fullstack II · *Implementando frontend y pruebas unitarias a mi tienda online*

Tienda online de una ferretería (catálogo, carrito, pedidos, cuenta corriente con cupo y abonos) migrada de HTML/JS a
**React**, con diseño responsivo con **Bootstrap 5** y pruebas unitarias con **Jasmine + Karma**.
No hay backend: los datos se guardan en el `localStorage` del navegador.

## Tecnologías

| Para qué | Herramienta |
|---|---|
| Interfaz (componentes, props, estado, hooks) | React 18 |
| Navegación entre páginas | React Router (`HashRouter`) |
| Diseño responsivo | Bootstrap 5 (grilla, navbar, cards, tablas, formularios, modales) |
| Compilación y servidor de desarrollo | Vite |
| Pruebas unitarias | Jasmine + Karma (Chrome headless) |
| Cobertura de código | karma-coverage + babel-plugin-istanbul |

## Cómo ejecutarlo

Requisitos: Node.js 18 o superior y Google Chrome instalado.

```bash
npm install        # instala dependencias (una sola vez)
npm run dev        # abre la tienda en http://localhost:5173
npm run build      # genera la carpeta dist/ para publicar
npm test           # ejecuta las pruebas unitarias (Jasmine + Karma) y genera la cobertura
```

El informe de cobertura queda en `coverage/html/index.html` (ábrelo en el navegador).
Si Karma no encuentra Chrome, define la variable `CHROME_BIN` con la ruta de `chrome.exe`
(Windows: `set CHROME_BIN=C:\Program Files\Google\Chrome\Application\chrome.exe`).

## Cuentas de prueba

| Rol | Correo | Contraseña | Qué puede hacer |
|---|---|---|---|
| Cliente | cliente@maestros.cl | cliente123 | Comprar, pagar con transferencia o con cuenta corriente (cupo $40.000, debe $15.000), enviar abonos, ver su historial de compras |
| Vendedor | vendedor@maestros.cl | vendedor123 | Actualizar stock y el estado de los pedidos |
| Administrador | admin@maestros.cl | admin123 | Reportes, historial de ventas, usuarios, productos, pedidos, abonos y datos de la cuenta para transferencias |

## Ofertas y novedades

- En **Panel admin → Productos** cada producto tiene un campo **Descuento (%)** (de 0 a 90) y una casilla
  **"Nuevo"**. Mientras escribes el descuento se ve cuánto va a pagar el cliente.
- En la tienda los productos en oferta muestran la etiqueta (por ejemplo **-20%**), el precio rebajado y el anterior
  tachado. Los que son nuevos llevan la etiqueta **Nuevo**.
- El carrito, los pedidos, la transferencia y el historial usan siempre el **precio con descuento**. Si el admin
  cambia el descuento, el carrito se actualiza solo.
- Los enlaces **Ofertas** y **Novedades** del menú abren el catálogo filtrado (`/productos?especial=ofertas` o `nuevos`).
- La primera vez que se abre el sitio se cargan unas ofertas de ejemplo (20%, 15% y 10%) y un producto "Nuevo".
  Solo se aplican a productos que no tengan descuento ni etiqueta, así que no pisan lo que el admin ya cambió.

## Pago con transferencia

1. En el carrito el cliente elige **Transferencia bancaria** como forma de pago y al tiro le aparecen los datos de la
   cuenta (banco, tipo, número, titular, RUT y correo) junto con el monto. Cada dato tiene un botón para copiarlo.
2. Al confirmar se crea el pedido con un **número de venta** (1001, 1002, ...) que el cliente pone en el comentario
   de la transferencia. El pago queda **Por confirmar** y el stock se reserva.
3. El administrador revisa en **Panel admin → Historial de ventas** y hace clic en **Confirmar pago** o **Rechazar**.
   Si lo rechaza, el stock vuelve al inventario y esa venta deja de contar en los reportes.
4. La cuenta se cambia en **Panel admin → Datos de transferencia** (los datos que vienen son de ejemplo, inventados).
   Los pedidos que ya estaban hechos guardan la cuenta que se le mostró al cliente en ese momento.

## Historial de ventas

- **Administrador:** pestaña *Historial de ventas* con todas las compras agrupadas por número de venta. Se puede
  buscar por número, correo o producto y filtrar por forma de pago, estado y rango de fechas. Arriba sale el resumen
  (cantidad de ventas, total vendido, venta promedio y transferencias pendientes) y se puede descargar en CSV para Excel.
- **Cliente:** en su panel ve un resumen con sus últimas compras y el botón **Ver mis compras** lo lleva a una página
  aparte (`/cliente/compras`) con todo el historial. Ahí puede filtrar por fechas (con atajos: últimos 7 días,
  últimos 30 días, este mes, este año), por estado, por forma de pago o buscando el N° de pedido o un producto,
  y ordenar por fecha o por monto. Cada pedido muestra sus productos, total, forma de pago, estado del pago y la barra
  de seguimiento. Si una transferencia sigue pendiente puede volver a ver los datos para pagar.
- Los pedidos que se hicieron antes de existir el número de venta reciben uno corto (1001, 1002...) automáticamente.

## Estado de cuenta corriente (cartola)

- Al abonar, el cliente elige **con qué pagó**: efectivo, tarjeta de débito, tarjeta de crédito o transferencia.
  El administrador ve ese medio en la pestaña **Cuentas corrientes** antes de aprobar.
- El cliente tiene una página aparte, **Estado de cuenta** (`/cliente/cuenta`), con una cartola tipo banco:
  fecha, movimiento, medio de pago, **cargo (+)**, **abono (−)** y el **saldo** que quedó después de cada movimiento.
  Arriba sale el total cargado, el total abonado y cuánto se ha pagado con cada medio. Se puede filtrar por tipo
  (cargos o abonos) y por medio de pago.
- El administrador ve la misma cartola para cualquier cliente con cuenta corriente (selector "Cliente").

## Flujo de la cuenta corriente y los abonos

1. El administrador le asigna al cliente una cuenta corriente con un **cupo** (sugerido $40.000).
2. Al comprar con "Cuenta corriente", el total se suma al **saldo pendiente** y baja el **cupo disponible** (cupo − saldo).
3. El cliente envía un **abono** desde su panel (botón *Abonar a mi cuenta*): queda **Pendiente**.
4. El administrador lo ve en **Panel admin → 💵 Abonos** y lo **aprueba** (baja el saldo, sube el cupo disponible) o lo **rechaza**.

## Estructura del proyecto

```
src/
├── main.jsx                 Punto de entrada (carga Bootstrap, estilos y datos de ejemplo)
├── App.jsx                  Rutas de la aplicación (React Router)
├── pages/                   Una página por pantalla: Inicio, Productos, DetalleProducto, Carrito,
│                            Login, Registro, PanelCliente, PanelVendedor, PanelAdmin
├── components/              Componentes reutilizables: BarraTienda, MenuCategorias, TarjetaProducto,
│                            Catalogo, CampoFormulario, ModalBase, TablaCarrito, TablaPedidos,
│                            CuentaCorriente, HistorialCompras, DatosTransferencia, Admin* ...
├── hooks/                   useFormulario (validación), useAlmacen (datos reactivos), useSesion
├── context/                 AvisoContext (avisos flotantes)
├── lib/                     Lógica de negocio SIN React (validaciones, usuarios, productos, pedidos y ventas,
│                            abonos, transferencia)
├── testing/utils.jsx        Ayudas para probar componentes (montar, escribir, clic...)
├── styles/styles.css        Estilos propios (estilo neón negro/amarillo, Bootstrap en modo oscuro)
└── *.spec.js(x)             Pruebas unitarias, junto a cada archivo que prueban
```

Idea central: la **lógica** vive en `lib/` (funciones puras fáciles de probar) y los **componentes** en
`components/` y `pages/` solo la usan. Cuando cambian los datos, `useAlmacen` avisa a React y la pantalla se redibuja sola.

## Pruebas unitarias

- Se ejecutan con `npm test` (Karma abre Chrome sin ventana y corre todo Jasmine).
- Hay pruebas de **lógica** (`lib/*.spec.js`), de **componentes y DOM** (`components/*.spec.jsx`, `pages/*.spec.jsx`)
  y de **hooks** (`hooks/*.spec.jsx`).
- Mocks: se usan *espías* de Jasmine (`jasmine.createSpy` para funciones recibidas por props y `spyOn` para espiar
  `localStorage`).
- La configuración está en `karma.conf.cjs` y `babel.config.cjs`.

## Subir a GitHub (entregable: enlace público)

```bash
git init
git add .
git commit -m "Frontend React + Bootstrap con pruebas Jasmine/Karma"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```
(El repositorio debe estar en modo **Public**. Las carpetas `node_modules`, `dist` y `coverage` no se suben: están en `.gitignore`.)
