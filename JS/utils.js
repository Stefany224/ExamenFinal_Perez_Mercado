// Muestra/oculta el loader de la pagina
function setLoader(visible) {
  const loader = document.getElementById('loader');
  if (!loader) return;
  loader.style.display = visible ? 'flex' : 'none';
  loader.setAttribute('aria-hidden', visible ? 'false' : 'true');
}

// Mostramos una alerta dentro del contenedor indicado
function mostrarAlerta(contenedorId, mensaje, tipo = 'danger') {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;
  contenedor.innerHTML = `
    <div class="alert alert-${tipo} d-flex align-items-center gap-2" role="alert">
      <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
      <span>${mensaje}</span>
    </div>`;
}

// Limpiamos caracteres HTML
function limpiarTexto(texto) {
  if (!texto || typeof texto !== 'string') return '';
  return texto
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .trim();
}

// Convertimos a fecha ISO
function formatearFecha(fechaISO) {
  if (!fechaISO) return 'Sin fecha';
  try {
    return new Date(fechaISO).toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  } catch {
    return fechaISO;
  }
}

// funcion para convertir la fecha del input al formato que pide la api
function convertirFechaParaAPI(fechaInput) {
  if (!fechaInput) return '';
  const [anio, mes, dia] = fechaInput.split('-');
  return `${dia}${mes}${anio}`;
}

// Creamos una fila para las listas de detalle y si el valor viene vacio no genera nada
function crearFilaDetalle(etiqueta, valor) {
  const v = limpiarTexto(String(valor ?? ''));
  if (!v || v === 'null' || v === 'undefined') return '';
  return `
    <li class="list-group-item d-flex justify-content-between align-items-start gap-2 flex-wrap">
      <span class="text-muted small fw-medium">${etiqueta}</span>
      <span class="text-end">${v}</span>
    </li>`;
}