let bufferBitacoraVentas = [];

function registrarBitacoraVenta(items, totalBOB, cliente) {
  const ahora = new Date();
  const horaStr = ahora.toLocaleTimeString();
  const resumen = items.map(i => `${i.cant}x ${i.nombre}`).join(', ');
  
  const venta = {
    hora: horaStr,
    cliente: cliente || 'Cliente Anónimo',
    resumen,
    totalBOB,
    items
  };

  bufferBitacoraVentas.unshift(venta);
  
  const container = $('#logVentasList');
  if (container.length) {
    const htmlItem = `
      <div class="log-entry log-sale">
        <span class="log-time">[${horaStr}]</span>
        <span class="log-badge badge-gold">COTIZACIÓN OK</span>
        <strong>${cliente || 'Cliente'}</strong>: ${resumen} — 
        <strong class="log-price">${totalBOB} BOB</strong>
      </div>
    `;
    container.prepend(htmlItem);
    $('#adminTotalCotizado').text(calcularTotalVentasBOB() + ' BOB');
  }
}

function calcularTotalVentasBOB() {
  return bufferBitacoraVentas.reduce((sum, v) => sum + v.totalBOB, 0);
}
