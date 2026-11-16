function initMenuHamburguesa() {
  const btn = $('#btn-hamburguesa');
  const nav = $('#nav-mobile-menu');

  btn.on('click', function(e) {
    e.stopPropagation();
    nav.toggleClass('abierto');
    const abierto = nav.hasClass('abierto');
    btn.attr('aria-expanded', abierto);
    btn.find('i, span').text(abierto ? '✕' : '☰');
  });

  $('#nav-mobile-menu a, #nav-mobile-menu button').on('click', function() {
    cerrarMenuHamburguesa();
  });

  $(document).on('click', function(e) {
    if (!$(e.target).closest('#nav-mobile-menu, #btn-hamburguesa').length) {
      cerrarMenuHamburguesa();
    }
  });
}

function cerrarMenuHamburguesa() {
  $('#nav-mobile-menu').removeClass('abierto');
  $('#btn-hamburguesa').attr('aria-expanded', 'false').find('i, span').text('☰');
}
