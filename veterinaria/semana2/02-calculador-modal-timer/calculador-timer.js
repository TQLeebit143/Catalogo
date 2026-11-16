let segundosAtencion = 0;

function initCalculadorModalTimer() {

  iniciarTimerAtencion();

  $(document).on('click', '.modal-close, .modal-backdrop', function(e) {
    if (e.target === this) {
      cerrarTodosLosModales();
    }
  });

  $(document).on('keydown', function(e) {
    if (e.key === 'Escape') {
      cerrarTodosLosModales();
    }
  });
}
function abrirZoomImagen(src, titulo, desc, precio) {
  const modalZoom = $('#modal-zoom-img');
  $('#zoom-img-target').attr('src', src).attr('alt', titulo);
  $('#zoom-titulo').text(titulo);
  $('#zoom-desc').text(desc || '');
  $('#zoom-precio').text(precio ? `${precio} BOB` : '');
  
  modalZoom.fadeIn(200).addClass('activo');
  $('body').addClass('modal-open');

  if (typeof registrarBitacoraEvento === 'function') {
    registrarBitacoraEvento('ZOOM', `Imagen ampliada: "${titulo}"`);
  }
}

function cerrarModalZoom() {
  $('#modal-zoom-img').fadeOut(150).removeClass('activo');
  $('body').removeClass('modal-open');
}

function iniciarTimerAtencion() {
  if (timerAtencionInterval) clearInterval(timerAtencionInterval);
  segundosAtencion = 0;
  timerAtencionInterval = setInterval(() => {
    segundosAtencion++;
    const min = String(Math.floor(segundosAtencion / 60)).padStart(2, '0');
    const seg = String(segundosAtencion % 60).padStart(2, '0');
    $('#timer-sesion-span').text(`${min}:${seg}`);
  }, 1000);
}

function cerrarTodosLosModales() {
  $('.modal-overlay').fadeOut(150).removeClass('activo');
  $('body').removeClass('modal-open');
}
