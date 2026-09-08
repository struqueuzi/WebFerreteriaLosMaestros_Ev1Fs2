// ==========================================
// LÓGICA DEL CATÁLOGO Y CARRITO (LOCALSTORAGE)
// ==========================================

// 1. Traemos los productos REALES guardados por el admin (ya no una lista fija a mano)
const productosFerreteria = obtenerProductos();

// 2. Intentar recuperar el carrito guardado en el LocalStorage. Si no existe, parte vacío []
let carrito = JSON.parse(localStorage.getItem("carrito_ferreteria")) || [];

// 3. Función para pintar las Tarjetas (Cards) de Bootstrap en la pantalla
// Recibe una lista de productos (puede ser todos, o un filtro por categoría/subcategoría)
function renderizarProductos(listaProductos = productosFerreteria) {
    const contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return;

    contenedor.innerHTML = ""; // Limpiar antes de renderizar

    if (listaProductos.length === 0) {
        contenedor.innerHTML = `<p class="text-muted">No hay productos en esta subcategoría.</p>`;
        return;
    }

    listaProductos.forEach(producto => {
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

// ==========================================
// MENÚ DE CATEGORÍAS Y SUBCATEGORÍAS (estilo mega-menú)
// ==========================================

function armarMenuCategorias() {
    const contenedorMenu = document.getElementById("menu-categorias");
    if (!contenedorMenu) return;

    // Empezamos con "Todos los productos", igual que en panel-cliente
    let menuHtml = `<li class="nav-item"><a class="nav-link text-white p-0 link-categoria" href="#" data-categoria="todos">🧱 Todos los Productos</a></li>`;

    // CATEGORIAS_Y_SUBCATEGORIAS viene de datos.js
    Object.keys(CATEGORIAS_Y_SUBCATEGORIAS).forEach(function (categoria) {
        const subcategorias = CATEGORIAS_Y_SUBCATEGORIAS[categoria];

        menuHtml += `
            <li class="nav-item menu-item-categoria">
                <a class="nav-link text-white p-0 link-categoria" href="#" data-categoria="${categoria}">${categoria} ▾</a>
                <ul class="submenu-categoria">
        `;

        subcategorias.forEach(function (subcategoria) {
            menuHtml += `<li><a class="link-subcategoria" href="#" data-categoria="${categoria}" data-subcategoria="${subcategoria}">${subcategoria}</a></li>`;
        });

        menuHtml += `</ul></li>`;
    });

    // Enlaces fijos que ya tenía tu compañero (Nosotros, Blog, Contacto)
    menuHtml += `
        <li class="nav-item"><a class="nav-link text-white p-0" href="nosotros.html">👷 Nosotros</a></li>
        <li class="nav-item"><a class="nav-link text-white p-0" href="blogs.html">📰 Noticias / Blog</a></li>
        <li class="nav-item"><a class="nav-link text-white p-0" href="contacto.html">📞 Contacto</a></li>
    `;

    contenedorMenu.innerHTML = menuHtml;

    // Clic en "Todos los productos"
    contenedorMenu.querySelector('[data-categoria="todos"]').addEventListener("click", function (evento) {
        evento.preventDefault();
        renderizarProductos(productosFerreteria);
    });

    // Clic en el nombre de una CATEGORÍA (sin subcategoría específica)
    contenedorMenu.querySelectorAll(".menu-item-categoria > .link-categoria").forEach(function (link) {
        link.addEventListener("click", function (evento) {
            evento.preventDefault();
            const categoriaElegida = link.dataset.categoria;
            const filtrados = productosFerreteria.filter((p) => p.categoria === categoriaElegida);
            renderizarProductos(filtrados);
        });
    });

    // Clic en una SUBCATEGORÍA
    contenedorMenu.querySelectorAll(".link-subcategoria").forEach(function (link) {
        link.addEventListener("click", function (evento) {
            evento.preventDefault();
            evento.stopPropagation();
            const categoriaElegida = link.dataset.categoria;
            const subcategoriaElegida = link.dataset.subcategoria;
            const filtrados = productosFerreteria.filter(
                (p) => p.categoria === categoriaElegida && p.subcategoria === subcategoriaElegida
            );
            renderizarProductos(filtrados);
        });
    });
}

// 6. Lanzar la inicialización automáticamente cuando el navegador termine de cargar el HTML
document.addEventListener("DOMContentLoaded", () => {
    renderizarProductos();
    armarMenuCategorias();
    actualizarContadorNavbar();
});