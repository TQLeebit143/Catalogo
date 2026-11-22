$(function () {
  document.body.dataset.hidratado = 'true';

  /* ==========================================================================
     1. UTILIDADES CORE Y VALIDACIÓN
     ========================================================================== */
  const core = window.DW2Core || {};

  const limpiar = core.limpiar || ((t) => {
    const limpio = String(t ?? '').trim();
    if (window.DOMPurify) {
      return window.DOMPurify.sanitize(limpio, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    }
    return limpio;
  });

  const escapeHTML = core.escapeHTML || ((t) => String(t ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;'));

  const esTelefonoValido = core.esTelefonoValido || ((v) => /^[67]\d{7}$/.test(String(v || '').trim()));
  const esSoloLetras = core.esSoloLetras || ((v) => /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]{2,60}$/.test(String(v || '').trim()));

  const abrirWhatsapp = core.abrirWhatsapp || ((tel, msg) => {
    const url = `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  const abrirModalSeguro = (selector) => {
    if (core.abrirModal) {
      core.abrirModal(selector);
      return;
    }
    const $modal = $(selector);
    if ($modal.length) {
      $modal.addClass('open').attr('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  const cerrarModalSeguro = (selector) => {
    if (core.cerrarModal) {
      core.cerrarModal(selector);
      return;
    }
    const $modal = selector ? $(selector) : $('.modal.open, .modal[aria-hidden="false"]');
    $modal.removeClass('open').attr('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  $(document).on('click', '[data-open-modal]', function (e) {
    e.preventDefault();
    const id = $(this).data('openModal');
    if (id) abrirModalSeguro('#' + id);
  });

  $(document).on('click', '[data-close-modal]', function (e) {
    e.preventDefault();
    cerrarModalSeguro($(this).closest('.modal'));
  });

  $(document).on('click', '.modal', function (e) {
    if (e.target === this) cerrarModalSeguro(this);
  });

  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') cerrarModalSeguro();
  });

  /* ==========================================================================
     2. CONFIGURACIÓN, CATÁLOGO (CON RESPALDO INTEGRADO) Y CONSTANTES
     ========================================================================== */
 const CATALOGO_RESPALDO = [
    // PELUQUERÍA & SPA
    { id: 'pel-1', categoria: 'peluqueria', nombre: 'Baño Medicado y Secado', precio: 60, descripcion: 'Baño dermatológico con shampoo hipoalergénico, secado suave y cepillado.', nota: 'Ideal para piel sensible o alergias.', imagen: 'Img/bano.jpg' },
    { id: 'pel-2', categoria: 'peluqueria', nombre: 'Peluquería & SPA Completo', precio: 80, descripcion: 'Corte higiénico o de raza, baño relajante, limpieza de oídos y corte de uñas.', nota: 'Incluye aromaterapia suave.', imagen: 'Img/peluqueria.jpg' },
    { id: 'pel-3', categoria: 'peluqueria', nombre: 'Peluquería Felina Especializada', precio: 95, descripcion: 'Corte y deslanado profundo sin estrés con acondicionador nutritivo para gatos.', nota: 'Reduce bolas de pelo en gatos.', imagen: 'Img/peluqueria gato.jpg' },
    { id: 'pel-4', categoria: 'peluqueria', nombre: 'Corte de Pelo Higiénico o de Raza', precio: 65, descripcion: 'Recorte estético y sanitario adaptado al estándar de cada mascota.', nota: 'Incluye perfume hipoalergénico.', imagen: 'Img/corte.jpg' },
    { id: 'pel-5', categoria: 'peluqueria', nombre: 'Corte de Uñas y Limpieza Básica', precio: 25, descripcion: 'Recorte cuidadoso de uñas y revisión de almohadillas.', nota: 'Sesión rápida sin estrés.', imagen: 'Img/corte unas.jpg' },

    // MEDICINA VETERINARIA
    { id: 'vet-1', categoria: 'veterinaria', nombre: 'Consulta Médica General', precio: 30, descripcion: 'Evaluación clínica completa por el Dr. Jorge Castillo MVZ.', nota: 'Incluye control de peso y temperatura.', imagen: 'Img/consulta.jpg' },
    { id: 'vet-2', categoria: 'veterinaria', nombre: 'Vacunación e Inyectables', precio: 65, descripcion: 'Inmunización anual preventiva (Triple Felina / Séxtuple) con carnet sanitario.', nota: 'Paciente debe estar previamente desparasitado.', imagen: 'Img/inyectable.jpg' },
    { id: 'vet-3', categoria: 'veterinaria', nombre: 'Ecografía Abdominal y Gestacional', precio: 60, descripcion: 'Diagnóstico por imagen no invasivo de órganos internos o gestación.', nota: 'Requiere ayuno previo de 6 horas.', imagen: 'Img/ecografia.jpg' },
    { id: 'vet-4', categoria: 'veterinaria', nombre: 'Limpieza Dental con Ultrasonido', precio: 180, descripcion: 'Profilaxis dental completa bajo sedación controlada y pulido.', nota: 'Previene enfermedad periodontal.', imagen: 'Img/limpieza dental.jpg' },
    { id: 'vet-5', categoria: 'veterinaria', nombre: 'Fluidoterapia Clínica', precio: 90, descripcion: 'Terapia de hidratación y reposición electrolítica supervisada.', nota: 'Atención ambulatoria monitoreada.', imagen: 'Img/fluidoterapia.jpg' },
    { id: 'vet-6', categoria: 'veterinaria', nombre: 'Canalización de Vía Intravenosa', precio: 75, descripcion: 'Colocación de catéter venoso para administración directa de medicación.', nota: 'Protocolo estéril con monitoreo constante.', imagen: 'Img/via intravenosa.jpg' },
    { id: 'vet-7', categoria: 'veterinaria', nombre: 'Eutanasia Humanitaria Compasiva', precio: 150, descripcion: 'Procedimiento indoloro y respetuoso acompañado de asesoría veterinaria.', nota: 'Previa evaluación clínica del Dr. Jorge Castillo.', imagen: 'Img/eutanasia.jpg' },

    // CIRUGÍAS
    { id: 'cir-1', categoria: 'cirugias', nombre: 'Castración de Gatos (Macho)', precio: 180, descripcion: 'Orquiectomía segura con anestesia monitoreada y analgesia postoperatoria.', nota: 'Ayuno de sólidos de 8 horas.', imagen: 'Img/castracion gatos.jpg' },
    { id: 'cir-2', categoria: 'cirugias', nombre: 'Esterilización de Gatas (Hembra)', precio: 250, descripcion: 'Ovariohisterectomía con sutura intradérmica estética y control postoperatorio.', nota: 'Incluye primera dosis antibiótica.', imagen: 'Img/estirilizacion gatas.jpg' },
    { id: 'cir-3', categoria: 'cirugias', nombre: 'Castración de Perros (Macho)', precio: 240, descripcion: 'Cirugía segura con monitoreo multiparamétrico y control del dolor.', nota: 'Ayuno de sólidos de 8 horas.', imagen: 'Img/castracion perro.jpg' },
    { id: 'cir-4', categoria: 'cirugias', nombre: 'Esterilización de Perras (Hembra)', precio: 320, descripcion: 'Ovariohisterectomía con protocolo anestésico seguro y seguimiento clínico.', nota: 'Previa valoración prequirúrgica.', imagen: 'Img/estirilizacion perras.jpg' },

    // PETSHOP
    { id: 'pet-1', categoria: 'petshop', nombre: 'Arena Sanitaria Aglutinante 5 kg', precio: 45, descripcion: 'Control superior de olores, libre de polvo y fácil de limpiar.', nota: 'Aroma neutro para gatos exigentes.', imagen: 'Img/arena sanitaria.jpg' },
    { id: 'pet-2', categoria: 'petshop', nombre: 'Cepillo Deslanador para Mascotas', precio: 35, descripcion: 'Cerdas suaves que retiran el pelaje suelto y masajean la piel.', nota: 'Ideal para perros y gatos.', imagen: 'Img/cepillo mascota.jpg' },
    { id: 'pet-3', categoria: 'petshop', nombre: 'Collar Localizador GPS Inteligente', precio: 140, descripcion: 'Collar ajustable resistente al agua con rastreo en tiempo real.', nota: 'Batería recargable de larga duración.', imagen: 'Img/collar gps.jpg' },
    { id: 'pet-4', categoria: 'petshop', nombre: 'Shampoo Dermatológico Neutro', precio: 40, descripcion: 'Fórmula suave con avena y aloe vera para pelaje brillante.', nota: 'Uso frecuente sin resecar la piel.', imagen: 'Img/shampoo.jpg' },

    // FARMACIA
    { id: 'far-1', categoria: 'farmacia', nombre: 'Antiparasitario en Tabletas', precio: 25, descripcion: 'Tableta palatable de amplio espectro contra parásitos internos.', nota: 'Dosificación exacta según peso.', imagen: 'Img/tabletas.jpg' },
    { id: 'far-2', categoria: 'farmacia', nombre: 'Jarabe Vitamínico y Protector Hepático', precio: 45, descripcion: 'Suspensión oral palatable con vitaminas del complejo B y aminoácidos.', nota: 'Incluye jeringa dosificadora.', imagen: 'Img/jarabes.jpg' },
    { id: 'far-3', categoria: 'farmacia', nombre: 'Cremas y Pomadas Cicatrizantes', precio: 35, descripcion: 'Pomada tópica regeneradora para irritaciones, heridas leves y almohadillas.', nota: 'Aplicar 2 veces al día sobre zona limpia.', imagen: 'Img/cremas.jpg' }
  ];

  let CATALOGO = Array.isArray(window.DONGATO_CATALOGO) && window.DONGATO_CATALOGO.length
    ? window.DONGATO_CATALOGO
    : (Array.isArray(window.CATALOGO_SERVICIOS) && window.CATALOGO_SERVICIOS.length
      ? window.CATALOGO_SERVICIOS
      : (Array.isArray(window.servicios) && window.servicios.length ? window.servicios : []));

  const CATEGORIAS = window.DONGATO_CATEGORIAS || {
    todos: 'Todos',
    peluqueria: 'Peluquería & SPA',
    veterinaria: 'Medicina Veterinaria',
    cirugias: 'Cirugías',
    petshop: 'Petshop',
    farmacia: 'Farmacia'
  };

  const SUBFILTROS_CASCADA = {
    peluqueria: [
      { id: 'todos', label: 'Todos los servicios de SPA' },
      { id: 'economico', label: 'Hasta 80 BOB' },
      { id: 'premium', label: 'Más de 80 BOB' }
    ],
    veterinaria: [
      { id: 'todos', label: 'Todas las atenciones médicas' },
      { id: 'economico', label: 'Consultas y vacunas (≤ 70 BOB)' },
      { id: 'premium', label: 'Especialidades (> 70 BOB)' }
    ],
    cirugias: [
      { id: 'todos', label: 'Todas las cirugías' },
      { id: 'economico', label: 'Cirugías menores (≤ 250 BOB)' },
      { id: 'premium', label: 'Cirugías mayores (> 250 BOB)' }
    ],
    petshop: [
      { id: 'todos', label: 'Todos los productos Petshop' },
      { id: 'economico', label: 'Accesorios y snacks (≤ 45 BOB)' },
      { id: 'premium', label: 'Alimentos y transporte (> 45 BOB)' }
    ],
    farmacia: [
      { id: 'todos', label: 'Toda la farmacia' },
      { id: 'economico', label: 'Antiparasitarios básicos (≤ 35 BOB)' },
      { id: 'premium', label: 'Tratamientos completos (> 35 BOB)' }
    ]
  };

  const WHATSAPP_NUM = '59167301341';
  const STORAGE = {
    alias: 'dongato_alias',
    carrito: 'dongato_carrito',
    eventos: 'dongato_eventos',
    ventas: 'dongato_ventas',
    admin: 'dongato_admin',
    vistaSimulada: 'dongato_vista_movil'
  };

  let categoriaActiva = 'todos';
  let subfiltroCascada = 'todos';
  let textoBusqueda = '';
  let servicioDetalleActual = null;
  let timerResumen = null;
  let segundosRestantes = 30;
  let deferredPrompt = null;

  const leerJSON = (clave, defecto) => {
    try {
      const raw = localStorage.getItem(clave);
      return raw ? JSON.parse(raw) : defecto;
    } catch {
      return defecto;
    }
  };

  const guardarJSON = (clave, valor) => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch {}
  };

  /* ==========================================================================
     3. NOTIFICACIONES TOAST, RESPALDO DE IMÁGENES Y BITÁCORA EN VIVO
     ========================================================================== */
  const mostrarToast = (mensaje, tipo = 'ok') => {
    const $toast = $('#vetToastAlert');
    if (!$toast.length) return;
    $toast
      .removeClass('is-ok is-warn')
      .addClass(tipo === 'warn' ? 'is-warn' : 'is-ok')
      .text(mensaje)
      .stop(true, true)
      .fadeIn(180);
    clearTimeout(mostrarToast._t);
    mostrarToast._t = setTimeout(() => $toast.fadeOut(280), 3200);
  };

  const crearSvgRespaldo = (titulo, emoji = '🐾') => {
    const texto = limpiar(titulo || 'Don Gato').slice(0, 26);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260"><defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a0a24"/><stop offset="100%" stop-color="#4a194a"/></linearGradient></defs><rect width="400" height="260" fill="url(#dg)"/><text x="200" y="118" text-anchor="middle" font-size="44">${emoji}</text><text x="200" y="164" text-anchor="middle" fill="#f5c518" font-family="Segoe UI,sans-serif" font-size="15" font-weight="700">${escapeHTML(texto)}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const aplicarRespaldoImagenes = (contenedor = document) => {
    $(contenedor).find('img').each(function () {
      const img = this;
      const fallback = () => {
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = 'true';
        img.src = crearSvgRespaldo(img.alt || 'Don Gato', img.dataset.fallbackEmoji || '🐾');
      };
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
        fallback();
      }
      $(img).off('error.vetFallback').on('error.vetFallback', fallback);
    });
  };

  const registrarBitacora = (accion, detalle = '') => {
    const hora = new Date().toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const texto = `[${hora}] ${accion}${detalle ? ` → ${detalle}` : ''}`;

    const $live = $('#logOutput');
    if ($live.length) {
      $live.prepend($('<div></div>').text(texto));
      const hijos = $live.children();
      if (hijos.length > 45) hijos.last().remove();
    }

    const eventos = leerJSON(STORAGE.eventos, []);
    eventos.unshift({
      fecha: new Date().toLocaleString('es-BO'),
      accion,
      detalle
    });
    guardarJSON(STORAGE.eventos, eventos.slice(0, 80));
    renderBitacoraAdmin();
  };

  /* ==========================================================================
     4. MODO CELULAR 📱 / LAPTOP 💻 Y NAVEGACIÓN DE VISTAS SIN SCROLL GLOBAL
     ========================================================================== */
  const esDispositivoMovilReal = () => {
    return window.matchMedia('(max-width: 768px)').matches
      || window.matchMedia('(orientation: landscape) and (max-height: 520px)').matches;
  };

  const esVistaCelularActiva = () => {
    return document.body.classList.contains('vista-movil-simulada') || esDispositivoMovilReal();
  };

  const actualizarBotonVista = (simulado) => {
    const $btn = $('#btnSimularVista');
    if (!$btn.length) return;
    $btn.attr('aria-pressed', String(simulado));
    $btn.find('.view-icon').text(simulado ? '💻' : '📱');
    $btn.find('.view-label').text(simulado ? 'Laptop' : 'Móvil');
    $btn.attr('title', simulado ? 'Volver a vista completa de Laptop' : 'Simular vista de Celular sin scroll global');
  };

  const activarVista = (idSeccion, hacerScroll = true) => {
    if (!idSeccion) return;
    const $destino = $('#' + idSeccion);
    if (!$destino.length) return;

    $('.vista-seccion').removeClass('is-vista-activa');
    $destino.addClass('is-vista-activa');
    $destino.scrollTop(0);

    $('.vet-links a').removeClass('active');
    $(`.vet-links a[data-vista-target="${idSeccion}"]`).addClass('active');

    $('.vet-dock-link').removeClass('is-active');
    $(`.vet-dock-link[data-vista-target="${idSeccion}"]`).addClass('is-active');

    if ($('#vetMobileNav').is(':visible')) {
      $('#vetMobileNav').slideUp(160);
      $('#burguerBtn').attr('aria-expanded', 'false');
    }

    if (hacerScroll && !esVistaCelularActiva() && $destino[0]) {
      $destino[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (localStorage.getItem(STORAGE.vistaSimulada) === '1' && !esDispositivoMovilReal()) {
    document.body.classList.add('vista-movil-simulada');
    actualizarBotonVista(true);
  }

  $('#btnSimularVista').on('click', function () {
    const activo = document.body.classList.toggle('vista-movil-simulada');
    localStorage.setItem(STORAGE.vistaSimulada, activo ? '1' : '0');
    actualizarBotonVista(activo);

    const seccionActual = $('.vista-seccion.is-vista-activa').attr('id') || 'inicio';
    activarVista(seccionActual, !activo);

    mostrarToast(
      activo
        ? '📱 Vista Celular activada (navegación por pestañas sin scroll global)'
        : '💻 Vista Laptop restaurada (pantalla completa)'
    );
    registrarBitacora('Cambio de vista', activo ? 'Modo Celular (📱)' : 'Modo Laptop (💻)');
  });

  $(window).on('resize orientationchange', function () {
    if (esDispositivoMovilReal() && document.body.classList.contains('vista-movil-simulada')) {
      document.body.classList.remove('vista-movil-simulada');
      actualizarBotonVista(false);
    }
    const seccionActual = $('.vista-seccion.is-vista-activa').attr('id') || 'inicio';
    activarVista(seccionActual, false);
  });

  $(document).on('click', '[data-vista-target]', function (e) {
    const target = $(this).data('vistaTarget');
    if (!target) return;
    e.preventDefault();
    activarVista(target, true);
  });

  /* ==========================================================================
     5. TEMA OSCURO/CLARO, PWA, ESTADO DE RED Y SERVICE WORKER
     ========================================================================== */
  const aplicarTemaLocal = (tema) => {
    const valido = tema === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', valido);
    localStorage.setItem('dw2-theme', valido);
    const $icon = $('#themeBtn .theme-icon');
    if ($icon.length) $icon.text(valido === 'dark' ? '☀️' : '🌙');
  };

  aplicarTemaLocal(localStorage.getItem('dw2-theme') || document.documentElement.getAttribute('data-theme') || 'dark');

  $('#themeBtn').on('click', function () {
    const actual = document.documentElement.getAttribute('data-theme');
    const nuevo = actual === 'dark' ? 'light' : 'dark';
    aplicarTemaLocal(nuevo);
    registrarBitacora('Cambio de tema', nuevo === 'dark' ? 'Modo Oscuro' : 'Modo Claro');
  });

  const actualizarEstadoRed = () => {
    const online = navigator.onLine;
    const $pill = $('#estadoRed');
    if ($pill.length) {
      $pill
        .text(online ? 'En Línea' : 'Offline Local')
        .toggleClass('is-offline', !online);
    }
    if (online && window.SupabaseDW2 && typeof window.SupabaseDW2.sincronizar === 'function') {
      window.SupabaseDW2.sincronizar().catch(() => {});
    }
  };

  window.addEventListener('online', () => {
    actualizarEstadoRed();
    mostrarToast('🌐 Conexión restablecida. Sincronizando datos locales...');
    registrarBitacora('Red conectada', 'Sincronización automática con Supabase');
  });

  window.addEventListener('offline', () => {
    actualizarEstadoRed();
    mostrarToast('📴 Sin conexión: operando en modo Offline-First', 'warn');
    registrarBitacora('Modo Offline', 'Respaldo activo en localStorage');
  });

  actualizarEstadoRed();

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    $('#btnInstalarPWA').prop('hidden', false);
  });

  $('#btnInstalarPWA').on('click', async function () {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    $(this).prop('hidden', true);
    registrarBitacora('Instalación PWA', 'Solicitud ejecutada por el usuario');
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  /* ==========================================================================
     6. ALIAS DEL TUTOR Y MENÚ HAMBURGUESA
     ========================================================================== */
  const aplicarAlias = (alias) => {
    const limpio = limpiar(alias).slice(0, 40);
    if (limpio) {
      localStorage.setItem(STORAGE.alias, limpio);
      $('#vetAliasDisplay').text(limpio);
      $('#vetAliasInput, #vetClientAlias').val(limpio);
      if (!$('#vetOwner').val()) $('#vetOwner').val(limpio);
      if (!$('#citaTutor').val()) $('#citaTutor').val(limpio);
    }
  };

  aplicarAlias(localStorage.getItem(STORAGE.alias) || '');

  $('#vetAliasForm, #vetClientForm').on('submit', function (e) {
    e.preventDefault();
    const val = $(this).find('input').val();
    if (!limpiar(val)) return;
    aplicarAlias(val);
    mostrarToast(`🐾 Alias guardado: ${limpiar(val)}`);
    registrarBitacora('Alias actualizado', limpiar(val));
    if (this.id === 'vetClientForm') {
      cerrarModalSeguro('#vetCuentaModal');
    }
  });

  $('#burguerBtn').on('click', function () {
    const $nav = $('#vetMobileNav');
    const abierto = $nav.is(':visible');
    $nav.slideToggle(180);
    $(this).attr('aria-expanded', String(!abierto));
  });

  /* ==========================================================================
     7. CATÁLOGO DINÁMICO, CHIPS, BÚSQUEDA Y SELECTS EN CASCADA
     ========================================================================== */
  const renderChipsCategorias = () => {
    const $cont = $('#vetFiltros').empty();
    Object.entries(CATEGORIAS).forEach(([clave, nombre]) => {
      const activo = clave === categoriaActiva;
      const $btn = $('<button type="button" class="chip"></button>')
        .text(nombre)
        .toggleClass('active', activo)
        .attr('aria-pressed', String(activo))
        .data('cat', clave);
      $cont.append($btn);
    });
  };

  const actualizarSelectCascada = (area) => {
    const $sub = $('#vetCascadeSub').empty();
    if (!area || area === 'todos' || !SUBFILTROS_CASCADA[area]) {
      $sub.append('<option value="todos">-- Primero elige un área --</option>').prop('disabled', true);
      subfiltroCascada = 'todos';
      return;
    }
    SUBFILTROS_CASCADA[area].forEach((op) => {
      $sub.append(`<option value="${escapeHTML(op.id)}">${escapeHTML(op.label)}</option>`);
    });
    $sub.prop('disabled', false);
    subfiltroCascada = 'todos';
  };

  const obtenerLimitePrecioArea = (area) => {
    if (area === 'cirugias') return 250;
    if (area === 'petshop') return 45;
    if (area === 'farmacia') return 35;
    if (area === 'peluqueria') return 80;
    return 70;
  };

  const filtrarCatalogo = () => {
    const q = limpiar(textoBusqueda).toLowerCase();
    const filtrados = CATALOGO.filter((item) => {
      const okCat = categoriaActiva === 'todos' || item.categoria === categoriaActiva;
      let okSub = true;
      if (categoriaActiva !== 'todos' && subfiltroCascada !== 'todos') {
        const limite = obtenerLimitePrecioArea(categoriaActiva);
        okSub = subfiltroCascada === 'economico'
          ? Number(item.precio) <= limite
          : Number(item.precio) > limite;
      }
      const okTexto = !q
        || String(item.nombre || '').toLowerCase().includes(q)
        || String(item.descripcion || '').toLowerCase().includes(q)
        || String(item.nota || '').toLowerCase().includes(q);
      return okCat && okSub && okTexto;
    });

    $('#vetStatServicios').text(CATALOGO.length);
    $('#vetResultInfo').text(`Mostrando ${filtrados.length} de ${CATALOGO.length} servicios y productos disponibles.`);

    const $grid = $('#vetGrid').empty();
    if (!filtrados.length) {
      $grid.append('<div class="card card-pad vet-empty"><p class="muted">No se encontraron servicios con ese filtro. Prueba otra búsqueda o categoría.</p></div>');
      return;
    }

    filtrados.forEach((item) => {
      const catNombre = CATEGORIAS[item.categoria] || item.categoria;
      const html = `
        <article class="vet-card" data-id="${escapeHTML(item.id)}">
          <div class="vet-card-media">
            <img src="${escapeHTML(item.imagen)}" alt="${escapeHTML(item.nombre)}" loading="lazy" decoding="async" data-fallback-emoji="🐾">
            <button type="button" class="vet-zoom-btn" data-action="detalle" data-id="${escapeHTML(item.id)}">🔍 Detalle</button>
          </div>
          <div class="vet-card-body">
            <span class="vet-card-cat">${escapeHTML(catNombre)}</span>
            <h3 class="vet-card-title">${escapeHTML(item.nombre)}</h3>
            <p class="vet-card-desc">${escapeHTML(item.descripcion)}</p>
            <div class="vet-card-acordeon">${escapeHTML(item.nota || 'Atención garantizada por el Dr. Jorge Castillo MVZ.')}</div>
            <div class="vet-card-foot">
              <div class="vet-price">${Number(item.precio)} <small>BOB</small></div>
              <div class="vet-card-actions">
                <button type="button" class="btn btn-ghost btn-xs" data-action="info" data-id="${escapeHTML(item.id)}">ℹ️ Info</button>
                <button type="button" class="btn btn-primary btn-xs" data-action="agregar" data-id="${escapeHTML(item.id)}">+ Cotizar</button>
              </div>
            </div>
          </div>
        </article>`;
      $grid.append(html);
    });

    aplicarRespaldoImagenes($grid[0]);
  };

  $('#vetFiltros').on('click', '.chip', function () {
    categoriaActiva = $(this).data('cat') || 'todos';
    $('#vetCascadeArea').val(categoriaActiva);
    actualizarSelectCascada(categoriaActiva);
    renderChipsCategorias();
    filtrarCatalogo();
    registrarBitacora('Filtro por chip', CATEGORIAS[categoriaActiva] || categoriaActiva);
  });

  $('#vetCascadeArea').on('change', function () {
    categoriaActiva = $(this).val() || 'todos';
    actualizarSelectCascada(categoriaActiva);
    renderChipsCategorias();
    filtrarCatalogo();
    registrarBitacora('Filtro cascada (Área)', CATEGORIAS[categoriaActiva] || categoriaActiva);
  });

  $('#vetCascadeSub').on('change', function () {
    subfiltroCascada = $(this).val() || 'todos';
    filtrarCatalogo();
    registrarBitacora('Filtro cascada (Rango)', subfiltroCascada);
  });

  let debounceBusqueda = null;
  $('#vetBusqueda').on('input', function () {
    textoBusqueda = $(this).val();
    clearTimeout(debounceBusqueda);
    debounceBusqueda = setTimeout(() => {
      filtrarCatalogo();
      if (limpiar(textoBusqueda)) {
        registrarBitacora('Búsqueda en catálogo', limpiar(textoBusqueda));
      }
    }, 160);
  });

  $('#vetGrid').on('click', '[data-action]', function () {
    const accion = $(this).data('action');
    const id = $(this).data('id');
    const item = CATALOGO.find((x) => x.id === id);
    if (!item) return;

    if (accion === 'info') {
      $(this).closest('.vet-card').find('.vet-card-acordeon').slideToggle(180);
      registrarBitacora('Especificación desplegada', item.nombre);
    } else if (accion === 'detalle') {
      servicioDetalleActual = item;
      $('#vetDetailCat').text(CATEGORIAS[item.categoria] || item.categoria);
      $('#vetDetailName').text(item.nombre);
      const $detailImg = $('#vetDetailImg');
      delete $detailImg[0].dataset.fallbackApplied;
      $detailImg.attr({ src: item.imagen, alt: item.nombre });
      aplicarRespaldoImagenes('#vetDetailModal');
      $('#vetDetailDesc').text(item.descripcion);
      $('#vetDetailNota').text(item.nota || '');
      $('#vetDetailPrice').text(`${item.precio} BOB`);
      abrirModalSeguro('#vetDetailModal');
      registrarBitacora('Vista de detalle', item.nombre);
    } else if (accion === 'agregar') {
      agregarAlCarrito(item);
    }
  });

  $('#vetDetailAdd').on('click', function () {
    if (!servicioDetalleActual) return;
    agregarAlCarrito(servicioDetalleActual);
    cerrarModalSeguro('#vetDetailModal');
  });

  /* ==========================================================================
     8. COTIZADOR, CARRITO INTERACTIVO Y RESUMEN CON TEMPORIZADOR
     ========================================================================== */
  const obtenerCarrito = () => leerJSON(STORAGE.carrito, []);
  const guardarCarrito = (lista) => guardarJSON(STORAGE.carrito, lista);

  const renderCarrito = () => {
    const carrito = obtenerCarrito();
    let totalItems = 0;
    let totalBOB = 0;
    const $lista = $('#vetCartList').empty();

    if (!carrito.length) {
      $lista.append('<li class="muted small">Aún no seleccionaste servicios. Añade desde el catálogo.</li>');
    } else {
      carrito.forEach((it) => {
        const sub = Number(it.precio) * Number(it.cantidad);
        totalItems += Number(it.cantidad);
        totalBOB += sub;
        $lista.append(`
          <li class="vet-cart-item" data-id="${escapeHTML(it.id)}">
            <div>
              <strong>${escapeHTML(it.nombre)}</strong>
              <small>${it.precio} BOB c/u</small>
            </div>
            <div class="vet-qty">
              <button type="button" data-qty="-1" aria-label="Disminuir">−</button>
              <span>${it.cantidad}</span>
              <button type="button" data-qty="1" aria-label="Aumentar">+</button>
            </div>
            <span class="vet-item-total">${sub} BOB</span>
          </li>`);
      });
    }

    $('#vetCartCount').text(totalItems);
    $('#vetCartTotal, #vetCartSubtotal').text(`${totalBOB} BOB`);
  };

  const agregarAlCarrito = (item) => {
    const carrito = obtenerCarrito();
    const existente = carrito.find((x) => x.id === item.id);
    if (existente) {
      existente.cantidad += 1;
    } else {
      carrito.push({
        id: item.id,
        nombre: item.nombre,
        precio: Number(item.precio),
        cantidad: 1
      });
    }
    guardarCarrito(carrito);
    renderCarrito();
    mostrarToast(`🛒 Añadido: ${item.nombre} (${item.precio} BOB)`);
    registrarBitacora('Añadido al cotizador', `${item.nombre} (${item.precio} BOB)`);
  };

  $('#vetCartList').on('click', '[data-qty]', function () {
    const delta = Number($(this).data('qty'));
    const id = $(this).closest('.vet-cart-item').data('id');
    const carrito = obtenerCarrito();
    const idx = carrito.findIndex((x) => x.id === id);
    if (idx === -1) return;
    carrito[idx].cantidad += delta;
    if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
    guardarCarrito(carrito);
    renderCarrito();
    registrarBitacora('Cantidad ajustada en cotizador', id);
  });

  $('#vetCartClear').on('click', () => {
    guardarCarrito([]);
    renderCarrito();
    mostrarToast('🗑️ Cotizador vaciado', 'warn');
    registrarBitacora('Cotizador vaciado');
  });

  $('#vetCalcSesiones').on('input change', function () {
    const n = Math.max(1, Math.min(20, Number($(this).val()) || 1));
    $('#vetCalcTotalRapido').text(`${n * 30} BOB`);
  });

  const validarDatosPaciente = () => {
    const mascota = limpiar($('#vetPet').val());
    const especie = $('#vetSpecies').val();
    const tutor = limpiar($('#vetOwner').val());
    const cel = limpiar($('#vetPhone').val());
    const $err = $('#vetPatientError').text('');

    if (!mascota) {
      $err.text('Ingresa el nombre de tu mascota para generar la cotización.');
      return null;
    }
    if (!esSoloLetras(tutor)) {
      $err.text('Ingresa el nombre del tutor (solo letras, mínimo 2 caracteres).');
      return null;
    }
    if (!esTelefonoValido(cel)) {
      $err.text('Ingresa un celular boliviano válido de 8 dígitos (iniciando en 6 o 7).');
      return null;
    }
    return { mascota, especie, tutor, cel };
  };

  const construirTextoCotizacion = (datos, carrito) => {
    const total = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
    const lineas = carrito
      .map((it) => `• ${it.nombre} (x${it.cantidad}): ${it.precio * it.cantidad} BOB`)
      .join('\n');
    return `🐾 *Cotización Clínica Veterinaria Don Gato*\nTutor: ${datos.tutor} (${datos.cel})\nPaciente: ${datos.mascota} (${datos.especie})\n\n*Detalle:*\n${lineas}\n\n*Total estimado:* ${total} BOB`;
  };

  $('#vetConfirm').on('click', () => {
    const carrito = obtenerCarrito();
    if (!carrito.length) {
      $('#vetPatientError').text('Añade al menos un servicio del catálogo antes de generar el resumen.');
      return;
    }
    const datos = validarDatosPaciente();
    if (!datos) return;

    const total = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
    const filas = carrito
      .map((it) => `<li>${escapeHTML(it.nombre)} × ${it.cantidad} — <strong>${it.precio * it.cantidad} BOB</strong></li>`)
      .join('');

    $('#vetResumenBody').html(`
      <p><strong>Paciente:</strong> ${escapeHTML(datos.mascota)} (${escapeHTML(datos.especie)})</p>
      <p><strong>Tutor:</strong> ${escapeHTML(datos.tutor)} · ${escapeHTML(datos.cel)}</p>
      <ul class="mt-1 mb-1">${filas}</ul>
      <p class="vet-detail-price">Total: ${total} BOB</p>
    `);

    clearInterval(timerResumen);
    segundosRestantes = 30;
    $('#vetResumenTimer').text('00:30s');
    timerResumen = setInterval(() => {
      segundosRestantes -= 1;
      if (segundosRestantes <= 0) {
        clearInterval(timerResumen);
        $('#vetResumenTimer').text('Expirado');
      } else {
        $('#vetResumenTimer').text(`00:${String(segundosRestantes).padStart(2, '0')}s`);
      }
    }, 1000);

    abrirModalSeguro('#vetResumenModal');
    registrarBitacora('Resumen de cotización abierto', `${datos.mascota} — ${total} BOB`);
  });

  $('#vetResumenConfirmar').on('click', () => {
    const carrito = obtenerCarrito();
    const datos = validarDatosPaciente();
    if (!carrito.length || !datos) return;

    const total = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
    const items = carrito.reduce((acc, it) => acc + it.cantidad, 0);
    const ventas = leerJSON(STORAGE.ventas, []);
    ventas.unshift({
      fecha: new Date().toLocaleString('es-BO'),
      tutor: datos.tutor,
      mascota: datos.mascota,
      total,
      items
    });
    guardarJSON(STORAGE.ventas, ventas);
    renderBitacoraAdmin();

    if (window.SupabaseDW2 && typeof window.SupabaseDW2.guardarCotizacion === 'function') {
      window.SupabaseDW2.guardarCotizacion({ ...datos, carrito, total }).catch(() => {});
    }

    clearInterval(timerResumen);
    cerrarModalSeguro('#vetResumenModal');
    mostrarToast(`✅ Reserva confirmada para ${datos.mascota} (${total} BOB)`);
    registrarBitacora('Cotización confirmada', `${datos.tutor} — ${total} BOB`);
  });

  $('#vetWhatsapp, #vetResumenWa').on('click', () => {
    const carrito = obtenerCarrito();
    if (!carrito.length) {
      $('#vetPatientError').text('Añade servicios al cotizador antes de enviar por WhatsApp.');
      return;
    }
    const datos = validarDatosPaciente();
    if (!datos) return;
    abrirWhatsapp(WHATSAPP_NUM, construirTextoCotizacion(datos, carrito));
    registrarBitacora('Cotización enviada por WhatsApp', datos.mascota);
  });

  /* ==========================================================================
     9. FORMULARIO DE CITAS + SUPABASE + WHATSAPP
     ========================================================================== */
  const hoyISO = new Date().toISOString().split('T')[0];
  $('#citaFecha').attr('min', hoyISO).val(hoyISO);

  $('#vetCitaForm').on('submit', async function (e) {
    e.preventDefault();
    const tutor = limpiar($('#citaTutor').val());
    const mascota = limpiar($('#citaMascota').val());
    const celular = limpiar($('#citaCelular').val());
    const fecha = $('#citaFecha').val();
    const servicio = $('#citaServicio').val();
    const notas = limpiar($('#citaNotas').val());
    const $err = $('#vetCitaError').text('');
    const $box = $('#alertaCitaBox').empty();

    if (!esSoloLetras(tutor)) {
      $err.text('Ingresa un nombre válido para el tutor (solo letras).');
      return;
    }
    if (!mascota) {
      $err.text('Ingresa el nombre de la mascota.');
      return;
    }
    if (!esTelefonoValido(celular)) {
      $err.text('El celular debe tener 8 dígitos y empezar con 6 o 7.');
      return;
    }
    if (!fecha || fecha < hoyISO) {
      $err.text('Selecciona una fecha válida (hoy o posterior).');
      return;
    }

    const payload = {
      tutor,
      mascota,
      celular,
      fecha,
      servicio,
      notas,
      origen: 'DonGato-Web'
    };

    if (window.SupabaseDW2 && typeof window.SupabaseDW2.guardarCita === 'function') {
      await window.SupabaseDW2.guardarCita(payload).catch(() => {});
    }

    $box.html('<span class="msg-exito">✅ Cita registrada correctamente. Abriendo WhatsApp para confirmar horario...</span>');
    mostrarToast(`📅 Cita registrada para ${mascota}`);
    registrarBitacora('Cita agendada', `${tutor} · ${mascota} · ${servicio} (${fecha})`);

    const msg = `🐾 *Solicitud de Cita — Clínica Don Gato*\nTutor: ${tutor}\nMascota: ${mascota}\nCelular: ${celular}\nFecha: ${fecha}\nServicio: ${servicio}${notas ? `\nNotas: ${notas}` : ''}`;
    abrirWhatsapp(WHATSAPP_NUM, msg);
  });

  /* ==========================================================================
     10. PANEL DE ADMINISTRACIÓN Y BITÁCORA PERSISTENTE
     ========================================================================== */
  const actualizarModoAdmin = () => {
    const esAdmin = localStorage.getItem(STORAGE.admin) === '1';
    document.body.classList.toggle('is-admin', esAdmin);
    $('#vetAdminForm').toggleClass('hidden', esAdmin);
    $('#vetAdminLogout').toggleClass('hidden', !esAdmin);
    renderBitacoraAdmin();
  };

  const renderBitacoraAdmin = () => {
    const eventos = leerJSON(STORAGE.eventos, []);
    const ventas = leerJSON(STORAGE.ventas, []);
    const totalVentas = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
    const totalItems = ventas.reduce((acc, v) => acc + Number(v.items || 0), 0);
    const ticket = ventas.length ? Math.round(totalVentas / ventas.length) : 0;

    $('#kpiVentas').text(`${totalVentas} BOB`);
    $('#kpiEventos').text(eventos.length);
    $('#kpiItems').text(totalItems);
    $('#kpiTicket').text(`${ticket} BOB`);

    const $logEv = $('#vetLogEventos').empty();
    if (!eventos.length) {
      $logEv.append('<p class="muted small">Sin eventos registrados aún.</p>');
    } else {
      eventos.slice(0, 30).forEach((ev) => {
        $logEv.append(`<div class="small mb-1"><strong>[${escapeHTML(ev.fecha)}]</strong> ${escapeHTML(ev.accion)} ${ev.detalle ? `— ${escapeHTML(ev.detalle)}` : ''}</div>`);
      });
    }

    const $logVe = $('#vetLogVentas').empty();
    if (!ventas.length) {
      $logVe.append('<p class="muted small">Sin cotizaciones confirmadas todavía.</p>');
    } else {
      ventas.forEach((v) => {
        $logVe.append(`<div class="small mb-1"><strong>[${escapeHTML(v.fecha)}]</strong> ${escapeHTML(v.tutor)} (${escapeHTML(v.mascota)}) — <strong>${v.total} BOB</strong></div>`);
      });
    }
  };

  $('#vetAdminForm').on('submit', function (e) {
    e.preventDefault();
    const u = limpiar($('#vetAdminUser').val()).toLowerCase();
    const p = limpiar($('#vetAdminPass').val());
    if ((u === 'admin' && p === 'admin123') || p === 'vet2026') {
      localStorage.setItem(STORAGE.admin, '1');
      $('#vetAdminError').text('');
      actualizarModoAdmin();
      cerrarModalSeguro('#vetCuentaModal');
      mostrarToast('🔐 Sesión de administrador iniciada');
      registrarBitacora('Inicio de sesión Admin');
    } else {
      $('#vetAdminError').text('Credenciales incorrectas. Usa admin / admin123.');
    }
  });

  $('#vetAdminLogout').on('click', () => {
    localStorage.removeItem(STORAGE.admin);
    actualizarModoAdmin();
    cerrarModalSeguro('#vetCuentaModal');
    mostrarToast('🚪 Sesión de administrador cerrada', 'warn');
    registrarBitacora('Cierre de sesión Admin');
  });

  $('#btnLimpiarLiveLog').on('click', () => {
    $('#logOutput').html('<div>[Sistema] Consola limpiada.</div>');
  });

  $('#vetRefreshLogs').on('click', renderBitacoraAdmin);

  $('#vetClearLogs').on('click', () => {
    guardarJSON(STORAGE.eventos, []);
    guardarJSON(STORAGE.ventas, []);
    renderBitacoraAdmin();
    mostrarToast('🗑️ Historial administrativo limpiado', 'warn');
  });

  /* ==========================================================================
     11. INICIALIZACIÓN GLOBAL (CON CARGA AUTOMÁTICA DE JSON / RESPALDO)
     ========================================================================== */
  const iniciarApp = async () => {
    if (!CATALOGO.length) {
      try {
        const resp = await fetch('data/servicios.json');
        if (resp.ok) {
          const json = await resp.json();
          const lista = Array.isArray(json) ? json : (json.servicios || json.catalogo || []);
          if (lista.length) CATALOGO = lista;
        }
      } catch {}
    }

    if (!CATALOGO.length) {
      CATALOGO = CATALOGO_RESPALDO;
    }

    aplicarRespaldoImagenes(document);
    renderChipsCategorias();
    actualizarSelectCascada('todos');
    filtrarCatalogo();
    renderCarrito();
    actualizarModoAdmin();
  };

  iniciarApp();
});