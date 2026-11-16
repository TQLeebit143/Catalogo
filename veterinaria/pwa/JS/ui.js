/* ══════════════════════════════════════════════════
   JS/ui.js — Interfaz: Toast, Tema, Hamburguesa
   Depende de: jQuery
══════════════════════════════════════════════════ */

// ── TOAST ──
function toast(msg) {
  $('#toast-alert').text(msg).stop(true,true).fadeIn(150).delay(2200).fadeOut(350);
}

// ── TOGGLE TEMA DÍA / NOCHE ──
function initTema() {
  $('#btnTema').on('click', function () {
    $('body').toggleClass('light-mode');
    const cl = $('body').hasClass('light-mode');
    $(this).text(cl ? '☀️' : '🌙');
    log(`Tema cambiado a: ${cl ? 'Claro (Día)' : 'Oscuro (Noche)'}`, 'info');
    toast(cl ? '☀️ Modo Día activado' : '🌙 Modo Noche activado');
  });
}

// ── MENÚ HAMBURGUESA ──
function initHamburguesa() {
  $('#btnHamb').on('click', function (e) {
    e.stopPropagation();
    $('#menuHamb').toggle();
  });
  $(document).on('click', function () { $('#menuHamb').hide(); });
  $('#menuHamb').on('click', function (e) { e.stopPropagation(); });
}

function cerrarHamb() { $('#menuHamb').hide(); }

// ── NAV ACTIVO CON SCROLL (IntersectionObserver) ──
function initNavObserver() {
  const secs = document.querySelectorAll('.seccion');
  if (!secs.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        $('.nl').removeClass('activo');
        $(`.nl[href="#${id}"]`).addClass('activo');
      }
    });
  }, { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 });
  secs.forEach(s => obs.observe(s));
}
