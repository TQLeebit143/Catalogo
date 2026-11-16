let categoriaActiva = 'todos';
let textoBusqueda = '';

function initFiltrosYBusqueda() {
 
  $('.btn-cat').on('click', function() {
    $('.btn-cat').removeClass('active');
    $(this).addClass('active');
    categoriaActiva = $(this).data('cat') || 'todos';

    if (typeof registrarBitacoraEvento === 'function') {
      registrarBitacoraEvento('FILTRO', `Filtrado por categoría: ${categoriaActiva.toUpperCase()}`);
    }
    aplicarFiltrosCatalogo();
  });

  $('#input-busqueda').on('keyup', function() {
    textoBusqueda = $(this).val().toLowerCase().trim();
    if (typeof registrarBitacoraEvento === 'function' && textoBusqueda.length > 2) {
      registrarBitacoraEvento('BÚSQUEDA', `Término buscado: "${textoBusqueda}"`);
    }
    aplicarFiltrosCatalogo();
  });

  $('#btn-limpiar-busqueda').on('click', function() {
    $('#input-busqueda').val('');
    textoBusqueda = '';
    aplicarFiltrosCatalogo();
  });
}

function aplicarFiltrosCatalogo() {
  if (typeof catalogoVet === 'undefined') return;

  const filtrados = catalogoVet.filter(item => {
    const coincideCat = (categoriaActiva === 'todos') || (item.categoria === categoriaActiva);
    const coincideTexto = !textoBusqueda || 
      item.nombre.toLowerCase().includes(textoBusqueda) ||
      item.categoria.toLowerCase().includes(textoBusqueda) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(textoBusqueda));
    return coincideCat && coincideTexto;
  });

  if (typeof renderizarCatalogo === 'function') {
    renderizarCatalogo(filtrados);
  }
}
