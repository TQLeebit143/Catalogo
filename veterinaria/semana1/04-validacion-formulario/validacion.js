function initValidacionFormulario() {
  $('#form-cita-vet').on('submit', function(e) {
    e.preventDefault();

    const nombre = $('#cita-tutor').val().trim();
    const mascota = $('#cita-mascota').val().trim();
    const celular = $('#cita-celular').val().trim();
    const servicio = $('#cita-servicio').val();
    const fecha = $('#cita-fecha').val();

    let errores = [];

    if (!nombre || nombre.length < 3) {
      errores.push("El nombre del tutor debe tener al menos 3 caracteres.");
      $('#cita-tutor').addClass('input-invalido');
    } else {
      $('#cita-tutor').removeClass('input-invalido');
    }

    if (!mascota || mascota.length < 2) {
      errores.push("Ingresa el nombre de la mascota o paciente.");
      $('#cita-mascota').addClass('input-invalido');
    } else {
      $('#cita-mascota').removeClass('input-invalido');
    }

    if (!celular || !/^[67][0-9]{7}$/.test(celular)) {
      errores.push("El celular debe ser válido para Bolivia (8 dígitos, inicia con 6 o 7).");
      $('#cita-celular').addClass('input-invalido');
    } else {
      $('#cita-celular').removeClass('input-invalido');
    }

    if (!fecha) {
      errores.push("Selecciona una fecha aproximada para la cita.");
      $('#cita-fecha').addClass('input-invalido');
    } else {
      $('#cita-fecha').removeClass('input-invalido');
    }

    if (errores.length > 0) {
      if (typeof mostrarToast === 'function') {
        mostrarToast('VALIDACIÓN', errores[0]);
      }
      if (typeof registrarBitacoraEvento === 'function') {
        registrarBitacoraEvento('VALIDACIÓN_ERROR', `Fallo en formulario: ${errores.join(' | ')}`);
      }
      return false;
    }

    // Registro exitoso
    if (typeof registrarBitacoraEvento === 'function') {
      registrarBitacoraEvento('CITA_SOLICITADA', `Tutor: ${nombre} | Paciente: ${mascota} | Servicio: ${servicio} | Fecha: ${fecha}`);
    }

    const textoWA = `Hola Dr. Jorge Castillo (Clínica Don Gato), solicito una cita/consulta:%0A- Tutor: *${nombre}*%0A- Paciente: *${mascota}*%0A- Celular: *${celular}*%0A- Servicio: *${servicio}*%0A- Fecha preferida: *${fecha}*`;
    const urlWA = `https://wa.me/59167301341?text=${textoWA}`;
    
    if (typeof mostrarToast === 'function') {
      mostrarToast('CITA CONFIRMADA', 'Redirigiendo a WhatsApp del Dr. Jorge Castillo...');
    }

    window.open(urlWA, '_blank');
    $('#form-cita-vet')[0].reset();
  });
}
