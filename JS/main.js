document.addEventListener('DOMContentLoaded', () => {
  const pagina = document.body.dataset.pagina;

  switch (pagina) {

    case 'licitaciones':
      document.getElementById('form-licitaciones')
        ?.addEventListener('submit', buscarLicitaciones);
      break;

    case 'proveedor':
      document.getElementById('form-proveedor')
        ?.addEventListener('submit', buscarProveedor);

      // Limpiamos el error del RUT 
      document.getElementById('rut')
        ?.addEventListener('input', () => limpiarErrorCampo('rut'));
      break;

    case 'home':
      // Validacion del formulario de contacto
      document.getElementById('form-contacto')
        ?.addEventListener('submit', validarFormularioContacto);
      break;
  }
});

// Validacion del formulario de contacto de la homepage
function validarFormularioContacto(event) {
  event.preventDefault();

  const nombre  = document.getElementById('contacto-nombre').value.trim();
  const email   = document.getElementById('contacto-email').value.trim();
  const mensaje = document.getElementById('contacto-mensaje').value.trim();

  let hayError = false;

  // letras, tildes, ñ y espacios
  if (!nombre) {
    mostrarErrorCampo('contacto-nombre', 'El nombre es obligatorio.');
    hayError = true;
  } else if (!/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]+$/.test(nombre)) {
    mostrarErrorCampo('contacto-nombre', 'El nombre solo puede contener letras.');
    hayError = true;
  } else {
    limpiarErrorCampo('contacto-nombre');
  }

  // Formato de email estricto
  if (!email) {
    mostrarErrorCampo('contacto-email', 'El correo es obligatorio.');
    hayError = true;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    mostrarErrorCampo('contacto-email', 'Ingresa un correo electronico valido.');
    hayError = true;
  } else {
    limpiarErrorCampo('contacto-email');
  }

  // Mensaje no puede estar vacio
  if (!mensaje) {
    mostrarErrorCampo('contacto-mensaje', 'El mensaje no puede estar vacio.');
    hayError = true;
  } else {
    limpiarErrorCampo('contacto-mensaje');
  }

  if (hayError) return;

  // Si todo esta bn mostramos msm de exito
  document.getElementById('form-contacto').reset();
  mostrarAlerta('form-contacto',
    '¡Mensaje enviado correctamente! Te responderemos a la brevedad.',
    'success'
  );
}