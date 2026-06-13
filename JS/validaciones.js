// funcion para validar el RUT con algoritmo
function validarRUT(rut) {
  if (!rut || rut.trim() === '') {
    return { valido: false, mensaje: 'El RUT es obligatorio.' };
  }

  // Limpiamos puntos, guiones y espacios y pasamos a mayusculas
  const rutLimpio = rut
    .replace(/\./g, '')
    .replace(/-/g, '')
    .replace(/\s/g, '')
    .toUpperCase();

  // validacion para verificar que tenga entre 8 y 9 caracteres
  if (!/^\d{7,8}[0-9K]$/.test(rutLimpio)) {
    return {
      valido: false,
      mensaje: 'Formato de RUT invalido. Ejemplo correcto: 12.345.678-9'
    };
  }

  const cuerpo      = rutLimpio.slice(0, -1);
  const dvIngresado = rutLimpio.slice(-1);

  let suma     = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma     += parseInt(cuerpo[i]) * multiplo;
    multiplo  = multiplo === 7 ? 2 : multiplo + 1;
  }

  const resto = 11 - (suma % 11);
  let dvEsperado;
  if      (resto === 11) dvEsperado = '0';
  else if (resto === 10) dvEsperado = 'K';
  else                   dvEsperado = String(resto);

  if (dvIngresado !== dvEsperado) {
    return {
      valido: false,
      mensaje: 'El digito verificador es incorrecto.'
    };
  }

  return { valido: true, mensaje: '', rutLimpio };
}

// funcion para formatear un RUT limpio al formato estandar con puntos y guion
function formatearRUT(rutLimpio) {
  const dv     = rutLimpio.slice(-1);
  const cuerpo = rutLimpio.slice(0, -1);
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
}

// Marcamos un campo como invalido y muestramos un msm de error
function mostrarErrorCampo(id, mensaje) {
  const campo = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);
  if (campo) campo.classList.add('is-invalid');
  if (error) error.textContent = mensaje;
}

// Limpiamos el estado de error de un campo
function limpiarErrorCampo(id) {
  const campo = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);
  if (campo) campo.classList.remove('is-invalid');
  if (error) error.textContent = '';
}