// ==========================================
// LÓGICA DE CONTROL DEL CARRITO DE COMPRAS
// ==========================================

// 1. Recuperar el arreglo del localStorage
let carrito = JSON.parse(localStorage.getItem("carrito_ferreteria")) || [];

// 2. Renderizar la tabla de productos inmediatamente al cargar
function renderizarTablaCarrito() {
    const tabla = document.getElementById("tabla-carrito");
    const contenedorVacio = document.getElementById("carrito-vacio");
    const totalTexto = document.getElementById("total-compra");

    if (!tabla) return;

    // Si el carro no tiene elementos
    if (carrito.length === 0) {
        tabla.innerHTML = "";
        contenedorVacio.classList.remove("d-none");
        totalTexto.innerText = "$0";
        actualizarContadorNavbar();
        return;
    }

    // Si tiene elementos, ocultamos el mensaje de vacío
    contenedorVacio.classList.add("d-none");
    tabla.innerHTML = "";
    let totalAcumulado = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        totalAcumulado += subtotal;

        const filaHTML = `
            <tr>
                <td><span class="fw-bold text-dark">${item.nombre}</span></td>
                <td>$${item.precio.toLocaleString('es-CL')}</td>
                <td>
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary" type="button" onclick="cambiarCantidad(${index}, -1)">-</button>
                        <input type="text" class="form-control text-center bg-white text-dark" value="${item.cantidad}" readonly style="max-width: 45px;">
                        <button class="btn btn-outline-secondary" type="button" onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                </td>
                <td class="fw-bold text-dark">$${subtotal.toLocaleString('es-CL')}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto(${index})">🗑️</button>
                </td>
            </tr>
        `;
        tabla.innerHTML += filaHTML;
    });

    // Actualizar el valor total general en el resumen
    totalTexto.innerText = `$${totalAcumulado.toLocaleString('es-CL')}`;
    actualizarContadorNavbar();
}

// 3. Función para incrementar o decrementar cantidades (+ / -)
function cambiarCantidad(index, cambio) {
    carrito[index].cantidad += cambio;

    // Si la cantidad llega a 0, eliminamos el ítem por completo
    if (carrito[index].cantidad <= 0) {
        eliminarProducto(index);
        return;
    }

    actualizarLocalStorage();
}

// 4. Función para remover una fila completa (Basurero)
function eliminarProducto(index) {
    carrito.splice(index, 1); // Quita el elemento del arreglo
    actualizarLocalStorage();
}

// 5. Centralizar guardado en el navegador y refresco de pantalla
function actualizarLocalStorage() {
    localStorage.setItem("carrito_ferreteria", JSON.stringify(carrito));
    renderizarTablaCarrito();
}

// 6. Sincronizar el contador del menú superior
function actualizarContadorNavbar() {
    const contador = document.getElementById("contador-carrito");
    if (contador) {
        const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);
        contador.innerText = totalItems;
    }
}

// 7. Simular el procesamiento del formulario de compra
function procesarCompra(event) {
    event.preventDefault(); // Previene que la página recargue de golpe

    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega productos en el catálogo antes de pagar.");
        return;
    }

    const tipo = document.getElementById("tipoEntrega").value;
    const dir = document.getElementById("direccion").value;

    alert(`¡Pedido Recibido!\nModalidad: ${tipo === 'retiro' ? 'Retiro en Tienda' : 'Despacho a Domicilio'}\nDirección registrada: ${dir}\nTu orden pasará a revisión de stock.`);
    
    // Vaciar carro tras la compra exitosa
    carrito = [];
    actualizarLocalStorage();
}

// Inicializar al cargar el documento HTML
document.addEventListener("DOMContentLoaded", renderizarTablaCarrito);
