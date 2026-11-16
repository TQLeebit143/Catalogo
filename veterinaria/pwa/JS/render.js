/* ============================================================
   JS/render.js — Renderizado del catálogo + Zoom Lightbox + Búsqueda
   ============================================================ */

let catActual = 'todos';

function renderizar(lista) {
  const $g = $('#gridCatalogo').empty();
  if (!lista || !lista.length) {
    $g.html('<div class="sin-res" style="grid-column: 1/-1; text-align: center; padding: 30px; font-size: 1rem; color: var(--text-sub);">🐾 No se encontraron productos o servicios para esta búsqueda.</div>');
    return;
  }

  lista.forEach(item => {
    const imgSrc = item.img || 'Img/LOGO DE DON GATO sin fondo.png';
    $g.append(`
      <article class="tarjeta" onclick="mostrarFicha(${item.id})">
        <div class="t-img-wrapper">
          <img src="${imgSrc}" alt="${item.nombre}" loading="lazy" class="t-img"
               onerror="this.onerror=null;this.src='Img/LOGO DE DON GATO sin fondo.png';">
          <button class="btn-zoom-preview" title="Ampliar imagen" onclick="event.stopPropagation(); abrirZoom(${item.id})">
            🔍 Zoom
          </button>
        </div>
        <div class="t-cat">${item.catLabel || item.categoria}</div>
        <h3 class="t-nom">${item.nombre}</h3>
        <p class="t-det">${item.detalle || ''}</p>
        ${item.nota ? `<div class="t-nota">ℹ️ ${item.nota}</div>` : ''}
        <div class="t-precio">${item.precio} BOB</div>
        <div class="t-actions">
          <button class="btn-add" onclick="event.stopPropagation(); agregarCarrito(${item.id})">
            + Añadir al Cotizador
          </button>
        </div>
      </article>`);
  });

  if (typeof registrarBitacoraEvento === 'function') {
    registrarBitacoraEvento('RENDER', `Renderizados ${lista.length} ítems en categoría "${catActual}"`);
  }
}

function filtrar(cat) {
  catActual = cat;
  $('.chip').removeClass('active');
  $(`.chip[data-cat="${cat}"]`).addClass('active');

  let res = catalogoVet;
  if (cat !== 'todos') {
    res = catalogoVet.filter(i => {
      if (i.categoria === cat) return true;
      if (cat === 'cirugias' && (i.categoria === 'cirugia' || i.categoria === 'cirugias')) return true;
      if (cat === 'peluqueria' && i.categoria === 'peluqueria') return true;
      return false;
    });
  }

  const q = $('#inputBusqueda').val() ? $('#inputBusqueda').val().trim().toLowerCase() : '';
  if (q) {
    res = res.filter(i => i.nombre.toLowerCase().includes(q) || (i.detalle && i.detalle.toLowerCase().includes(q)));
  }

  renderizar(res);
  
  if (typeof registrarBitacoraEvento === 'function') {
    registrarBitacoraEvento('FILTRO', `Categoría seleccionada: ${cat.toUpperCase()} (${res.length} resultados)`);
  }
  if (typeof toast === 'function') {
    toast(`Categoría: ${cat === 'todos' ? 'Todos los Servicios' : cat}`);
  }
}

function abrirZoom(id) {
  const item = catalogoVet.find(s => s.id === id);
  if (!item) return;

  const imgSrc = item.img || 'Img/LOGO DE DON GATO sin fondo.png';
  if (typeof abrirZoomImagen === 'function') {
    abrirZoomImagen(imgSrc, item.nombre, item.detalle, item.precio);
  } else {
    // Fallback directo
    $('#zoom-img-target').attr('src', imgSrc);
    $('#zoom-titulo').text(item.nombre);
    $('#zoom-desc').text(item.detalle || '');
    $('#zoom-precio').text(`${item.precio} BOB`);
    $('#modal-zoom-img').fadeIn(150).addClass('activo');
  }
}

function mostrarFicha(id) {
  abrirZoom(id);
}

function initBusqueda() {
  $('#inputBusqueda').on('keyup input', function () {
    const q = $(this).val().trim().toLowerCase();
    let res = catalogoVet;
    if (catActual !== 'todos') {
      res = catalogoVet.filter(i => {
        if (i.categoria === catActual) return true;
        if (catActual === 'cirugias' && (i.categoria === 'cirugia' || i.categoria === 'cirugias')) return true;
        return false;
      });
    }
    if (q) {
      res = res.filter(i => i.nombre.toLowerCase().includes(q) || (i.detalle && i.detalle.toLowerCase().includes(q)));
      if (typeof registrarBitacoraEvento === 'function' && q.length > 2) {
        registrarBitacoraEvento('BÚSQUEDA', `Término: "${q}" (${res.length} encontrados)`);
      }
    }
    renderizar(res);
  });
}
