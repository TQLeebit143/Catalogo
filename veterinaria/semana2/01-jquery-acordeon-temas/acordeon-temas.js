function initAcordeonYTemas() {
 
  $('.accordion-header').on('click', function() {
    const cuerpo = $(this).next('.accordion-body');
    const icono = $(this).find('.accordion-icon');

    $('.accordion-body').not(cuerpo).slideUp(250);
    $('.accordion-icon').not(icono).text('▼');

    cuerpo.stop(true, true).slideToggle(250, function() {
      const estaAbierto = cuerpo.is(':visible');
      icono.text(estaAbierto ? '▲' : '▼');
    });

    if (typeof registrarBitacoraEvento === 'function') {
      registrarBitacoraEvento('ACORDEÓN', `Sección explorada: ${$(this).text().trim()}`);
    }
  });
}
