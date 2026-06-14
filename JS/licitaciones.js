// Buscamos las licitaciones segun los filtros del formulario
async function buscarLicitaciones(event) {
  event.preventDefault();

  const fechaInput   = document.getElementById('fecha').value;
  const estadoInput  = document.getElementById('estado').value;
  const resultados   = document.getElementById('resultados');
  const paginacion   = document.getElementById('paginacion');
  const panelDetalle = document.getElementById('panel-detalle');

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

  resultados.innerHTML = '';
  paginacion.innerHTML = '';
  if (panelDetalle) panelDetalle.innerHTML = `
    <div class="detalle-vacio text-center py-5 text-muted">
      <i class="bi bi-arrow-left-circle fs-1 d-block mb-3" aria-hidden="true"></i>
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

// funcion para renderizar los items del listado para la pagina actual
function renderizarTarjetasLicitacion(licitaciones) {
  const contenedor = document.getElementById('resultados');
  if (!contenedor) return;

  if (licitaciones.length === 0) {
    contenedor.innerHTML = '<p class="text-muted small">Sin resultados en esta pagina.</p>';
    return;
  }

  // Guardamos los items de la página actual 
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

// Al hacer clic en una licitacion llamamos al endpoint de detalle
async function cargarDetalleLateral(index) {
  const panel = document.getElementById('panel-detalle');
  if (!panel) return;

  const licBasica = window._paginaActual[index];
  if (!licBasica) return;

  panel.innerHTML = `
    <div class="d-flex justify-content-center align-items-center py-5">
      <div class="spinner-border text-primary" role="status" aria-label="Cargando detalle"></div>
    </div>`;

  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const url = `${BASE_URL}/licitaciones.json?codigo=${encodeURIComponent(licBasica.CodigoExterno)}&ticket=${TICKET}`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`);

    const datos = await respuesta.json();

    if (!datos.Listado || datos.Listado.length === 0) {
      panel.innerHTML = `<div class="alert alert-warning">No se pudo cargar el detalle de esta licitacion.</div>`;
      return;
    }

    const lic = datos.Listado[0];
    renderizarDetalle(lic);

  } catch (error) {
    console.error('Error al cargar detalle:', error);
    panel.innerHTML = `<div class="alert alert-danger">No se pudo conectar. Intenta nuevamente.</div>`;
  }
}

// Renderizamos el detalle completo en el panel derecho
function renderizarDetalle(lic) {
  const panel = document.getElementById('panel-detalle');
  if (!panel) return;

  const subFechas = lic.Fechas || lic.fechas || {};
  const fechaCierreRaw = subFechas.FechaCierre || subFechas.fechaCierre || lic.FechaCierre || lic.fechaCierre;
  const fechaPublicacionRaw = subFechas.FechaPublicacion || subFechas.fechaPublicacion || lic.FechaPublicacion || lic.fechaPublicacion;

  let diasRestantes = '';
  if (fechaCierreRaw) {
    const diff = Math.ceil((new Date(fechaCierreRaw) - new Date()) / (1000 * 60 * 60 * 24));
    if (isNaN(diff)) {
      diasRestantes = '';
    } else if (diff > 0) {
      diasRestantes = `(En ${diff} días)`;
    } else if (diff === 0) {
      diasRestantes = '(Cierra hoy)';
    } else {
      diasRestantes = '(Cerrada)';
    }
  }

  panel.innerHTML = `
    <div class="mb-3">
      <span class="badge-estado badge-estado--${(lic.Estado||lic.estado||'').toLowerCase().replace(/\s/g,'-')} mb-2">
        ${limpiarTexto(lic.Estado || lic.estado) || 'Sin estado'}
      </span>
      <h3 class="fs-6 fw-bold lh-sm mt-2">${limpiarTexto(lic.Nombre || lic.nombre) || 'Sin nombre'}</h3>
      <small class="text-muted">ID Licitación: ${limpiarTexto(lic.CodigoExterno || lic.codigoExterno)}</small>
    </div>

    <ul class="list-group list-group-flush small">
      ${crearFilaDetalle('Descripción',      lic.Descripcion || lic.descripcion)}
      ${crearFilaDetalle('Tipo',             lic.Tipo || lic.tipo)}
      ${crearFilaDetalle('Región',           lic.NombreRegion || lic.nombreRegion)}
      ${crearFilaDetalle('Moneda',           lic.Moneda || lic.moneda)}
      ${crearFilaDetalle('Monto disponible', (lic.MontoEstimado || lic.montoEstimado)
          ? '$' + Number(lic.MontoEstimado || lic.montoEstimado).toLocaleString('es-CL')
          : null)}
      
      ${crearFilaDetalle('Fecha publication', fechaPublicacionRaw ? formatearFecha(fechaPublicacionRaw) : 'No disponible')}
      ${crearFilaDetalle('Fecha cierre',      fechaCierreRaw
          ? `${formatearFecha(fechaCierreRaw)} ${diasRestantes}`
          : 'No disponible')}
          
      ${lic.Comprador ? crearFilaDetalle('Organismo',        lic.Comprador.NombreOrganismo || lic.Comprador.nombreOrganismo) : ''}
      ${lic.Comprador ? crearFilaDetalle('RUT organismo',    lic.Comprador.RutUnidad || lic.Comprador.rutUnidad)       : ''}
      ${lic.Comprador ? crearFilaDetalle('Unidad',           lic.Comprador.NombreUnidad || lic.Comprador.nombreUnidad)    : ''}
      ${lic.Comprador ? crearFilaDetalle('Región organismo', lic.Comprador.RegionUnidad || lic.Comprador.regionUnidad)    : ''}
      ${lic.Comprador ? crearFilaDetalle('Dirección',        lic.Comprador.DireccionUnidad || lic.Comprador.direccionUnidad) : ''}
      ${lic.Comprador ? crearFilaDetalle('Cantidad compras', lic.Comprador.CantidadCompras || lic.Comprador.cantidadCompras) : ''}
      ${lic.Comprador ? crearFilaDetalle('Reclamos pago',    lic.Comprador.CantidadReclamos || lic.Comprador.cantidadReclamos): ''}
    </ul>
  `;
}
