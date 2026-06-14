// Buscamos un proveedor por RUT en la API 
async function buscarProveedor(event) {
  event.preventDefault();

  const rutInput = document.getElementById('rut').value;
  const panel    = document.getElementById('panel-proveedor');

  //  variable para validar el RUT antes de llamar a la API
  const resultado = validarRUT(rutInput);
  if (!resultado.valido) {
    mostrarErrorCampo('rut', resultado.mensaje);
    return;
  }
  limpiarErrorCampo('rut');

  // Limpiamos el resultado anterior
  if (panel) panel.innerHTML = '';

  // Formateamos el RUT para la API
  const rutFormateado = formatearRUT(resultado.rutLimpio);

  setLoader(true);

  try {
    const url = `${BASE_URL}/Empresas/BuscarProveedor?rutempresaproveedor=${encodeURIComponent(rutFormateado)}&ticket=${TICKET}`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) throw new Error(`Error del servidor: ${respuesta.status}`);

   const datos = await respuesta.json();

    if (!datos || !datos.listaEmpresas || datos.listaEmpresas.length === 0) {
    mostrarAlerta('panel-proveedor',
    `No se encontro ningun proveedor registrado con ese RUT.`,
    'warning'
  );
  return;
}

    renderizarProveedor(datos, rutFormateado);

  } catch (error) {
    console.error('Error al buscar proveedor:', error);
    mostrarAlerta('panel-proveedor',
      'No se pudo conectar con el servicio. Verifica tu conexion e intentalo nuevamente.',
      'danger'
    );
  } finally {
    setLoader(false);
  }
}

// Renderizamos los datos del proveedor en el panel derecho
function renderizarProveedor(datos, rutFormateado) {
  const panel = document.getElementById('panel-proveedor');
  if (!panel) return;

  const empresa = datos.listaEmpresas[0];

  panel.innerHTML = `
    <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
      <i class="bi bi-building-check text-success fs-4" aria-hidden="true"></i>
      <h3 class="fs-6 fw-bold mb-0">Proveedor encontrado</h3>
    </div>
    <ul class="list-group list-group-flush small">
      ${crearFilaDetalle('Razón social', empresa.NombreEmpresa)}
      ${crearFilaDetalle('Código empresa', empresa.CodigoEmpresa)}
      ${crearFilaDetalle('RUT', rutFormateado)}
    </ul>
  `;

  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Limpia el formulario y el panel de resultado
function limpiarFormularioProveedor() {
  document.getElementById('rut').value = '';
  limpiarErrorCampo('rut');
  document.getElementById('panel-proveedor').innerHTML = `
    <div class="text-center py-5 text-muted">
      <i class="bi bi-building fs-1 d-block mb-3" aria-hidden="true"></i>
      <p>Ingresa un RUT y presiona "Buscar" para ver la informacion del proveedor aqui.</p>
    </div>`;
  document.getElementById('rut').focus();
}