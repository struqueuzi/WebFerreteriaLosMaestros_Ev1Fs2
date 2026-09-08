// ==========================================
// LÓGICA DEL CATÁLOGO PÚBLICO INTEGRADO
// ==========================================

function renderizarProductos() {
  const contenedor = document.getElementById("contenedor-productos");
  if (!contenedor) return;

  const productos = obtenerProductos(); // Dinámico desde localStorage
  contenedor.innerHTML = "";

  if (productos.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12 text-center py-5">
        <h4 class="text-muted">No hay productos disponibles por el momento 🔍</h4>
      </div>`;
    return;
  }

  productos.forEach((producto) => {
    const cardHTML = `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm border-1">
          <a href="detalle-producto.html?id=${producto.id}">
            <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="height: 180px; object-fit: cover;">
          </a>
          <div class="card-body d-flex flex-column p-3">
            <span class="badge bg-light text-secondary small align-self-start mb-2">${producto.categoria}</span>
            <a href="detalle-producto.html?id=${producto.id}" class="text-decoration-none text-dark">
              <h6 class="card-title fw-bold mb-2">${producto.nombre}</h6>
            </a>
            <div class="mt-auto">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="fs-5 fw-bold text-primary">$${producto.precio.toLocaleString("es-CL")}</span>
                <span class="small text-muted">Stock: ${producto.stock} u.</span>
              </div>
              <button class="btn btn-warning w-100 fw-bold py-2 btn-sm" onclick="manejarAgregarCarro(${producto.id})">
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

function manejarAgregarCarro(id) {
  const res = agregarAlCarritoGlobal(id, 1);
  alert(res.mensaje);
}

// Búsqueda en tiempo real si existe el campo #buscador
document.getElementById("buscador")?.addEventListener("input", (e) => {
  const texto = e.target.value.toLowerCase().trim();
  const todos = obtenerProductos();
  const filtrados = todos.filter(
    (p) => p.nombre.toLowerCase().includes(texto) || p.categoria.toLowerCase().includes(texto)
  );
  
  const contenedor = document.getElementById("contenedor-productos");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  filtrados.forEach((producto) => {
    const cardHTML = `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm border-1">
          <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="height: 180px; object-fit: cover;">
          <div class="card-body d-flex flex-column p-3">
            <span class="badge bg-light text-secondary small align-self-start mb-2">${producto.categoria}</span>
            <h6 class="card-title fw-bold text-dark mb-2">${producto.nombre}</h6>
            <div class="mt-auto">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="fs-5 fw-bold text-primary">$${producto.precio.toLocaleString("es-CL")}</span>
                <span class="small text-muted">Stock: ${producto.stock} u.</span>
              </div>
              <button class="btn btn-warning w-100 fw-bold py-2 btn-sm" onclick="manejarAgregarCarro(${producto.id})">
                🛒 Añadir al carro
              </button>
            </div>
          </div>
        </div>
      </div>`;
    contenedor.innerHTML += cardHTML;
  });
});

document.addEventListener("DOMContentLoaded", () => {
  renderizarProductos();
});