// ==========================================
// LÓGICA DEL CATÁLOGO Y CARRITO (LOCALSTORAGE)
// ==========================================

// 1. Arreglo de productos simulando las referencias del negocio (Rúbrica Duoc UC)
const productosFerreteria = [
    { 
        id: 1, 
        nombre: "Cemento Polpaico Especial 25kg", 
        precio: 4890, 
        stock: 120, 
        categoria: "Materiales de Construcción",
        imagen: "assets/imgs/cemento-especial-transex-25-kg-.jpg" // Foto de obra/cemento
    },
    { 
        id: 2, 
        nombre: "Rotomartillo Eléctrico 800W", 
        precio: 45990, 
        stock: 8, 
        categoria: "Herramientas Eléctricas",
        imagen: "assets/imgs/5fb962b131194-edb82be4-f66a-4c09-9089-ed06a679c1c4-1600x1600.jpg" // Foto de herramientas
    },
    { 
        id: 3, 
        nombre: "Martillo de Carpintero 16oz", 
        precio: 8990, 
        stock: 14, 
        categoria: "Herramientas Manuales",
        imagen: "assets/imgs/martillo.jpg" // Foto de martillo/construcción
    },
    { 
        id: 4, 
        nombre: "Tubo PVC Sanitario 40mm x 3mt", 
        precio: 3290, 
        stock: 45, 
        categoria: "Gasfitería",
        imagen: "assets/imgs/tubo-pvc-u-para-alcantarillado-domiciliario-gris-3-metros.jpg" // Foto de tuberías/ingeniería
    }
];

// 2. Intentar recuperar el carrito guardado en el LocalStorage. Si no existe, parte vacío []
let carrito = JSON.parse(localStorage.getItem("carrito_ferreteria")) || [];

// 3. Función para pintar las Tarjetas (Cards) de Bootstrap en la pantalla
function renderizarProductos() {
    const contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return;

    contenedor.innerHTML = ""; // Limpiar antes de renderizar

    productosFerreteria.forEach(producto => {
        // Estructura semántica usando grillas responsive: 1 col en celular, 2 en tablet, 4 en PC
        const cardHTML = `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div class="card h-100 shadow-sm border-1">
                    <!-- Imagen del Producto -->
                    <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="height: 180px; object-fit: cover;">
                    
                    <div class="card-body d-flex flex-column p-3">
                        <span class="badge bg-light text-secondary small align-self-start mb-2">${producto.categoria}</span>
                        <h6 class="card-title fw-bold text-dark mb-2">${producto.nombre}</h6>
                        
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="fs-5 fw-bold text-primary">$${producto.precio.toLocaleString('es-CL')}</span>
                                <span class="small text-muted">Stock: ${producto.stock} u.</span>
                            </div>
                            <!-- Botón Operativo exigido por la pauta -->
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

// 4. Lógica para guardar ítems en la libreta del navegador (LocalStorage)
function agregarAlCarro(id, nombre, precio) {
    // Buscar si el producto ya fue añadido previamente
    const itemExistente = carrito.find(item => item.id === id);

    if (itemExistente) {
        itemExistente.cantidad += 1; // Si ya existe, incrementamos su cantidad
    } else {
        // Si es la primera vez que se presiona, lo empujamos al arreglo con cantidad 1
        carrito.push({
            id: id,
            nombre: nombre,
            precio: precio,
            cantidad: 1
        });
    }

    // Guardar el arreglo actualizado transformado en texto plano (JSON.stringify)
    localStorage.setItem("carrito_ferreteria", JSON.stringify(carrito));
    
    // Actualizar el número rojo flotante del Navbar
    actualizarContadorNavbar();

    alert(`¡${nombre} se añadió al carrito con éxito!`);
}

// 5. Modificar el número de la interfaz superior
function actualizarContadorNavbar() {
    const contador = document.getElementById("contador-carrito");
    if (contador) {
        // Sumar dinámicamente las cantidades totales del carrito
        const totalProductos = carrito.reduce((suma, item) => suma + item.cantidad, 0);
        contador.innerText = totalProductos;
    }
}

// 6. Lanzar la inicialización automáticamente cuando el navegador termine de cargar el HTML
document.addEventListener("DOMContentLoaded", () => {
    renderizarProductos();
    actualizarContadorNavbar();
});
