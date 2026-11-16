let bufferBitacoraEventos = [];

function registrarBitacoraEvento(tipo, detalle) {
  const ahora = new Date();
  const horaStr = ahora.toLocaleTimeString();
  const logItem = { hora: horaStr, tipo, detalle, timestamp: ahora.getTime() };
  
  bufferBitacoraEventos.unshift(logItem);
  if (bufferBitacoraEventos.length > 100) bufferBitacoraEventos.pop();

  const container = $('#logEventosList');
  if (container.length) {
    const badgeColor = obtenerColorBadge(tipo);
    const htmlItem = `
      <div class="log-entry">
        <span class="log-time">[${horaStr}]</span>
        <span class="log-badge ${badgeColor}">${tipo}</span>
        <span class="log-msg">${detalle}</span>
      </div>
    `;
    container.prepend(htmlItem);
  }
}

function obtenerColorBadge(tipo) {
  switch(tipo) {
    case 'LOGIN_OK': return 'badge-green';
    case 'LOGIN_FAIL': return 'badge-red';
    case 'COTIZACION': return 'badge-gold';
    case 'CARRITO': return 'badge-blue';
    case 'FILTRO': return 'badge-purple';
    case 'ZOOM': return 'badge-cyan';
    default: return 'badge-default';
  }
}

function limpiarBitacoraEventos() {
  bufferBitacoraEventos = [];
  $('#logEventosList').html('<div class="log-empty">Bitácora de eventos limpia.</div>');
  if (typeof mostrarToast === 'function') {
    mostrarToast('BITÁCORA', 'Historial de eventos limpiado.');
  }
}
