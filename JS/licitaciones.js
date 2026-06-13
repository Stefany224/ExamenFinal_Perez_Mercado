// Buscamos las licitaciones segun los filtros del formulario
async function buscarLicitaciones(event) {
  event.preventDefault();

  const fechaInput   = document.getElementById('fecha').value;
  const estadoInput  = document.getElementById('estado').value;
  const resultados   = document.getElementById('resultados');
  const paginacion   = document.getElementById('paginacion');
  const panelDetalle = document.getElementById('panel-detalle');

  // Validamos que ambos campos esten completos
  let hayError = false;

  if (!fechaInput) {
    mostrarErrorCampo('fecha', 'Debes seleccionar una fecha.');
    hayError = true;
  } else {
    limpiarErrorCampo('fecha');
  }

  if (!estadoInput) {
    mostrarErrorCampo('estado', 'Debes seleccionar un estado.');
    hayError = true;
  } else {
    limpiarErrorCampo('estado');
  }

  if (hayError) return;

  // Limpiamos el estado anterior
  resultados.innerHTML = '';
  paginacion.innerHTML = '';
  if (panelDetalle) panelDetalle.innerHTML = `
    <div class="detalle-vacio">
      <i class="bi bi-arrow-left-circle" aria-hidden="true"></i>
      <p>Selecciona una licitacion para ver su detalle.</p>
    </div>`;

  const fecha = convertirFechaParaAPI(fechaInput);
  const url   = `${BASE_URL}/licitaciones.json?fecha=${fecha}&estado=${estadoInput}&ticket=${TICKET}`;

  setLoader(true);

  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`Error del servidor: ${respuesta.status}`);

    const datos = await respuesta.json();

    if (!datos.Listado || datos.Listado.length === 0) {
      mostrarAlerta('resultados',
        'No se encontraron licitaciones para los filtros seleccionados. Prueba con otra fecha o estado.',
        'warning'
      );
      return;
    }

    // iniciamos paginacion con todos los resultados
    iniciarPaginacion(datos.Listado, renderizarTarjetasLicitacion);

  } catch (error) {
    console.error('Error al buscar licitaciones:', error);
    mostrarAlerta('resultados',
      'No se pudo conectar con Mercado Publico. Verifica tu conexion e intentalo nuevamente.',
      'danger'
    );
  } finally {
    setLoader(false);
  }
}

// funcion renderizar los items del listado para la pagina actual
function renderizarTarjetasLicitacion(licitaciones) {
  const contenedor = document.getElementById('resultados');
  if (!contenedor) return;

  if (licitaciones.length === 0) {
    contenedor.innerHTML = '<p class="text-muted small">Sin resultados en esta pagina.</p>';
    return;
  }

  // guardar referencia global para acceder al objeto completo por indice
  window._paginaActual = licitaciones;

  const html = licitaciones.map((lic, index) => `
    <div class="licitacion-item p-2 border-bottom"
         role="button"
         tabindex="0"
         aria-label="Ver detalle de licitacion ${limpiarTexto(lic.CodigoExterno)}"
         data-index="${index}"
         onclick="cargarDetalleLateral(${index})"
         onkeydown="if(event.key==='Enter'||event.key===' ')cargarDetalleLateral(${index})">
      <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
        <span class="badge-estado badge-estado--${(lic.Estado || '').toLowerCase().replace(/\s/g,'-')}">
          ${limpiarTexto(lic.Estado) || 'Sin estado'}
        </span>
        <small class="text-muted">${formatearFecha(lic.FechaCierre)}</small>
      </div>
      <p class="mb-0 small fw-medium lh-sm">${limpiarTexto(lic.Nombre) || 'Sin nombre'}</p>
      <small class="text-muted">${limpiarTexto(lic.CodigoExterno)}</small>
    </div>
  `).join('');

  contenedor.innerHTML = html;
}

// funcion para mostrar el detalle de una licitacion en el panel derecho
function cargarDetalleLateral(index) {
  const panel = document.getElementById('panel-detalle');
  if (!panel) return;

  const lic = window._paginaActual[index];
  if (!lic) return;

  panel.innerHTML = `
    <div class="mb-3">
      <span class="badge-estado badge-estado--${(lic.Estado||'').toLowerCase().replace(/\s/g,'-')} mb-2">
        ${limpiarTexto(lic.Estado) || 'Sin estado'}
      </span>
      <h3 class="fs-6 fw-bold lh-sm mt-2">${limpiarTexto(lic.Nombre) || 'Sin nombre'}</h3>
      <small class="text-muted">Codigo: ${limpiarTexto(lic.CodigoExterno)}</small>
    </div>
    <ul class="list-group list-group-flush small">
      ${crearFilaDetalle('Tipo',        lic.Tipo)}
      ${crearFilaDetalle('Region',      lic.NombreRegion)}
      ${crearFilaDetalle('Publicación', formatearFecha(lic.FechaPublicacion))}
      ${crearFilaDetalle('Cierre',      formatearFecha(lic.FechaCierre))}
      ${crearFilaDetalle('Monto',       lic.MontoEstimado
          ? '$' + Number(lic.MontoEstimado).toLocaleString('es-CL')
          : null)}
      ${lic.Comprador ? crearFilaDetalle('Organismo', lic.Comprador.NombreOrganismo) : ''}
      ${lic.Comprador ? crearFilaDetalle('Direccion', lic.Comprador.DireccionUnidad) : ''}
    </ul>
  `;

  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}