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
    carrito: 'dongato_cart_pwa_v2',
    alias: 'dongato_alias',
    eventos: 'dongato_logs_eventos_v2',
    ventas: 'dongato_logs_ventas_v2',
    admin: 'dongato_admin_auth'
  };

  const WA_NUMBER = '59167301341';
  const MAX_LOG = 250;

  let filtro = { cat: 'todos', q: '' };
  let carrito = normalizar(App.store.get(KEYS.carrito, []));
  let detalleActual = null;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (v) => App.escape(v);
  const money = (n) => App.money(n) + ' BOB';

  function normalizar(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.map((i) => {
      const id = Number(i && i.id);
      if (!CATALOGO.some((p) => p.id === id)) return null;
      return { id, qty: App.clamp((i && i.qty) || 1, 1, 99) };
    }).filter(Boolean);
  }

  function guardar() { App.store.set(KEYS.carrito, carrito); }
  function producto(id) { return CATALOGO.find((p) => p.id === Number(id)); }
  function alias() { return App.store.get(KEYS.alias, '') || 'Invitado'; }
  function esAdmin() { try { return sessionStorage.getItem(KEYS.admin) === 'true'; } catch (e) { return false; } }
  function setAdmin(v) {
    try { v ? sessionStorage.setItem(KEYS.admin, 'true') : sessionStorage.removeItem(KEYS.admin); } catch (e) { /* noop */ }
  }

  function totales() {
    const detalle = carrito.map((line) => {
      const p = producto(line.id);
      return p ? { ...p, qty: line.qty, subtotal: p.precio * line.qty } : null;
    }).filter(Boolean);
    return {
      detalle,
      items: detalle.reduce((s, i) => s + i.qty, 0),
      total: detalle.reduce((s, i) => s + i.subtotal, 0)
    };
  }

  function leerLog(key) {
    const data = App.store.get(key, []);
    return Array.isArray(data) ? data : [];
  }

  function pushLog(key, entry) {
    const list = leerLog(key);
    list.unshift(entry);
    App.store.set(key, list.slice(0, MAX_LOG));
    if (esAdmin()) renderAdmin();
  }

  function logEvento(msg, tipo) {
    pushLog(KEYS.eventos, { t: Date.now(), tipo: tipo || 'info', alias: alias(), msg: String(msg) });
  }

  function logVenta(v) {
    pushLog(KEYS.ventas, Object.assign({ t: Date.now(), alias: alias() }, v));
  }

  function renderAdmin() {
    const eventos = leerLog(KEYS.eventos);
    const ventas = leerLog(KEYS.ventas);
    const cajaEv = $('#pwaLogEventos');
    const cajaVe = $('#pwaLogVentas');
    if (!cajaEv || !cajaVe) return;

    cajaEv.innerHTML = eventos.length
      ? eventos.map((e) => `<div class="log-entry ${esc(e.tipo || 'info')}">
          <span class="log-time">${esc(App.dateTime(e.t))}</span>
          <span class="log-type">${esc((e.tipo || 'info').toUpperCase())}</span>
          <strong>${esc(e.alias || 'Invitado')}:</strong> ${esc(e.msg)}
        </div>`).join('')
      : '<div class="log-empty">Sin eventos registrados.</div>';

    cajaVe.innerHTML = ventas.length
      ? ventas.map((v) => `<div class="log-entry ok">
          <span class="log-time">${esc(App.dateTime(v.t))}</span>
          <span class="log-type">VENTA</span>
          <strong>${esc(v.cliente || v.alias || 'Cliente')}</strong>
          ${v.mascota ? ' · 🐾 ' + esc(v.mascota) : ''} · ${esc(money(v.total || 0))}
          <div class="small muted">${(v.items || []).map((i) => `${i.qty}x ${esc(i.nombre)}`).join(' · ') || 'Sin detalle'}</div>
        </div>`).join('')
      : '<div class="log-empty">Sin cotizaciones confirmadas.</div>';

    const totalVentas = ventas.reduce((s, v) => s + (Number(v.total) || 0), 0);
    const items = ventas.reduce((s, v) => s + (v.items || []).reduce((a, i) => a + (Number(i.qty) || 0), 0), 0);
    $('#pwaKpiVentas').textContent = money(totalVentas);
    $('#pwaKpiEventos').textContent = String(eventos.length);
    $('#pwaKpiItems').textContent = String(items);
  }

  function mostrarVista(id) {
    if (id === 'pwa-bitacora' && !esAdmin()) return;
    $$('.view').forEach((view) => view.classList.toggle('active', view.id === id));
    $$('.dock-item').forEach((btn) => btn.classList.toggle('active', btn.dataset.viewGo === id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id === 'pwa-bitacora') renderAdmin();
  }

  function coincidencias() {
    const q = filtro.q.trim().toLowerCase();
    return CATALOGO.filter((p) => {
      if (filtro.cat !== 'todos' && p.categoria !== filtro.cat) return false;
      if (!q) return true;
      return [p.nombre, p.detalle, p.nota, p.catLabel, p.categoria].join(' ').toLowerCase().includes(q);
    });
  }

  function conteos() {
    const q = filtro.q.trim().toLowerCase();
    const base = CATALOGO.filter((p) => !q || [p.nombre, p.detalle, p.nota, p.catLabel, p.categoria]
      .join(' ').toLowerCase().includes(q));
    const counts = { todos: base.length };
    CATS.forEach((c) => { counts[c.id] = base.filter((p) => p.categoria === c.id).length; });
    return counts;
  }

  function renderFiltros() {
    const host = $('#pwaFiltros');
    if (!host) return;
    const counts = conteos();
    const html = [`<button type="button" class="chip ${filtro.cat === 'todos' ? 'active' : ''}" data-cat="todos">🐾 Todos <span class="count">(${counts.todos})</span></button>`];
    CATS.forEach((c) => {
      const n = counts[c.id] || 0;
      if (n === 0 && filtro.cat !== c.id) return;
      html.push(`<button type="button" class="chip ${filtro.cat === c.id ? 'active' : ''}" data-cat="${esc(c.id)}">${esc(c.emoji)} ${esc(c.label)} <span class="count">(${n})</span></button>`);
    });
    host.innerHTML = html.join('');
  }

  function renderCatalogo() {
    const grid = $('#pwaGrid');
    if (!grid) return;
    const lista = coincidencias();

    grid.innerHTML = lista.length
      ? lista.map((p) => `<article class="pwa-item">
          <div class="pwa-item-media">
            <img src="${esc(p.img)}" alt="${esc(p.nombre)}" loading="lazy"
                 onerror="App.imgFallback(this,'${esc(p.emoji || '🐾')}')">
            <button type="button" class="pwa-zoom" data-detail="${p.id}">🔍 Ver</button>
          </div>
          <div class="pwa-item-body">
            <span class="pwa-item-cat">${esc(p.catLabel || p.categoria)}</span>
            <h3 class="pwa-item-title">${esc(p.nombre)}</h3>
            <p class="pwa-item-desc">${esc(p.detalle)}</p>
            <div class="pwa-item-foot">
              <span class="pwa-price">${esc(money(p.precio))}</span>
              <button type="button" class="pwa-add" data-add="${p.id}">+ Añadir</button>
            </div>
          </div>
        </article>`).join('')
      : `<div class="empty" style="grid-column:1/-1">
          <span class="empty-icon">🐾</span>
          <strong>Sin resultados</strong>
          <span>Prueba otra búsqueda o categoría.</span>
        </div>`;

    const info = $('#pwaResultInfo');
    if (info) info.textContent = `${lista.length} de ${CATALOGO.length} resultados${filtro.q ? ` · “${filtro.q}”` : ''}`;
    renderFiltros();
  }

  function renderDestacados() {
    const host = $('#pwaDestacados');
    if (!host) return;
    const ids = [1, 6, 13, 17];
    const items = ids.map(producto).filter(Boolean);
    host.innerHTML = items.map((p) => `<button type="button" class="pwa-mini" data-detail="${p.id}">
      <img src="${esc(p.img)}" alt="${esc(p.nombre)}" loading="lazy"
           onerror="App.imgFallback(this,'${esc(p.emoji || '🐾')}')">
      <div><strong>${esc(p.nombre)}</strong><span>${esc(money(p.precio))}</span></div>
    </button>`).join('');
  }

  function renderCarrito() {
    const lista = $('#pwaCartList');
    if (!lista) return;
    const { detalle, total } = totales();

    lista.innerHTML = detalle.length
      ? detalle.map((p) => `<li class="pwa-cart-item">
          <div><strong>${esc(p.emoji || '🐾')} ${esc(p.nombre)}</strong>
          <small>${esc(money(p.precio))} c/u · subtotal ${esc(money(p.subtotal))}</small></div>
          <div class="pwa-cart-controls">
            <button type="button" data-qty="${p.id}" data-step="-1" aria-label="Quitar uno">−</button>
            <span>${p.qty}</span>
            <button type="button" data-qty="${p.id}" data-step="1" aria-label="Añadir uno">+</button>
          </div>
        </li>`).join('')
      : `<li class="empty"><span class="empty-icon">🛒</span><strong>Cotizador vacío</strong><span>Añade servicios desde el catálogo.</span></li>`;

    $('#pwaCartTotal').textContent = money(total);
  }

  function agregar(id) {
    const p = producto(id);
    if (!p) return;
    const line = carrito.find((i) => i.id === p.id);
    if (line) line.qty = App.clamp(line.qty + 1, 1, 99);
    else carrito.push({ id: p.id, qty: 1 });
    guardar();
    renderCarrito();
    App.toast(`“${p.nombre}” añadido.`, 'ok', 'Cotizador');
    logEvento(`Añadió “${p.nombre}” desde la app móvil.`, 'ok');
  }

  function cambiar(id, step) {
    const line = carrito.find((i) => i.id === Number(id));
    if (!line) return;
    line.qty = App.clamp(line.qty + Number(step), 0, 99);
    if (line.qty <= 0) carrito = carrito.filter((i) => i.id !== Number(id));
    guardar();
    renderCarrito();
  }

  function abrirDetalle(id) {
    const p = producto(id);
    if (!p) return;
    detalleActual = p.id;
    $('#pwaDetailCat').textContent = p.catLabel || p.categoria;
    $('#pwaDetailName').textContent = p.nombre;
    $('#pwaDetailDesc').textContent = p.detalle;
    $('#pwaDetailNota').textContent = p.nota ? 'ℹ️ ' + p.nota : 'Atención personalizada en clínica.';
    $('#pwaDetailPrice').textContent = money(p.precio);
    const img = $('#pwaDetailImg');
    img.onerror = () => App.imgFallback(img, p.emoji || '🐾');
    img.src = p.img;
    img.alt = p.nombre;
    App.openModal('pwaDetailModal');
    logEvento(`Consultó “${p.nombre}” en la app móvil.`, 'info');
  }

  function datosPaciente() {
    return {
      mascota: ($('#pwaPet').value || '').trim(),
      especie: $('#pwaSpecies').value || '',
      telefono: ($('#pwaPhone').value || '').trim(),
      cliente: ($('#pwaOwner').value || '').trim() || alias()
    };
  }

  function mensaje() {
    const { detalle, total } = totales();
    const d = datosPaciente();
    return [
      '🐾 *Cotización — Clínica Veterinaria Don Gato*',
      `Tutor: ${d.cliente || 'No indicado'}`,
      d.mascota ? `Mascota: ${d.mascota}${d.especie ? ` (${d.especie})` : ''}` : '',
      d.telefono ? `Celular: ${d.telefono}` : '',
      '',
      ...detalle.map((p) => `• ${p.qty}x ${p.nombre} — ${money(p.subtotal)}`),
      '',
      `💰 *TOTAL ESTIMADO: ${money(total)}*`,
      '📱 Enviado desde la app móvil Don Gato'
    ].filter(Boolean).join('\n');
  }

  function confirmar() {
    const { detalle, total, items } = totales();
    if (!detalle.length) { App.toast('Añade al menos un servicio.', 'warn'); return; }
    const d = datosPaciente();
    if (d.telefono && !/^\d{7,8}$/.test(d.telefono.replace(/\s|-/g, ''))) {
      $('#pwaPatientError').textContent = 'El celular debe tener 7 u 8 dígitos.';
      App.toast('Revisa el número de celular.', 'warn');
      return;
    }
    $('#pwaPatientError').textContent = '';

    const filas = detalle.map((p) => `<div class="row-between small">
      <span>${esc(p.qty)}x ${esc(p.nombre)}</span><strong>${esc(money(p.subtotal))}</strong></div>`).join('');

    $('#pwaResumenBody').innerHTML = `<div class="stack">
      <div class="card card-pad" style="box-shadow:none;background:var(--bg-panel)">
        <div class="row-between"><span class="muted small">Tutor</span><strong>${esc(d.cliente)}</strong></div>
        <div class="row-between"><span class="muted small">Mascota</span><strong>${esc(d.mascota || 'No indicada')}${d.especie ? ` · ${esc(d.especie)}` : ''}</strong></div>
        ${d.telefono ? `<div class="row-between"><span class="muted small">Celular</span><strong>${esc(d.telefono)}</strong></div>` : ''}
      </div>
      <div class="stack">${filas}</div>
      <div class="vet-total-row"><span>Total</span><strong>${esc(money(total))}</strong></div>
      <p class="small muted">Generado el ${esc(App.dateTime())}.</p>
    </div>`;

    logVenta({
      cliente: d.cliente,
      mascota: d.mascota,
      especie: d.especie,
      telefono: d.telefono,
      items: detalle.map((p) => ({ nombre: p.nombre, qty: p.qty, precio: p.precio, subtotal: p.subtotal })),
      total
    });
    logEvento(`Confirmó una cotización móvil de ${money(total)} (${items} ítem/s).`, 'ok');
    App.openModal('pwaResumenModal');
    App.toast('Resumen generado correctamente.', 'ok');
  }

  function enviarWa() {
    const { detalle } = totales();
    if (!detalle.length) { App.toast('El cotizador está vacío.', 'warn'); return; }
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(mensaje()), '_blank', 'noopener');
    logEvento('Envió la cotización móvil por WhatsApp.', 'info');
  }

  function pintarAlias() {
    const a = alias();
    $('#pwaAliasDisplay').textContent = a;
    $('#pwaAliasInput').value = a === 'Invitado' ? '' : a;
    $('#pwaClientAlias').value = a === 'Invitado' ? '' : a;
    if (a !== 'Invitado') {
      if (!$('#pwaOwner').value) $('#pwaOwner').value = a;
      if (!$('#pwaCitaTutor').value) $('#pwaCitaTutor').value = a;
    }
  }

  function guardarAlias(valor, cerrar) {
    const a = String(valor || '').trim().slice(0, 40);
    if (!a) { App.toast('Escribe un alias válido.', 'warn'); return; }
    App.store.set(KEYS.alias, a);
    pintarAlias();
    logEvento(`Guardó su alias como “${a}” en la app.`, 'ok');
    App.toast(`¡Hola, ${a}! 🐾`, 'ok', 'Alias guardado');
    if (cerrar) App.closeModal('pwaCuentaModal');
  }

  function pintarAdmin() {
    const admin = esAdmin();
    document.body.classList.toggle('is-admin', admin);
    $('#pwaDockBitacora').classList.toggle('hidden', !admin);
    $('#pwaCuentaBtn').innerHTML = admin ? '👑 Admin' : '👤 Cuenta';
    $('#pwaAdminForm').classList.toggle('hidden', admin);
    $('#pwaAdminLogout').classList.toggle('hidden', !admin);
    if (admin) renderAdmin();
  }

  function loginAdmin(event) {
    event.preventDefault();
    const user = ($('#pwaAdminUser').value || '').trim().toLowerCase();
    const pass = ($('#pwaAdminPass').value || '').trim();
    const ok = (user === 'admin' && (pass === 'admin123' || pass === 'vet2026'))
      || (user === 'vet' && pass === 'vet2026');
    if (!ok) {
      $('#pwaAdminError').textContent = 'Usuario o contraseña incorrectos.';
      logEvento(`Intento de acceso admin móvil fallido (“${user || 'vacío'}”).`, 'error');
      return;
    }
    $('#pwaAdminError').textContent = '';
    setAdmin(true);
    pintarAdmin();
    $('#pwaAdminForm').reset();
    App.closeModal('pwaCuentaModal');
    App.toast('Modo administrador activo.', 'ok', 'Admin');
    logEvento('El administrador inició sesión en la app.', 'ok');
  }

  function logoutAdmin() {
    setAdmin(false);
    document.body.classList.remove('is-admin');
    pintarAdmin();
    App.closeModal('pwaCuentaModal');
    if ($('#pwa-bitacora').classList.contains('active')) mostrarVista('pwa-inicio');
    App.toast('Sesión admin cerrada.', 'info');
    logEvento('El administrador cerró sesión en la app.', 'info');
  }

  function solicitarCita(event) {
    event.preventDefault();
    const tutor = ($('#pwaCitaTutor').value || '').trim();
    const mascota = ($('#pwaCitaMascota').value || '').trim();
    const celular = ($('#pwaCitaCelular').value || '').trim();
    const fecha = $('#pwaCitaFecha').value;
    const servicio = $('#pwaCitaServicio').value;
    const notas = ($('#pwaCitaNotas').value || '').trim();

    $$('#pwaCitaForm .input').forEach((i) => i.classList.remove('invalid'));
    const errores = [];
    if (!tutor) errores.push(['pwaCitaTutor', 'tutor']);
    if (!mascota) errores.push(['pwaCitaMascota', 'mascota']);
    if (!/^\d{8}$/.test(celular)) errores.push(['pwaCitaCelular', 'celular de 8 dígitos']);
    if (!fecha) errores.push(['pwaCitaFecha', 'fecha']);

    if (errores.length) {
      errores.forEach(([id]) => { const el = $('#' + id); if (el) el.classList.add('invalid'); });
      $('#pwaCitaError').textContent = 'Revisa: ' + errores.map(([, l]) => l).join(', ') + '.';
      return;
    }
    $('#pwaCitaError').textContent = '';

    const msg = [
      '📅 *Solicitud de cita — Don Gato (app)*',
      `Tutor: ${tutor}`,
      `Mascota: ${mascota}`,
      `Celular: ${celular}`,
      `Servicio: ${servicio}`,
      `Fecha: ${fecha}`,
      notas ? `Notas: ${notas}` : ''
    ].filter(Boolean).join('\n');

    logEvento(`Solicitó cita en la app para ${mascota} (${servicio}) el ${fecha}.`, 'ok');
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    App.toast('Solicitud enviada a WhatsApp.', 'ok', 'Cita');
    $('#pwaCitaMascota').value = '';
    $('#pwaCitaCelular').value = '';
    $('#pwaCitaNotas').value = '';
  }

  function enlazar() {
    document.addEventListener('click', (event) => {
      const nav = event.target.closest('[data-view-go]');
      if (nav) {
        event.preventDefault();
        mostrarVista(nav.dataset.viewGo);
        return;
      }
      const detail = event.target.closest('[data-detail]');
      if (detail) {
        event.stopPropagation();
        abrirDetalle(detail.dataset.detail);
        return;
      }
      const add = event.target.closest('[data-add]');
      if (add) { agregar(add.dataset.add); return; }
      const qty = event.target.closest('[data-qty]');
      if (qty) cambiar(qty.dataset.qty, qty.dataset.step);
    });

    $('#pwaFiltros').addEventListener('click', (event) => {
      const chip = event.target.closest('[data-cat]');
      if (!chip) return;
      filtro.cat = chip.dataset.cat;
      renderCatalogo();
      logEvento(`Filtró el catálogo móvil por “${filtro.cat}”.`, 'info');
    });

    $('#pwaBusqueda').addEventListener('input', (event) => {
      filtro.q = event.target.value;
      renderCatalogo();
    });

    $('#pwaClearCart').addEventListener('click', () => {
      if (!carrito.length) { App.toast('El cotizador ya está vacío.', 'info'); return; }
      carrito = [];
      guardar();
      renderCarrito();
      App.toast('Cotizador vaciado.', 'warn');
      logEvento('Vació el cotizador desde la app.', 'warn');
    });

    $('#pwaConfirm').addEventListener('click', confirmar);
    $('#pwaWhatsapp').addEventListener('click', enviarWa);
    $('#pwaResumenWa').addEventListener('click', enviarWa);
    $('#pwaDetailAdd').addEventListener('click', () => {
      if (detalleActual != null) agregar(detalleActual);
      App.closeModal('pwaDetailModal');
    });

    $('#pwaAliasForm').addEventListener('submit', (event) => {
      event.preventDefault();
      guardarAlias($('#pwaAliasInput').value, false);
    });
    $('#pwaClientForm').addEventListener('submit', (event) => {
      event.preventDefault();
      guardarAlias($('#pwaClientAlias').value, true);
    });
    $('#pwaAdminForm').addEventListener('submit', loginAdmin);
    $('#pwaAdminLogout').addEventListener('click', logoutAdmin);
    $('#pwaCitaForm').addEventListener('submit', solicitarCita);

    $('#pwaClearLogs').addEventListener('click', () => {
      if (!esAdmin()) return;
      if (!window.confirm('¿Limpiar todas las bitácoras?')) return;
      App.store.remove(KEYS.eventos);
      App.store.remove(KEYS.ventas);
      renderAdmin();
      App.toast('Bitácoras liberadas.', 'warn');
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') App.closeAllModals();
    });
  }

  App.ready(() => {
    if (!CATALOGO.length) {
      App.toast('No se pudo cargar el catálogo.', 'error');
      return;
    }

    $('#pwaStatTotal').textContent = String(CATALOGO.length);
    $('#pwaCitaFecha').min = new Date().toISOString().slice(0, 10);
    pintarAlias();
    pintarAdmin();
    renderDestacados();
    renderCatalogo();
    renderCarrito();
    enlazar();

    if (!leerLog(KEYS.eventos).length) {
      logEvento(`App móvil iniciada con ${CATALOGO.length} servicios.`, 'ok');
    }

    App.registerSW('sw.js');
  });
})();
