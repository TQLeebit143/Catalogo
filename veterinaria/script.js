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

  let filtro = { cat: 'todos', q: '' };
  let carrito = normalizarCarrito(App.store.get(KEYS.carrito, []));
  let detalleActual = null;
  let ultimaCotizacion = null;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (v) => App.escape(v);
  const money = (n) => App.money(n) + ' BOB';

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

  function coincidencias() {
    const q = filtro.q.trim().toLowerCase();
    return CATALOGO.filter((p) => {
      const okCat = filtro.cat === 'todos' || p.categoria === filtro.cat;
      if (!okCat) return false;
      if (!q) return true;
      const texto = [p.nombre, p.detalle, p.nota, p.catLabel, p.categoria].join(' ').toLowerCase();
      return texto.includes(q);
    });
  }

  function conteos() {
    const q = filtro.q.trim().toLowerCase();
    const base = CATALOGO.filter((p) => {
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
      grid.innerHTML = lista.map((p) => `
        <article class="vet-card" data-id="${p.id}" tabindex="0" aria-label="${esc(p.nombre)}">
          <div class="vet-card-media">
            <img src="${esc(p.img)}" alt="${esc(p.nombre)}" loading="lazy"
                 onerror="App.imgFallback(this,'${esc(p.emoji || '🐾')}')">
            <button type="button" class="vet-zoom-btn" data-detail="${p.id}">🔍 Zoom</button>
          </div>
          <div class="vet-card-body">
            <span class="vet-card-cat">${esc(p.catLabel || p.categoria)}</span>
            <h3 class="vet-card-title">${esc(p.nombre)}</h3>
            <p class="vet-card-desc">${esc(p.detalle)}</p>
            ${p.nota ? `<p class="vet-card-note">ℹ️ ${esc(p.nota)}</p>` : ''}
            <div class="vet-card-foot">
              <span class="vet-price">${esc(money(p.precio))} <small>/ servicio</small></span>
              <div class="vet-card-actions">
                <button type="button" class="btn btn-accent btn-sm" data-add="${p.id}">+ Añadir</button>
              </div>
            </div>
          </div>
        </article>`).join('');
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
    App.toast(`“${p.nombre}” añadido al cotizador.`, 'ok', 'Añadido');
    logEvento(`Añadió “${p.nombre}” (${money(p.precio)}).`, 'ok');
  }

  function cambiarCantidad(id, paso) {
    const linea = carrito.find((i) => i.id === Number(id));
    if (!linea) return;
    linea.qty = App.clamp(linea.qty + Number(paso), 0, 99);
    if (linea.qty <= 0) {
      carrito = carrito.filter((i) => i.id !== Number(id));
      const p = producto(id);
      App.toast(`“${p ? p.nombre : 'Ítem'}” eliminado.`, 'warn', 'Carrito');
    }
    guardarCarrito();
    renderCarrito();
  }

  function vaciar() {
    if (!carrito.length) {
      App.toast('El cotizador ya está vacío.', 'info');
      return;
    }
    carrito = [];
    guardarCarrito();
    renderCarrito();
    App.toast('Cotizador vaciado correctamente.', 'warn', 'Carrito');
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

  function confirmar() {
    const { detalle, items, total } = totales();
    if (!detalle.length) {
      App.toast('Añade al menos un servicio antes de confirmar.', 'warn');
      return;
    }

    const datos = datosPaciente();
    const errores = [];
    if (datos.telefono && !/^\d{7,8}$/.test(datos.telefono.replace(/\s|-/g, ''))) errores.push('un celular válido');

    if (errores.length) {
      const box = $('#vetPatientError');
      box.textContent = 'Revisa ' + errores.join(' y ') + '.';
      App.toast('El celular debe tener 7 u 8 dígitos.', 'warn', 'Datos incompletos');
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

    const filas = detalle.map((p) => `
      <div class="row-between small">
        <span>${esc(p.qty)}x ${esc(p.nombre)}</span>
        <strong>${esc(money(p.subtotal))}</strong>
      </div>`).join('');

    $('#vetResumenBody').innerHTML = `
      <div class="stack">
        <div class="card card-pad" style="box-shadow:none;background:var(--bg-panel)">
          <div class="row-between"><span class="muted small">Tutor</span><strong>${esc(datos.cliente || 'No indicado')}</strong></div>
          <div class="row-between"><span class="muted small">Mascota</span><strong>${esc(datos.mascota || 'No indicada')}${datos.especie ? ` · ${esc(datos.especie)}` : ''}</strong></div>
          ${datos.telefono ? `<div class="row-between"><span class="muted small">Celular</span><strong>${esc(datos.telefono)}</strong></div>` : ''}
        </div>
        <div class="stack">${filas}</div>
        <div class="vet-total-row"><span>Total estimado</span><strong>${esc(money(total))}</strong></div>
        <p class="small muted">Referencia generada el ${esc(App.dateTime())}. Los precios pueden variar según el tamaño y la condición del paciente.</p>
      </div>`;

    logVenta({
      cliente: datos.cliente || aliasActual(),
      mascota: datos.mascota,
      especie: datos.especie,
      telefono: datos.telefono,
      items: ultimaCotizacion.items,
      total
    });
    logEvento(`Confirmó una cotización de ${money(total)} (${items} ítem/s).`, 'ok');

    App.openModal('vetResumenModal');
    App.toast('Cotización generada. Puedes enviarla por WhatsApp.', 'ok', 'Resumen listo');
  }

  function enviarWhatsapp() {
    const { detalle } = totales();
    if (!detalle.length) {
      App.toast('El cotizador está vacío.', 'warn');
      return;
    }
    const url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(mensajeCotizacion());
    window.open(url, '_blank', 'noopener');
    logEvento('Envió la cotización por WhatsApp.', 'info');
    App.toast('Abriendo WhatsApp con tu cotización…', 'info');
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
    img.onerror = () => App.imgFallback(img, p.emoji || '🐾');
    img.src = p.img;
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
      App.toast('Escribe un alias válido.', 'warn');
      return;
    }
    App.store.set(KEYS.alias, alias);
    actualizarAliasUI();
    $('#vetAliasInput').value = alias;
    $('#vetOwner').value = alias;
    $('#citaTutor').value = alias;
    logEvento(`Guardó su alias como “${alias}”.`, 'ok');
    App.toast(`¡Bienvenido(a), ${alias}! 🐾`, 'ok', 'Alias guardado');
    if (desdeModal) App.closeModal('vetCuentaModal');
  }

  function aplicarAdminUI() {
    const admin = esAdmin();
    document.body.classList.toggle('is-admin', admin);
    const btn = $('[data-open-modal="vetCuentaModal"]');
    if (btn) btn.innerHTML = admin ? '👑 Admin' : '👤 Mi cuenta';
    const logout = $('#vetAdminLogout');
    if (logout) logout.classList.toggle('hidden', !admin);
    const adminForm = $('#vetAdminForm');
    if (adminForm) adminForm.classList.toggle('hidden', admin);
    if (admin) {
      renderAdmin();
      App.toast('Modo administrador activo. Bitácoras desbloqueadas.', 'ok', 'Sesión admin');
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
    App.toast('Sesión de administrador cerrada.', 'info');
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

    const invalidos = [];
    if (!tutor) invalidos.push(['citaTutor', 'el nombre del tutor']);
    if (!mascota) invalidos.push(['citaMascota', 'el nombre de la mascota']);
    if (!/^\d{8}$/.test(celular)) invalidos.push(['citaCelular', 'un celular de 8 dígitos']);
    if (!fecha) invalidos.push(['citaFecha', 'una fecha']);

    $$('#vetCitaForm .input').forEach((i) => i.classList.remove('invalid'));
    if (invalidos.length) {
      invalidos.forEach(([id]) => { const el = $('#' + id); if (el) el.classList.add('invalid'); });
      error.textContent = 'Revisa ' + invalidos.map(([, label]) => label).join(', ') + '.';
      App.toast('Completa los campos obligatorios de la cita.', 'warn');
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
    App.toast('Solicitud registrada. Abriendo WhatsApp…', 'ok', 'Cita');
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(mensaje), '_blank', 'noopener');

    $('#citaMascota').value = '';
    $('#citaCelular').value = '';
    $('#citaNotas').value = '';
  }

  function enlazarEventos() {
    $('#vetBusqueda').addEventListener('input', (event) => {
      filtro.q = event.target.value;
      renderCatalogo();
    });

    $('#vetFiltros').addEventListener('click', (event) => {
      const chip = event.target.closest('[data-cat]');
      if (!chip) return;
      filtro.cat = chip.dataset.cat;
      renderCatalogo();
      logEvento(`Filtró el catálogo por “${filtro.cat}”.`, 'info');
    });

    $('#vetGrid').addEventListener('click', (event) => {
      const add = event.target.closest('[data-add]');
      if (add) { event.stopPropagation(); agregar(add.dataset.add); return; }
      const detail = event.target.closest('[data-detail]');
      if (detail) { event.stopPropagation(); abrirDetalle(detail.dataset.detail); return; }
      const reset = event.target.closest('[data-reset-filtros]');
      if (reset) {
        filtro = { cat: 'todos', q: '' };
        $('#vetBusqueda').value = '';
        renderCatalogo();
        return;
      }
      const card = event.target.closest('.vet-card');
      if (card) abrirDetalle(card.dataset.id);
    });

    $('#vetGrid').addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('.vet-card');
      if (card) { event.preventDefault(); abrirDetalle(card.dataset.id); }
    });

    $('#vetCartList').addEventListener('click', (event) => {
      const btn = event.target.closest('[data-qty]');
      if (btn) cambiarCantidad(btn.dataset.qty, btn.dataset.step);
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

    $('#vetRefreshLogs').addEventListener('click', () => {
      renderAdmin();
      App.toast('Bitácoras actualizadas.', 'info');
    });

    $('#vetClearLogs').addEventListener('click', () => {
      if (!esAdmin()) return;
      if (!window.confirm('¿Limpiar todas las bitácoras de eventos y ventas?')) return;
      App.store.remove(KEYS.eventos);
      App.store.remove(KEYS.ventas);
      renderAdmin();
      App.toast('Bitácoras liberadas correctamente.', 'warn');
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') App.closeAllModals();
    });
  }

  function observadorSecciones() {
    if (!('IntersectionObserver' in window)) return;
    const links = $$('.vet-links a');
    const secciones = ['inicio', 'catalogo', 'cotizador', 'citas', 'bitacora']
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

  App.ready(() => {
    if (!CATALOGO.length) {
      App.toast('No se pudo cargar el catálogo veterinario.', 'error');
      return;
    }

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

    if (!leerLog(KEYS.eventos).length) {
      logEvento(`Sistema iniciado con ${CATALOGO.length} servicios cargados.`, 'ok');
    }

    enlazarEventos();
    observadorSecciones();
    App.registerSW('sw.js');
    App.toast('Catálogo Don Gato listo. 🐾', 'ok', 'Bienvenido');
  });
})();
