/* ============================================================
   JS/carrito.js — Cotizador / Carrito con cálculo en Bolivianos
   ============================================================ */

let carrito = [];

function agregarCarrito(id) {
  const item = catalogoVet.find(s => s.id === id);
  if (!item) return;

  const existente = carrito.find(c => c.id === id);
  if (existente) {
    existente.cant = (existente.cant || 1) + 1;
  } else {
    carrito.push({ ...item, cant: 1 });
  }

  actualizarCarrito();
  if (typeof toast === 'function') toast(`✅ "${item.nombre}" añadido`);
  if (typeof registrarBitacoraEvento === 'function') {
    registrarBitacoraEvento('CARRITO', `+ Añadido: "${item.nombre}" (${item.precio} BOB)`);
  }
}

function cambiarCantidad(idx, delta) {
  if (!carrito[idx]) return;
  carrito[idx].cant = (carrito[idx].cant || 1) + delta;
  if (carrito[idx].cant <= 0) {
    quitarCarrito(idx);
    return;
  }
  actualizarCarrito();
}

function quitarCarrito(idx) {
  const el = carrito.splice(idx, 1)[0];
  actualizarCarrito();
  if (typeof toast === 'function') toast(`🗑️ "${el.nombre}" eliminado`);
  if (typeof registrarBitacoraEvento === 'function') {
    registrarBitacoraEvento('CARRITO', `- Quitado: "${el.nombre}"`);
  }
}

function vaciarCarrito() {
  if (!carrito.length) { 
    if (typeof toast === 'function') toast('El cotizador ya está vacío'); 
    return; 
  }
  const n = carrito.length;
  carrito = [];
  actualizarCarrito();
  if (typeof toast === 'function') toast('🗑️ Cotizador vaciado');
  if (typeof registrarBitacoraEvento === 'function') {
    registrarBitacoraEvento('CARRITO', `Cotizador vaciado (${n} tipos de ítems)`);
  }
}

function actualizarCarrito() {
  const $l = $('#listaCarrito').empty();
  let total = 0;
  let itemsCount = 0;

  if (!carrito.length) {
    $l.html('<li class="item-vacio">Añade servicios o productos desde el catálogo 🐾</li>');
  } else {
    carrito.forEach((item, i) => {
      const cant = item.cant || 1;
      const sub = item.precio * cant;
      total += sub;
      itemsCount += cant;

      $l.append(`
        <li class="item-c">
          <div class="ic-info">
            <div class="ic-nom">${item.emoji || '🐾'} ${item.nombre}</div>
            <div class="ic-cat">${item.catLabel || item.categoria}</div>
            <div class="ic-unit">${item.precio} BOB c/u</div>
          </div>
          <div class="ic-cant-ctrl">
            <button class="btn-cant" onclick="cambiarCantidad(${i}, -1)">-</button>
            <span class="cant-num">${cant}</span>
            <button class="btn-cant" onclick="cambiarCantidad(${i}, 1)">+</button>
          </div>
          <span class="ic-subtotal">${sub} BOB</span>
          <button class="btn-q" onclick="quitarCarrito(${i})" title="Eliminar">✕</button>
        </li>`);
    });
  }

  $('#cotTotal').text(total + ' BOB');
  $('#cartCount').text(itemsCount);
  $('#cartTotal').text(total);
}

function confirmar() {
  if (!carrito.length) { 
    if (typeof toast === 'function') toast('⚠️ Añade servicios al cotizador primero'); 
    return; 
  }
  const total = carrito.reduce((a, i) => a + (i.precio * (i.cant || 1)), 0);
  const nombre = $('#nombreMascota').val().trim() || 'Sin nombre';
  const especie = $('#especieMascota').val() || 'No indicada';
  const dueno = $('#nombreDueno').val().trim() || 'No indicado';

  if (typeof registrarBitacoraVenta === 'function') {
    registrarBitacoraVenta(carrito, total, `${dueno} (${nombre})`);
  }
  if (typeof registrarBitacoraEvento === 'function') {
    registrarBitacoraEvento('COTIZACIÓN', `Generada por ${total} BOB para ${nombre}`);
  }

  if (typeof toast === 'function') toast(`✅ ¡Cotización de ${total} BOB generada con éxito!`);
}

function cotizarWa() {
  if (!carrito.length) { 
    if (typeof toast === 'function') toast('⚠️ Añade servicios primero'); 
    return; 
  }
  const total = carrito.reduce((a, i) => a + (i.precio * (i.cant || 1)), 0);
  const nombre = $('#nombreMascota').val().trim() || 'Mi mascota';
  const especie = $('#especieMascota').val() || '';
  const dueno = $('#nombreDueno').val().trim() || '';
  const tel = $('#telDueno').val().trim() || '';

  let msg = `🐾 *Cotización — Clínica Don Gato*\n`;
  msg += `Mascota: ${nombre}${especie ? ' (' + especie + ')' : ''}\n`;
  if (dueno) msg += `Dueño/Tutor: ${dueno}\n`;
  if (tel) msg += `Teléfono: ${tel}\n`;
  msg += `\n*Servicios y Productos seleccionados:*\n`;
  carrito.forEach(i => { 
    const cant = i.cant || 1;
    msg += `✔️ ${cant}x ${i.nombre} — ${i.precio * cant} BOB\n`; 
  });
  msg += `\n💰 *TOTAL ESTIMADO: ${total} BOB*\n\n_Dr. Jorge Castillo (MVZ) - Av. Pasoskanqui esq. Brasil # 1627_`;

  window.open(`https://wa.me/59167301341?text=${encodeURIComponent(msg)}`, '_blank');
  
  if (typeof registrarBitacoraVenta === 'function') {
    registrarBitacoraVenta(carrito, total, dueno ? `${dueno} [WhatsApp]` : 'Cliente [WhatsApp]');
  }
  if (typeof registrarBitacoraEvento === 'function') {
    registrarBitacoraEvento('WHATSAPP', `Cotización enviada a WhatsApp: ${total} BOB`);
  }
  if (typeof toast === 'function') toast('💬 Abriendo WhatsApp...');
}
