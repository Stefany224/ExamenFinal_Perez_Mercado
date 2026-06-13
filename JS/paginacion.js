let listadoCompleto  = [];
let paginaActual     = 1;
const ITEMS_POR_PAGINA = 10;

// Inicializacion de la paginacion con nuevo listado completo
function iniciarPaginacion(listado, fnRenderizar) {
  listadoCompleto = listado;
  paginaActual    = 1;
  _renderPagina(fnRenderizar);
}

// funcion para navegar a una pagina especifica
function irAPagina(pagina, fnRenderizar) {
  const totalPaginas = Math.ceil(listadoCompleto.length / ITEMS_POR_PAGINA);
  if (pagina < 1 || pagina > totalPaginas) return;
  paginaActual = pagina;
  _renderPagina(fnRenderizar);

  // Movemos el foco al inicio de los resultados 
  const resultados = document.getElementById('resultados');
  if (resultados) resultados.focus();
}

// Renderizamos el slice de la pagina actual y actualizamos los controles
function _renderPagina(fnRenderizar) {
  const totalPaginas = Math.ceil(listadoCompleto.length / ITEMS_POR_PAGINA);
  const inicio       = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const fin          = inicio + ITEMS_POR_PAGINA;

  fnRenderizar(listadoCompleto.slice(inicio, fin));
  _renderControles(totalPaginas);
}

// funcion que construye los botones de paginacion en el DOM
function _renderControles(totalPaginas) {
  const contenedor = document.getElementById('paginacion');
  if (!contenedor) return;

  if (totalPaginas <= 1) {
    contenedor.innerHTML = '';
    return;
  }

  const rango = 2;
  const ini   = Math.max(1, paginaActual - rango);
  const fin   = Math.min(totalPaginas, paginaActual + rango);

  let html = `<nav aria-label="Paginacion de resultados">
    <ul class="pagination justify-content-center flex-wrap mb-1">`;

  // Btn anterior
  html += `<li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
    <button class="page-link"
      onclick="irAPagina(${paginaActual - 1}, renderizarTarjetasLicitacion)"
      aria-label="Pagina anterior">
      &laquo;
    </button></li>`;

  if (ini > 1) {
    html += `<li class="page-item"><button class="page-link" onclick="irAPagina(1, renderizarTarjetasLicitacion)">1</button></li>`;
    if (ini > 2) html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
  }

  for (let i = ini; i <= fin; i++) {
    html += `<li class="page-item ${i === paginaActual ? 'active' : ''}">
      <button class="page-link"
        onclick="irAPagina(${i}, renderizarTarjetasLicitacion)"
        aria-label="Página ${i}"
        ${i === paginaActual ? 'aria-current="page"' : ''}>
        ${i}
      </button></li>`;
  }

  if (fin < totalPaginas) {
    if (fin < totalPaginas - 1) html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
    html += `<li class="page-item"><button class="page-link" onclick="irAPagina(${totalPaginas}, renderizarTarjetasLicitacion)">${totalPaginas}</button></li>`;
  }

  // Btn siguiente
  html += `<li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
    <button class="page-link"
      onclick="irAPagina(${paginaActual + 1}, renderizarTarjetasLicitacion)"
      aria-label="Página siguiente">
      &raquo;
    </button></li>`;

  html += `</ul></nav>
  <p class="text-center text-muted small" aria-live="polite">
    Página ${paginaActual} de ${totalPaginas} — ${listadoCompleto.length} resultados
  </p>`;

  contenedor.innerHTML = html;
}