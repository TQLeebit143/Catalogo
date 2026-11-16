/* ============================================================
   JS/main.js — Orquestador central de la aplicación
   Carga los módulos de semana1 y semana2
   ============================================================ */
$(document).ready(function () {
  console.log("Iniciando Clínica Veterinaria & SPA Don Gato...");

  // 1. Render inicial del catálogo
  if (typeof renderizar === 'function' && typeof catalogoVet !== 'undefined') {
    renderizar(catalogoVet);
  }

  // 2. Módulos Semana 1
  if (typeof initModoOscuro === 'function') initModoOscuro();
  if (typeof initMenuHamburguesa === 'function') initMenuHamburguesa();
  if (typeof initBusqueda === 'function') initBusqueda();
  if (typeof initValidacionFormulario === 'function') initValidacionFormulario();

  // 3. Módulos Semana 2
  if (typeof initAcordeonYTemas === 'function') initAcordeonYTemas();
  if (typeof initCalculadorModalTimer === 'function') initCalculadorModalTimer();
  if (typeof activarLazyLoading === 'function') activarLazyLoading();
  if (typeof initArquitecturaPWA === 'function') initArquitecturaPWA();
  if (typeof initSeguridadYLogin === 'function') initSeguridadYLogin();

  // 4. Registrar arranque
  if (typeof registrarBitacoraEvento === 'function') {
    registrarBitacoraEvento('SISTEMA', `Plataforma Desktop iniciada. 23 ítems listos.`);
  }

  console.log("Todos los módulos de Semana 1 y Semana 2 vinculados con éxito.");
});
