// ========================================================
// LÓGICA DE LA VISTA COMPLETA DE PRODUCTOS Y FILTRADO REAL
// ========================================================

// 1. Arreglo base con datos de simulación local (Mismas rutas que definiste)
const listadoProductos = [
    { id: 1, nombre: "Cemento Polpaico Especial 25kg", precio: 4890, stock: 120, categoria: "Materiales de Construcción", imagen: "img/cemento.jpg" },
    { id: 2, nombre: "Rotomartillo Eléctrico 800W", precio: 45990, stock: 8, categoria: "Herramientas Eléctricas", imagen: "img/rotomartillo.png" },
    { id: 3, nombre: "Martillo de Carpintero 16oz", precio: 8990, stock: 14, categoria: "Herramientas Manuales", imagen: "img/martillo.jpg" },
    { id: 4, nombre: "Tubo PVC Sanitario 40mm x 3mt", precio: 3290, stock: 45, categoria: "Gasfitería", imagen: "img/tubo-pvc.webp" }
];

let carrito = JSON.parse(localStorage.getItem("carrito_ferreteria")) || [];

// 2. Función para renderizar las tarjetas aceptando una lista filtrada opcional
function mostrarCatalogo(productosAMostrar) {
    const contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (productosAMostrar.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <h4 class="text-muted">No encontramos productos que coincidan con tu búsqueda 🔍</h4>
            </div>
        `;
        return;
    }

    productosAMostrar.forEach(producto => {
        const cardHTML = `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="card h-100 shadow-sm border-1">
                    <!-- Al hacer clic en la imagen te redirige al detalle (Pauta Duoc) -->
                    <a href="detalle-producto.html?id=${producto.id}">
                        <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="height: 180px; object-fit: cover;">
                    </a>
                    <div class="card-body d-flex flex-column p-3">
                        <span class="badge bg-light text-secondary small align-self-start mb-2">${producto.categoria}</span>
                        <!-- Título con enlace funcional al detalle -->
                        <a href="detalle-producto.html?id=${producto.id}" class="text-decoration-none text-dark">
                            <h6 class="card-title fw-bold mb-2">${producto.nombre}</h6>
                        </a>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="fs-5 fw-bold text-primary">$${producto.precio.toLocaleString('es-CL')}</span>
                                <span class="small text-muted">Stock: ${producto.stock} u.</span>
                            </div>
                            <button class="btn btn-warning w-100 fw-bold py-2 btn-sm" onclick="agregarAlCarro(${producto.id}, '${producto.nombre}', ${producto.precio})">
                                🛒 Añadir al carro
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += cardHTML;
    });
}

// 3. BUSCADOR EN TIEMPO REAL: Escucha lo que el usuario escribe en el input
document.getElementById("buscador")?.addEventListener("input", (e) => {
    const textoBusqueda = e.target.value.toLowerCase().trim();
    
    // Filtramos el arreglo buscando coincidencias en el nombre o la categoría
    const productosFiltrados = listadoProductos.filter(producto => 
        producto.nombre.toLowerCase().includes(textoBusqueda) || 
        producto.categoria.toLowerCase().includes(textoBusqueda)
    );
// Volvemos a pintar solo los elementos que calzan
mostrarCatalogo(productosFiltrados);});
// 4. Lógica idéntica de LocalStorage para interactuar con el carro
 function agregarAlCarro(id, nombre, precio) {
    const itemExistente = carrito.find(item => item.id === id);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({ id: id, nombre: nombre, precio: precio, cantidad: 1 });
    }
    localStorage.setItem("carrito_ferreteria", JSON.stringify(carrito));
    actualizarContadorNavbar();
    alert(`¡${nombre} se añadió al carrito!`);
}

function actualizarContadorNavbar() {
    const contador = document.getElementById("contador-carrito");
    if (contador) {
        const totalProductos = carrito.reduce((suma, item) => suma + item.cantidad, 0);
        contador.innerText = totalProductos;
    }
}

// Inicialización automática
document.addEventListener("DOMContentLoaded", () => {
    mostrarCatalogo(listadoProductos);
    actualizarContadorNavbar();
});