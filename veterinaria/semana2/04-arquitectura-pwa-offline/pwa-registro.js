function initArquitecturaPWA() {
  window.addEventListener('online', () => {
    actualizarEstadoConexion(true);
    if (typeof mostrarToast === 'function') {
      mostrarToast('CONEXIÓN', '¡Conexión a Internet restablecida!');
    }
    if (typeof registrarBitacoraEvento === 'function') {
      registrarBitacoraEvento('RED', 'Estado: ONLINE');
    }
  });

  window.addEventListener('offline', () => {
    actualizarEstadoConexion(false);
    if (typeof mostrarToast === 'function') {
      mostrarToast('OFFLINE', 'Modo sin conexión activado (Cache local disponible)');
    }
    if (typeof registrarBitacoraEvento === 'function') {
      registrarBitacoraEvento('RED', 'Estado: OFFLINE (Modo Offline-First)');
    }
  });

  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('Service Worker registrado con éxito en ámbito:', reg.scope);
      })
      .catch(err => {
        console.log('Aviso SW:', err.message);
      });
  }
}

function actualizarEstadoConexion(online) {
  const badge = $('#badge-red-status');
  if (online) {
    badge.removeClass('offline').addClass('online').text('🟢 Online');
  } else {
    badge.removeClass('online').addClass('offline').text('🟠 Offline');
  }
}
