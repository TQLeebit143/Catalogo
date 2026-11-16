/* ══════════════════════════════════════════════════
   JS/bitacora.js — Log del sistema con timestamp
   Depende de: jQuery
══════════════════════════════════════════════════ */

function log(msg, tipo = 'info') {
  const h  = new Date().toLocaleTimeString('es-BO');
  const cl = { info:'log-info', ok:'log-ok', warn:'log-warn', accion:'log-accion' }[tipo] || 'log-info';
  $('#logPanel').prepend($('<div>').addClass(cl).text(`[${h}] ${msg}`));
}

function limpiarLog() {
  $('#logPanel').html('<div class="log-info">[SISTEMA] Bitácora limpiada.</div>');
  toast('Bitácora limpiada 🗑️');
}
