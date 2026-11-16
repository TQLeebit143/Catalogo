function initModoOscuro() {
  const temaGuardado = localStorage.getItem('dongato_tema') || 'dark';
  aplicarTema(temaGuardado);

  $(document).on('click', '#btnTema, #btn-tema, #btn-tema-mobile, #btn-tema-admin', function(e) {
    e.preventDefault();
    const esClaro = $('body').hasClass('light-mode') || $('body').hasClass('light-theme');
    const nuevoTema = esClaro ? 'dark' : 'light';
    aplicarTema(nuevoTema);
    
    if (typeof registrarBitacoraEvento === 'function') {
      registrarBitacoraEvento('TEMA', `Interfaz cambiada a: ${nuevoTema === 'dark' ? 'MODO OSCURO' : 'MODO CLARO'}`);
    }
    if (typeof toast === 'function') {
      toast(nuevoTema === 'dark' ? '🌙 Modo Noche activado' : '☀️ Modo Día activado');
    }
  });
}

function aplicarTema(tema) {
  if (tema === 'light') {
    $('body').removeClass('dark-theme dark-mode').addClass('light-mode light-theme');
    $('#btnTema, #btn-tema, #btn-tema-mobile, #btn-tema-admin').html('☀️ Modo Día');
  } else {
    $('body').removeClass('light-mode light-theme').addClass('dark-theme dark-mode');
    $('#btnTema, #btn-tema, #btn-tema-mobile, #btn-tema-admin').html('🌙 Modo Noche');
  }
  localStorage.setItem('dongato_tema', tema);
}
