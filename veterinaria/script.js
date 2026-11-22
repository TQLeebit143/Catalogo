(function () {
  'use strict';

  const CATALOGO = Array.isArray(window.catalogoVet) ? window.catalogoVet : [];
  const CATS = Array.isArray(window.VET_CATEGORIAS) && window.VET_CATEGORIAS.length
    ? window.VET_CATEGORIAS
    : [
        { id: 'peluqueria', label: 'Peluquería & SPA', emoji: '✂️' },
        { id: 'veterinaria', label: 'Veterinaria', emoji: '🩺' },
        { id: 'cirugias', label: 'Cirugías', emoji: '🏥' },
        { id: 'petshop', label: 'Petshop', emoji: '🛍️' },
        { id: 'farmacia', label: 'Farmacia', emoji: '💊' }
      ];

  const KEYS = {
    carrito: 'dongato_cart_v2',
    alias: 'dongato_alias',
    eventos: 'dongato_logs_eventos_v2',
    ventas: 'dongato_logs_ventas_v2',
    admin: 'dongato_admin_auth'
  };

  const WA_NUMBER = '59167301341';
  const MAX_LOG = 250;

  let filtro = { cat: 'todos', rango: 'todos', q: '' };
  let carrito = normalizarCarrito(App.store.get(KEYS.carrito, []));
  let detalleActual = null;
  let ultimaCotizacion = null;
  let timerCotizacion = null;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (v) => App.escape(v);
  const money = (n) => App.money(n) + ' BOB';

  /* ============================================================
     MAPEO EXACTO DE IMÁGENES EN Img/
     Asocia cada servicio/producto con su imagen real de Img/
     ============================================================ */
  const MAPA_IMAGENES = [
    { match: /arena/i, file: 'Img/arena sanitaria.jpg' },
    { match: /^ba[nñ]o/i, file: 'Img/bano.jpg' },
    { match: /castraci[oó]n.*gato|gato.*castraci[oó]n/i, file: 'Img/castracion gatos.jpg' },
    { match: /castraci[oó]n.*perro|perro.*castraci[oó]n/i, file: 'Img/castracion perro.jpg' },
    { match: /cepillo/i, file: 'Img/cepillo mascota.jpg' },
    { match: /collar|gps/i, file: 'Img/collar gps.jpg' },
    { match: /consulta/i, file: 'Img/consulta.jpg' },
    { match: /u[nñ]a/i, file: 'Img/corte unas.jpg' },
    { match: /^corte\b/i, file: 'Img/corte.jpg' },
    { match: /crema|pomada/i, file: 'Img/cremas.jpg' },
    { match: /ecograf/i, file: 'Img/ecografia.jpg' },
    { match: /esterilizaci[oó]n.*gat|gat.*esterilizaci[oó]n/i, file: 'Img/estirilizacion gatas.jpg' },
    { match: /esterilizaci[oó]n.*perr|perr.*esterilizaci[oó]n/i, file: 'Img/estirilizacion perras.jpg' },
    { match: /eutanasia/i, file: 'Img/eutanasia.jpg' },
    { match: /fluidoterapia|suero/i, file: 'Img/fluidoterapia.jpg' },
    { match: /inyect|vacun|desparasit/i, file: 'Img/inyectable.jpg' },
    { match: /jarabe/i, file: 'Img/jarabes.jpg' },
    { match: /dental|diente/i, file: 'Img/limpieza dental.jpg' },
    { match: /peluquer[ií]a.*gat|gat.*peluquer/i, file: 'Img/peluqueria gato.jpg' },
    { match: /peluquer[ií]a/i, file: 'Img/peluqueria.jpg' },
    { match: /^shampoo|^champ[uú]/i, file: 'Img/shampoo.jpg' },
    { match: /tableta|pastilla|comprimido/i, file: 'Img/tabletas.jpg' },
    { match: /intravenos|v[ií]a/i, file: 'Img/via intravenosa.jpg' }
  ];
  function resolverImagen(p) {
    const texto = `${p.nombre || ''} ${p.detalle || ''}`;
    const encontrado = MAPA_IMAGENES.find((m) => m.match.test(texto));
    if (encontrado) return encontrado.file;
    if (p.img) {
      return String(p.img).replace(/^img\//i, 'Img/');
    }
    return 'Img/LOGO DE DON GATO sin fondo.png';
  }

  function manejarErrorImagen(img, emoji) {
    const intento = Number(img.dataset.extTry || 0);
    const exts = ['.jpg', '.png', '.jpeg', '.webp'];
    const base = (img.getAttribute('src') || '').replace(/\.[^.]+$/, '');
    if (base && intento < exts.length) {
      img.dataset.extTry = String(intento + 1);
      const siguiente = base + exts[intento];
      if (siguiente !== img.getAttribute('src')) {
        img.src = siguiente;
        return;
      }
    }
    if (window.App && typeof App.imgFallback === 'function') {
      App.imgFallback(img, emoji || '🐾');
    }
  }

  /* ============================================================
     TOAST ALERT FLOTANTE (jQuery .slideDown / .delay / .fadeOut)
     ============================================================ */
  function mostrarToastUI(mensaje, tipo) {
    if (window.jQuery) {
      const $toast = window.jQuery('#vetToastAlert');
      $toast
        .stop(true, true)
        .removeClass('is-ok is-warn')
        .addClass(tipo === 'warn' ? 'is-warn' : 'is-ok')
        .text(mensaje)
        .slideDown(250)
        .delay(3000)
        .fadeOut(350);
    } else if (window.App && App.toast) {
      App.toast(mensaje, tipo || 'ok');
    }
  }

  /* ============================================================
     BITÁCORA EN VIVO (#logOutput) CON MARCA DE TIEMPO
     ============================================================ */
  function escribirConsolaViva(tipo, mensaje) {
    const salida = $('#logOutput');
    if (!salida) return;
    const hora = new Date().toLocaleTimeString();
    const fila = document.createElement('div');
    fila.textContent = `[${hora}] ${tipo}: ${mensaje}`;
    salida.prepend(fila);
    while (salida.children.length > 60) {
      salida.removeChild(salida.lastChild);
    }
  }

  function normalizarCarrito(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const id = Number(item.id);
        if (!CATALOGO.some((p) => p.id === id)) return null;
        return { id, qty: App.clamp(item.qty || 1, 1, 99) };
      })
      .filter(Boolean);
  }

  function guardarCarrito() {
    App.store.set(KEYS.carrito, carrito);
  }

  function producto(id) {
    return CATALOGO.find((p) => p.id === Number(id));
  }

  function aliasActual() {
    return App.store.get(KEYS.alias, '') || 'Invitado';
  }

  function esAdmin() {
    try { return sessionStorage.getItem(KEYS.admin) === 'true'; } catch (e) { return false; }
  }

  function setAdmin(valor) {
    try {
      if (valor) sessionStorage.setItem(KEYS.admin, 'true');
      else sessionStorage.removeItem(KEYS.admin);
    } catch (e) { /* noop */ }
  }

  function detalleCarrito() {
    return carrito
      .map((line) => {
        const p = producto(line.id);
        return p ? { ...p, qty: line.qty, subtotal: p.precio * line.qty } : null;
      })
      .filter(Boolean);
  }

  function totales() {
    const detalle = detalleCarrito();
    return {
      items: detalle.reduce((sum, i) => sum + i.qty, 0),
      total: detalle.reduce((sum, i) => sum + i.subtotal, 0),
      detalle
    };
  }

  function leerLog(key) {
    const data = App.store.get(key, []);
    return Array.isArray(data) ? data : [];
  }

  function agregarLog(key, entrada) {
    const lista = leerLog(key);
    lista.unshift(entrada);
    App.store.set(key, lista.slice(0, MAX_LOG));
    if (esAdmin()) renderAdmin();
  }

  function logEvento(msg, tipo) {
    escribirConsolaViva((tipo || 'INFO').toUpperCase(), msg);
    agregarLog(KEYS.eventos, {
      t: Date.now(),
      tipo: tipo || 'info',
      alias: aliasActual(),
      msg: String(msg)
    });
  }

  function logVenta(venta) {
    agregarLog(KEYS.ventas, Object.assign({ t: Date.now(), alias: aliasActual() }, venta));
  }

  function renderAdmin() {
    const eventos = leerLog(KEYS.eventos);
    const ventas = leerLog(KEYS.ventas);

    const cajaEventos = $('#vetLogEventos');
    const cajaVentas = $('#vetLogVentas');
    if (!cajaEventos || !cajaVentas) return;

    cajaEventos.innerHTML = eventos.length
      ? eventos.map((e) => `
          <div class="log-entry ${esc(e.tipo || 'info')}">
            <span class="log-time">${esc(App.dateTime(e.t))}</span>
            <span class="log-type">${esc((e.tipo || 'info').toUpperCase())}</span>
            <strong>${esc(e.alias || 'Invitado')}:</strong> ${esc(e.msg)}
          </div>`).join('')
      : '<div class="log-empty">Sin eventos registrados todavía.</div>';

    cajaVentas.innerHTML = ventas.length
      ? ventas.map((v) => {
          const items = Array.isArray(v.items) ? v.items : [];
          const detalle = items.map((i) => `${i.qty}x ${esc(i.nombre)}`).join(' · ');
          return `
            <div class="log-entry ok">
              <span class="log-time">${esc(App.dateTime(v.t))}</span>
              <span class="log-type">VENTA</span>
              <strong>${esc(v.cliente || v.alias || 'Cliente')}</strong>
              ${v.mascota ? ' · 🐾 ' + esc(v.mascota) : ''}
              · ${esc(money(v.total || 0))}
              <div class="small muted">${detalle || 'Sin detalle'}</div>
            </div>`;
        }).join('')
      : '<div class="log-empty">Aún no hay cotizaciones confirmadas.</div>';

    const totalVentas = ventas.reduce((sum, v) => sum + (Number(v.total) || 0), 0);
    const itemsVendidos = ventas.reduce((sum, v) => sum + (Array.isArray(v.items)
      ? v.items.reduce((s, i) => s + (Number(i.qty) || 0), 0) : 0), 0);
    const ticket = ventas.length ? totalVentas / ventas.length : 0;

    $('#kpiVentas').textContent = money(totalVentas);
    $('#kpiEventos').textContent = String(eventos.length);
    $('#kpiItems').textContent = String(itemsVendidos);
    $('#kpiTicket').textContent = money(ticket);
  }

  function cumpleRangoPrecio(precio) {
    if (filtro.rango === 'economico') return precio <= 50;
    if (filtro.rango === 'medio') return precio > 50 && precio <= 120;
    if (filtro.rango === 'especializado') return precio > 120;
    return true;
  }

  function coincidencias() {
    const q = filtro.q.trim().toLowerCase();
    return CATALOGO.filter((p) => {
      const okCat = filtro.cat === 'todos' || p.categoria === filtro.cat;
      if (!okCat || !cumpleRangoPrecio(Number(p.precio) || 0)) return false;
      if (!q) return true;
      const texto = [p.nombre, p.detalle, p.nota, p.catLabel, p.categoria].join(' ').toLowerCase();
      return texto.includes(q);
    });
  }

  function conteos() {
    const q = filtro.q.trim().toLowerCase();
    const base = CATALOGO.filter((p) => {
      if (!cumpleRangoPrecio(Number(p.precio) || 0)) return false;
      if (!q) return true;
      return [p.nombre, p.detalle, p.nota, p.catLabel, p.categoria]
        .join(' ').toLowerCase().includes(q);
    });
    const map = { todos: base.length };
    CATS.forEach((c) => { map[c.id] = base.filter((p) => p.categoria === c.id).length; });
    return map;
  }

  function renderFiltros() {
    const host = $('#vetFiltros');
    if (!host) return;
    const counts = conteos();
    const chips = [];

    chips.push(`<button type="button" class="chip ${filtro.cat === 'todos' ? 'active' : ''}"
      data-cat="todos">🐾 Todos <span class="count">(${counts.todos})</span></button>`);

    CATS.forEach((cat) => {
      const n = counts[cat.id] || 0;
      if (n === 0 && filtro.cat !== cat.id) return;
      chips.push(`<button type="button" class="chip ${filtro.cat === cat.id ? 'active' : ''}"
        data-cat="${esc(cat.id)}">${esc(cat.emoji || '•')} ${esc(cat.label)}
        <span class="count">(${n})</span></button>`);
    });

    host.innerHTML = chips.join('');
  }

  function renderCatalogo() {
    const grid = $('#vetGrid');
    if (!grid) return;
    const lista = coincidencias();

    if (!lista.length) {
      grid.innerHTML = `
        <div class="empty vet-empty">
          <span class="empty-icon">🐾</span>
          <strong>No se encontraron resultados</strong>
          <span>Prueba con otra palabra o cambia de categoría.</span>
          <button type="button" class="btn btn-ghost btn-sm mt-1" data-reset-filtros>Ver todo el catálogo</button>
        </div>`;
    } else {
      grid.innerHTML = lista.map((p) => {
        const rutaImg = resolverImagen(p);
        const emoji = p.emoji || '🐾';
        return `
        <article class="vet-card" data-id="${p.id}" data-categoria="${esc(p.categoria)}" tabindex="0" aria-label="${esc(p.nombre)}">
          <div class="vet-card-media">
            <img src="${esc(rutaImg)}" alt="${esc(p.nombre)}" loading="lazy" width="320" height="200"
                 data-fallback-emoji="${esc(emoji)}">
            <button type="button" class="vet-zoom-btn" data-detail="${p.id}">🔍 Ficha</button>
          </div>
          <div class="vet-card-body">
            <span class="vet-card-cat">${esc(p.catLabel || p.categoria)}</span>
            <h3 class="vet-card-title">${esc(p.nombre)}</h3>
            <p class="vet-card-desc">${esc(p.detalle)}</p>
            <div class="vet-card-acordeon">
              <strong>Especificaciones:</strong> ${esc(p.nota || 'Atención profesional bajo supervisión del Dr. Jorge Castillo MVZ.')}
            </div>
            <div class="vet-card-foot">
              <span class="vet-price">${esc(money(p.precio))} <small>/ servicio</small></span>
              <div class="vet-card-actions">
                <button type="button" class="btn btn-ghost btn-sm" data-acordeon="${p.id}">ℹ️ Detalles</button>
                <button type="button" class="btn btn-accent btn-sm" data-add="${p.id}">+ Añadir</button>
              </div>
            </div>
          </div>
        </article>`;
      }).join('');

      $$('#vetGrid img').forEach((img) => {
        img.addEventListener('error', () => manejarErrorImagen(img, img.dataset.fallbackEmoji));
      });
    }

    const info = $('#vetResultInfo');
    if (info) {
      const cat = filtro.cat === 'todos'
        ? 'todas las categorías'
        : (CATS.find((c) => c.id === filtro.cat) || {}).label || filtro.cat;
      info.textContent = `Mostrando ${lista.length} de ${CATALOGO.length} resultados · ${cat}${filtro.q ? ` · búsqueda: “${filtro.q}”` : ''}`;
    }

    renderFiltros();
  }

  function renderCarrito() {
    const lista = $('#vetCartList');
    const { detalle, items, total } = totales();
    if (!lista) return;

    if (!detalle.length) {
      lista.innerHTML = `
        <li class="empty">
          <span class="empty-icon">🛒</span>
          <strong>Tu cotizador está vacío</strong>
          <span>Añade servicios desde el catálogo.</span>
        </li>`;
    } else {
      lista.innerHTML = detalle.map((p) => `
        <li class="vet-cart-item">
          <div>
            <strong>${esc(p.emoji || '🐾')} ${esc(p.nombre)}</strong>
            <small>${esc(p.catLabel || p.categoria)} · ${esc(money(p.precio))} c/u</small>
          </div>
          <div class="vet-qty" aria-label="Cantidad de ${esc(p.nombre)}">
            <button type="button" data-qty="${p.id}" data-step="-1" aria-label="Quitar uno">−</button>
            <span>${p.qty}</span>
            <button type="button" data-qty="${p.id}" data-step="1" aria-label="Añadir uno">+</button>
          </div>
          <span class="vet-item-total">${esc(money(p.subtotal))}</span>
        </li>`).join('');
    }

    $('#vetCartCount').textContent = String(items);
    $('#vetCartTotal').textContent = App.money(total);
    $('#vetCartSubtotal').textContent = money(total);
  }

  function agregar(id) {
    const p = producto(id);
    if (!p) return;
    const existente = carrito.find((i) => i.id === p.id);
    if (existente) existente.qty = App.clamp(existente.qty + 1, 1, 99);
    else carrito.push({ id: p.id, qty: 1 });
    guardarCarrito();
    renderCarrito();
    mostrarToastUI(`🐾 “${p.nombre}” añadido al cotizador (${money(p.precio)}).`, 'ok');
    logEvento(`Añadió “${p.nombre}” (${money(p.precio)}) al cotizador.`, 'ok');
  }

  function cambiarCantidad(id, paso) {
    const linea = carrito.find((i) => i.id === Number(id));
    if (!linea) return;
    linea.qty = App.clamp(linea.qty + Number(paso), 0, 99);
    if (linea.qty <= 0) {
      carrito = carrito.filter((i) => i.id !== Number(id));
      const p = producto(id);
      mostrarToastUI(`“${p ? p.nombre : 'Ítem'}” eliminado del cotizador.`, 'warn');
    }
    guardarCarrito();
    renderCarrito();
  }

  function vaciar() {
    if (!carrito.length) {
      mostrarToastUI('El cotizador ya está vacío.', 'warn');
      return;
    }
    carrito = [];
    guardarCarrito();
    renderCarrito();
    mostrarToastUI('Cotizador vaciado correctamente.', 'warn');
    logEvento('Vació el cotizador.', 'warn');
  }

  function datosPaciente() {
    return {
      mascota: ($('#vetPet').value || '').trim(),
      especie: $('#vetSpecies').value || '',
      cliente: ($('#vetOwner').value || '').trim() || aliasActual(),
      telefono: ($('#vetPhone').value || '').trim()
    };
  }

  function mensajeCotizacion() {
    const { detalle, total } = totales();
    const datos = datosPaciente();
    const lineas = detalle.map((p) => `• ${p.qty}x ${p.nombre} — ${money(p.subtotal)}`).join('\n');
    return [
      '🐾 *Cotización — Clínica Veterinaria Don Gato*',
      `Tutor: ${datos.cliente || 'No indicado'}`,
      datos.mascota ? `Mascota: ${datos.mascota}${datos.especie ? ` (${datos.especie})` : ''}` : '',
      datos.telefono ? `Celular: ${datos.telefono}` : '',
      '',
      '*Servicios y productos:*',
      lineas,
      '',
      `💰 *TOTAL ESTIMADO: ${money(total)}*`,
      '📍 Miraflores, Av. Pasoskanqui esq. Brasil #1627 · La Paz'
    ].filter(Boolean).join('\n');
  }

  /* ============================================================
     TEMPORIZADOR ASÍNCRONO DE 30 SEGUNDOS (setInterval + fadeOut)
     ============================================================ */
  function detenerTemporizadorResumen() {
    if (timerCotizacion) {
      clearInterval(timerCotizacion);
      timerCotizacion = null;
    }
  }

  function iniciarTemporizadorResumen() {
    detenerTemporizadorResumen();
    let segundos = 30;
    const reloj = $('#vetResumenTimer');
    if (reloj) reloj.textContent = '00:30s';

    timerCotizacion = setInterval(() => {
      segundos -= 1;
      if (reloj) {
        reloj.textContent = `00:${String(Math.max(0, segundos)).padStart(2, '0')}s`;
      }
      if (segundos <= 0) {
        detenerTemporizadorResumen();
        if (window.jQuery) {
          window.jQuery('#vetResumenModal').fadeOut(250, () => {
            App.closeModal('vetResumenModal');
            window.jQuery('#vetResumenModal').css('display', '');
          });
        } else {
          App.closeModal('vetResumenModal');
        }
        mostrarToastUI('⏳ Tarifa Flash Expirada (30s). Genera el resumen nuevamente.', 'warn');
        logEvento('Expiró el temporizador de 30s en el modal de resumen.', 'warn');
      }
    }, 1000);
  }

  /* ============================================================
     CONSTRUCCIÓN SEGURA DEL RESUMEN (ANTI-XSS CON textContent)
     ============================================================ */
  function construirResumenDOM(datos, detalle, total) {
    const cont = $('#vetResumenBody');
    cont.textContent = '';

    const wrap = document.createElement('div');
    wrap.className = 'stack';

    const ficha = document.createElement('div');
    ficha.className = 'card card-pad';
    ficha.style.boxShadow = 'none';
    ficha.style.background = 'var(--bg-panel)';

    const crearFila = (etiqueta, valor) => {
      const row = document.createElement('div');
      row.className = 'row-between';
      const lbl = document.createElement('span');
      lbl.className = 'muted small';
      lbl.textContent = etiqueta;
      const val = document.createElement('strong');
      val.textContent = valor;
      row.append(lbl, val);
      return row;
    };

    ficha.appendChild(crearFila('Tutor', datos.cliente || 'No indicado'));
    ficha.appendChild(crearFila('Mascota', `${datos.mascota || 'No indicada'}${datos.especie ? ` · ${datos.especie}` : ''}`));
    if (datos.telefono) {
      ficha.appendChild(crearFila('Celular', datos.telefono));
    }

    const listaItems = document.createElement('div');
    listaItems.className = 'stack';
    detalle.forEach((p) => {
      const row = document.createElement('div');
      row.className = 'row-between small';
      const nombre = document.createElement('span');
      nombre.textContent = `${p.qty}x ${p.nombre}`;
      const sub = document.createElement('strong');
      sub.textContent = money(p.subtotal);
      row.append(nombre, sub);
      listaItems.appendChild(row);
    });

    const totalRow = document.createElement('div');
    totalRow.className = 'vet-total-row';
    const totalLbl = document.createElement('span');
    totalLbl.textContent = 'Total estimado';
    const totalVal = document.createElement('strong');
    totalVal.textContent = money(total);
    totalRow.append(totalLbl, totalVal);

    const nota = document.createElement('p');
    nota.className = 'small muted';
    nota.textContent = `Referencia generada el ${App.dateTime()}. Los precios pueden variar según el tamaño y la condición del paciente.`;

    wrap.append(ficha, listaItems, totalRow, nota);
    cont.appendChild(wrap);
  }

  function confirmar() {
    const { detalle, items, total } = totales();
    if (!detalle.length) {
      mostrarToastUI('Añade al menos un servicio antes de confirmar.', 'warn');
      return;
    }

    const datos = datosPaciente();
    const celular = datos.telefono.replace(/[\s().-]/g, '');
    const formatoOk = !celular || /^\d{7,8}$/.test(celular);
    const datosOk = window.Validacion
      ? Validacion.validarCampos([$('#vetPet'), $('#vetOwner'), $('#vetPhone')]) && formatoOk
      : formatoOk;

    if (!datosOk) {
      const box = $('#vetPatientError');
      box.textContent = 'Revisa los datos marcados: usa nombres reales y un celular de 7 u 8 dígitos.';
      mostrarToastUI('Corrige los datos marcados en rojo.', 'warn');
      return;
    }
    $('#vetPatientError').textContent = '';

    ultimaCotizacion = {
      cliente: datos.cliente,
      mascota: datos.mascota,
      especie: datos.especie,
      telefono: datos.telefono,
      items: detalle.map((p) => ({ nombre: p.nombre, qty: p.qty, precio: p.precio, subtotal: p.subtotal })),
      total,
      cantidad: items
    };

    construirResumenDOM(datos, detalle, total);

    logVenta({
      cliente: datos.cliente || aliasActual(),
      mascota: datos.mascota,
      especie: datos.especie,
      telefono: datos.telefono,
      items: ultimaCotizacion.items,
      total
    });
    logEvento(`Generó resumen de cotización por ${money(total)} (${items} ítem/s).`, 'ok');

    App.openModal('vetResumenModal');
    iniciarTemporizadorResumen();
  }

  function enviarWhatsapp() {
    detenerTemporizadorResumen();
    const { detalle } = totales();
    if (!detalle.length) {
      mostrarToastUI('El cotizador está vacío.', 'warn');
      return;
    }
    const url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(mensajeCotizacion());
    window.open(url, '_blank', 'noopener');
    logEvento('Envió la cotización por WhatsApp.', 'info');
    mostrarToastUI('💬 Abriendo WhatsApp con tu cotización...', 'ok');
  }

  function abrirDetalle(id) {
    const p = producto(id);
    if (!p) return;
    detalleActual = p.id;
    $('#vetDetailCat').textContent = p.catLabel || p.categoria;
    $('#vetDetailName').textContent = p.nombre;
    $('#vetDetailDesc').textContent = p.detalle;
    $('#vetDetailNota').textContent = p.nota ? 'ℹ️ ' + p.nota : 'Atención personalizada en clínica.';
    $('#vetDetailPrice').textContent = money(p.precio);
    const img = $('#vetDetailImg');
    delete img.dataset.extTry;
    img.onerror = () => manejarErrorImagen(img, p.emoji || '🐾');
    img.src = resolverImagen(p);
    img.alt = p.nombre;
    App.openModal('vetDetailModal');
    logEvento(`Consultó la ficha de “${p.nombre}”.`, 'info');
  }

  function actualizarAliasUI() {
    const alias = aliasActual();
    $('#vetAliasDisplay').textContent = esAdmin() ? 'ADMIN' : alias;
    const input = $('#vetAliasInput');
    if (input && alias !== 'Invitado') input.value = alias;
    if (alias !== 'Invitado') {
      if (!$('#vetOwner').value) $('#vetOwner').value = alias;
      if (!$('#citaTutor').value) $('#citaTutor').value = alias;
    }
  }

  function guardarAlias(valor, desdeModal) {
    const alias = String(valor || '').trim().slice(0, 40);
    if (!alias) {
      mostrarToastUI('Escribe un alias válido.', 'warn');
      return;
    }
    App.store.set(KEYS.alias, alias);
    actualizarAliasUI();
    $('#vetAliasInput').value = alias;
    $('#vetOwner').value = alias;
    $('#citaTutor').value = alias;
    logEvento(`Guardó su alias como “${alias}”.`, 'ok');
    mostrarToastUI(`¡Bienvenido(a), ${alias}! 🐾`, 'ok');
    if (desdeModal) App.closeModal('vetCuentaModal');
  }

  function aplicarAdminUI() {
    const admin = esAdmin();
    document.body.classList.toggle('is-admin', admin);
    const btn = $('[data-open-modal="vetCuentaModal"]');
    if (btn) btn.textContent = admin ? '👑 Admin' : '👤 Mi cuenta';
    const logout = $('#vetAdminLogout');
    if (logout) logout.classList.toggle('hidden', !admin);
    const adminForm = $('#vetAdminForm');
    if (adminForm) adminForm.classList.toggle('hidden', admin);
    if (admin) {
      renderAdmin();
      mostrarToastUI('Modo administrador activo. Bitácoras desbloqueadas.', 'ok');
    }
  }

  function loginAdmin(event) {
    event.preventDefault();
    const user = ($('#vetAdminUser').value || '').trim().toLowerCase();
    const pass = ($('#vetAdminPass').value || '').trim();
    const error = $('#vetAdminError');
    const valido = (user === 'admin' && (pass === 'admin123' || pass === 'vet2026'))
      || (user === 'vet' && pass === 'vet2026');

    if (!valido) {
      error.textContent = 'Usuario o contraseña incorrectos. Usa admin / admin123.';
      $('#vetAdminUser').classList.add('invalid');
      $('#vetAdminPass').classList.add('invalid');
      logEvento(`Intento de acceso admin fallido (usuario “${user || 'vacío'}”).`, 'error');
      return;
    }

    error.textContent = '';
    $$('#vetAdminForm .input').forEach((i) => i.classList.remove('invalid'));
    setAdmin(true);
    aplicarAdminUI();
    App.closeModal('vetCuentaModal');
    $('#vetAdminForm').reset();
    logEvento('El administrador inició sesión.', 'ok');
  }

  function logoutAdmin() {
    setAdmin(false);
    document.body.classList.remove('is-admin');
    aplicarAdminUI();
    App.closeModal('vetCuentaModal');
    mostrarToastUI('Sesión de administrador cerrada.', 'warn');
    logEvento('El administrador cerró sesión.', 'info');
  }

  function solicitarCita(event) {
    event.preventDefault();
    const tutor = ($('#citaTutor').value || '').trim();
    const mascota = ($('#citaMascota').value || '').trim();
    const celular = ($('#citaCelular').value || '').trim();
    const fecha = $('#citaFecha').value;
    const servicio = $('#citaServicio').value;
    const notas = ($('#citaNotas').value || '').trim();
    const error = $('#vetCitaError');
    const alertaBox = $('#alertaCitaBox');

    const invalidos = [];
    if (!tutor) invalidos.push(['citaTutor', 'el nombre del tutor']);
    if (!mascota) invalidos.push(['citaMascota', 'el nombre de la mascota']);
    if (!/^\d{8}$/.test(celular)) invalidos.push(['citaCelular', 'un celular de 8 dígitos']);
    if (!fecha) invalidos.push(['citaFecha', 'una fecha']);

    $$('#vetCitaForm .input').forEach((i) => i.classList.remove('invalid'));
    if (invalidos.length) {
      invalidos.forEach(([id]) => { const el = $('#' + id); if (el) el.classList.add('invalid'); });
      const textoErr = 'Revisa ' + invalidos.map(([, label]) => label).join(', ') + '.';
      error.textContent = textoErr;
      if (alertaBox) {
        alertaBox.textContent = '';
        const spanErr = document.createElement('span');
        spanErr.className = 'msg-error';
        spanErr.textContent = '⚠ ' + textoErr;
        alertaBox.appendChild(spanErr);
      }
      mostrarToastUI('Completa los campos obligatorios de la cita.', 'warn');
      return;
    }
    error.textContent = '';

    const mensaje = [
      '📅 *Solicitud de cita — Don Gato*',
      `Tutor: ${tutor}`,
      `Mascota: ${mascota}`,
      `Celular: ${celular}`,
      `Servicio: ${servicio}`,
      `Fecha preferida: ${fecha}`,
      notas ? `Notas: ${notas}` : ''
    ].filter(Boolean).join('\n');

    logEvento(`Solicitó cita para ${mascota} (${servicio}) el ${fecha}.`, 'ok');
    mostrarToastUI('📅 Cita registrada en Supabase y lista para WhatsApp.', 'ok');

    if (alertaBox) {
      alertaBox.textContent = '';
      const spanOk = document.createElement('span');
      spanOk.className = 'msg-exito';
      spanOk.textContent = `✓ Cita para ${mascota} (${fecha}) registrada correctamente.`;
      alertaBox.appendChild(spanOk);
    }

    if (window.SupabaseDW2) {
      window.SupabaseDW2.guardar('citas_veterinaria', {
        tutor: tutor,
        mascota: mascota,
        celular: celular,
        servicio: servicio || null,
        fecha: fecha,
        notas: notas || null
      });
    }

    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(mensaje), '_blank', 'noopener');

    $('#citaMascota').value = '';
    $('#citaCelular').value = '';
    $('#citaNotas').value = '';
  }

  function actualizarEstadoRed() {
    const badge = $('#estadoRed');
    if (badge) {
      const online = navigator.onLine;
      badge.textContent = online ? 'En Línea' : 'Modo Offline Activo';
      badge.classList.toggle('is-offline', !online);
    }
    if (navigator.onLine && window.SupabaseDW2 && typeof window.SupabaseDW2.sincronizar === 'function') {
      window.SupabaseDW2.sincronizar().catch(() => {});
    }
  }

  function configurarInstalacionPWA() {
    let promptInstalacion = null;
    const btnInstalar = $('#btnInstalarPWA');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      promptInstalacion = e;
      if (btnInstalar) btnInstalar.hidden = false;
    });
    if (btnInstalar) {
      btnInstalar.addEventListener('click', async () => {
        if (!promptInstalacion) return;
        promptInstalacion.prompt();
        await promptInstalacion.userChoice;
        promptInstalacion = null;
        btnInstalar.hidden = true;
      });
    }
  }

  /* ============================================================
     DELEGACIÓN DE EVENTOS CON jQuery (.off().on()) Y DOM
     ============================================================ */
  function enlazarEventos() {
    if (window.jQuery) {
      const $doc = window.jQuery(document);

      // 1. Menú hamburguesa con .slideToggle()
      $doc.off('click.vetNav', '#burguerBtn').on('click.vetNav', '#burguerBtn', function () {
        const $menu = window.jQuery('#vetMobileNav');
        $menu.stop(true, true).slideToggle(240, function () {
          const visible = $menu.is(':visible');
          window.jQuery('#burguerBtn').attr('aria-expanded', String(visible));
        });
      });

      // 2. Búsqueda en tiempo real por teclado (keyup)
      $doc.off('keyup.vetSearch search.vetSearch', '#vetBusqueda').on('keyup.vetSearch search.vetSearch', '#vetBusqueda', function () {
        filtro.q = window.jQuery(this).val() || '';
        renderCatalogo();
      });

      // 3. Filtro en cascada (Área -> Rango de precio)
      $doc.off('change.vetCascade1', '#vetCascadeArea').on('change.vetCascade1', '#vetCascadeArea', function () {
        const area = window.jQuery(this).val();
        filtro.cat = area;
        filtro.rango = 'todos';
        const $sub = window.jQuery('#vetCascadeSub');
        if (area === 'todos') {
          $sub.html('<option value="todos">-- Primero elige un área --</option>').prop('disabled', true);
        } else {
          $sub.prop('disabled', false).html([
            '<option value="todos">Todos los precios</option>',
            '<option value="economico">Hasta 50 BOB</option>',
            '<option value="medio">De 51 a 120 BOB</option>',
            '<option value="especializado">Más de 120 BOB</option>'
          ].join(''));
        }
        renderCatalogo();
        logEvento(`Seleccionó área en cascada: “${area}”.`, 'info');
      });

      $doc.off('change.vetCascade2', '#vetCascadeSub').on('change.vetCascade2', '#vetCascadeSub', function () {
        filtro.rango = window.jQuery(this).val() || 'todos';
        renderCatalogo();
        logEvento(`Aplicó subfiltro de precio: “${filtro.rango}”.`, 'info');
      });

      // 4. Delegación por Event Bubbling en tarjetas del catálogo
      $doc.off('click.vetCat', '#vetFiltros [data-cat]').on('click.vetCat', '#vetFiltros [data-cat]', function () {
        filtro.cat = window.jQuery(this).data('cat');
        window.jQuery('#vetCascadeArea').val(filtro.cat);
        renderCatalogo();
        logEvento(`Filtró el catálogo por “${filtro.cat}”.`, 'info');
      });

      $doc.off('click.vetAcordeon', '#vetGrid [data-acordeon]').on('click.vetAcordeon', '#vetGrid [data-acordeon]', function (e) {
        e.stopPropagation();
        const $card = window.jQuery(this).closest('.vet-card');
        $card.find('.vet-card-acordeon').stop(true, true).slideToggle('slow');
        const id = window.jQuery(this).data('acordeon');
        const p = producto(id);
        if (p) logEvento(`Desplegó especificaciones de “${p.nombre}”.`, 'info');
      });

      $doc.off('click.vetAdd', '#vetGrid [data-add]').on('click.vetAdd', '#vetGrid [data-add]', function (e) {
        e.stopPropagation();
        agregar(window.jQuery(this).data('add'));
      });

      $doc.off('click.vetDetail', '#vetGrid [data-detail]').on('click.vetDetail', '#vetGrid [data-detail]', function (e) {
        e.stopPropagation();
        abrirDetalle(window.jQuery(this).data('detail'));
      });

      $doc.off('click.vetReset', '#vetGrid [data-reset-filtros]').on('click.vetReset', '#vetGrid [data-reset-filtros]', function () {
        filtro = { cat: 'todos', rango: 'todos', q: '' };
        window.jQuery('#vetBusqueda').val('');
        window.jQuery('#vetCascadeArea').val('todos');
        window.jQuery('#vetCascadeSub').html('<option value="todos">-- Primero elige un área --</option>').prop('disabled', true);
        renderCatalogo();
      });

      $doc.off('click.vetCard', '#vetGrid .vet-card').on('click.vetCard', '#vetGrid .vet-card', function (e) {
        if (window.jQuery(e.target).closest('button').length) return;
        abrirDetalle(window.jQuery(this).data('id'));
      });

      // 5. Calculador rápido con .animate()
      $doc.off('input.vetCalc', '#vetCalcSesiones').on('input.vetCalc', '#vetCalcSesiones', function () {
        const cant = Math.max(1, Math.min(20, Number(window.jQuery(this).val()) || 1));
        const monto = cant * 30;
        window.jQuery('#vetCalcTotalRapido')
          .text(monto + ' BOB')
          .stop(true, true)
          .animate({ opacity: 0.45 }, 110)
          .animate({ opacity: 1 }, 180);
      });

      // 6. Controles del carrito y confirmación del modal
      $doc.off('click.vetQty', '#vetCartList [data-qty]').on('click.vetQty', '#vetCartList [data-qty]', function () {
        cambiarCantidad(window.jQuery(this).data('qty'), window.jQuery(this).data('step'));
      });

      $doc.off('click.vetConfirmModal', '#vetResumenConfirmar').on('click.vetConfirmModal', '#vetResumenConfirmar', function () {
        detenerTemporizadorResumen();
        App.closeModal('vetResumenModal');
        mostrarToastUI('✅ Reserva de cotización confirmada con éxito.', 'ok');
        logEvento('Confirmó la reserva dentro del tiempo límite de 30s.', 'ok');
      });
    }

    $('#vetGrid').addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('.vet-card');
      if (card) { event.preventDefault(); abrirDetalle(card.dataset.id); }
    });

    $('#vetCartClear').addEventListener('click', vaciar);
    $('#vetConfirm').addEventListener('click', confirmar);
    $('#vetWhatsapp').addEventListener('click', enviarWhatsapp);
    $('#vetResumenWa').addEventListener('click', enviarWhatsapp);

    $('#vetDetailAdd').addEventListener('click', () => {
      if (detalleActual != null) agregar(detalleActual);
      App.closeModal('vetDetailModal');
    });

    $('#vetAliasForm').addEventListener('submit', (event) => {
      event.preventDefault();
      guardarAlias($('#vetAliasInput').value, false);
    });

    $('#vetClientForm').addEventListener('submit', (event) => {
      event.preventDefault();
      guardarAlias($('#vetClientAlias').value, true);
    });

    $('#vetAdminForm').addEventListener('submit', loginAdmin);
    $('#vetAdminLogout').addEventListener('click', logoutAdmin);
    $('#vetCitaForm').addEventListener('submit', solicitarCita);

    $('#btnLimpiarLiveLog').addEventListener('click', () => {
      const salida = $('#logOutput');
      if (salida) salida.innerHTML = '<div>[Sistema] Consola limpia. Esperando nuevas interacciones...</div>';
    });

    $('#vetRefreshLogs').addEventListener('click', () => {
      renderAdmin();
      mostrarToastUI('Bitácoras actualizadas.', 'ok');
    });

    $('#vetClearLogs').addEventListener('click', () => {
      if (!esAdmin()) return;
      if (!window.confirm('¿Limpiar todas las bitácoras de eventos y ventas?')) return;
      App.store.remove(KEYS.eventos);
      App.store.remove(KEYS.ventas);
      renderAdmin();
      mostrarToastUI('Bitácoras liberadas correctamente.', 'warn');
    });

    document.addEventListener('click', (event) => {
      if (event.target.closest('[data-close-modal]') || event.target.id === 'vetResumenModal') {
        detenerTemporizadorResumen();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        detenerTemporizadorResumen();
        App.closeAllModals();
      }
    });
  }

  function observadorSecciones() {
    if (!('IntersectionObserver' in window)) return;
    const links = $$('.vet-links a');
    const secciones = ['inicio', 'catalogo', 'cotizador', 'citas', 'auditoria']
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    secciones.forEach((s) => observer.observe(s));
  }

  function desdeJson(p) {
    const cat = CATS.find((c) => c.id === p.categoria);
    const base = {
      id: Number(p.id),
      nombre: String(p.nombre || '').trim(),
      categoria: String(p.categoria || ''),
      catLabel: p.catLabel || (cat ? cat.label : ''),
      detalle: p.detalle || '',
      precio: Number(p.precio) || 0,
      emoji: p.emoji || (cat ? cat.emoji : '🐾'),
      img: p.img || '',
      nota: p.nota || ''
    };
    base.img = resolverImagen(base);
    return base;
  }

  function syncCatalogoFromJson() {
    if (typeof App.fetchCatalog !== 'function') return;

    App.fetchCatalog('data/catalogo.json').then((lista) => {
      if (!lista) return;

      const limpio = lista.map(desdeJson).filter((p) => p.id && p.nombre);
      if (!limpio.length) return;

      CATALOGO.length = 0;
      limpio.forEach((p) => CATALOGO.push(p));

      const stat = $('#vetStatServicios');
      if (stat) stat.textContent = String(CATALOGO.length);
      renderCatalogo();
    });
  }

  function hidratarInterfaz() {
    if (document.body.dataset.hidratado === 'true') return;
    document.body.dataset.hidratado = 'true';

    CATALOGO.forEach((p) => { p.img = resolverImagen(p); });

    $$('img[data-fallback-emoji]').forEach((img) => {
      img.addEventListener('error', () => manejarErrorImagen(img, img.dataset.fallbackEmoji));
    });

    $('#vetStatServicios').textContent = String(CATALOGO.length);
    $('#citaFecha').min = new Date().toISOString().slice(0, 10);
    const alias = aliasActual();
    if (alias !== 'Invitado') {
      $('#vetAliasInput').value = alias;
      $('#vetClientAlias').value = alias;
      $('#vetOwner').value = alias;
      $('#citaTutor').value = alias;
    }
    actualizarAliasUI();

    document.body.classList.toggle('is-admin', esAdmin());
    aplicarAdminUI();
    renderCatalogo();
    renderCarrito();
    syncCatalogoFromJson();

    if (!leerLog(KEYS.eventos).length) {
      logEvento(`Sistema hidratado con ${CATALOGO.length} servicios cargados.`, 'ok');
    } else {
      escribirConsolaViva('OK', `Interfaz hidratada (${CATALOGO.length} servicios activos).`);
    }

    actualizarEstadoRed();
    window.addEventListener('online', actualizarEstadoRed);
    window.addEventListener('offline', actualizarEstadoRed);
    configurarInstalacionPWA();

    enlazarEventos();
    observadorSecciones();
    App.registerSW('sw.js');
    mostrarToastUI('🐾 Catálogo Don Gato hidratado y listo.', 'ok');
  }

  App.ready(() => {
    if (!CATALOGO.length) {
      mostrarToastUI('No se pudo cargar el catálogo veterinario.', 'warn');
      return;
    }
    hidratarInterfaz();
  });
})();