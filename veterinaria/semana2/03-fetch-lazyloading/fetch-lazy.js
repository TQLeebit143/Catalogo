async function cargarCatalogoAsincrono(url = 'data/catalogo.json') {
  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`HTTP error! status: ${respuesta.status}`);
    const datos = await respuesta.json();
    
    if (typeof registrarBitacoraEvento === 'function') {
      registrarBitacoraEvento('FETCH', `Cargados ${datos.length} ítems desde ${url}`);
    }
    return datos;
  } catch (error) {
    console.warn("Fetch local bloqueado o no disponible, usando catalogoVet en memoria:", error);
    return (typeof catalogoVet !== 'undefined') ? catalogoVet : [];
  }
}

function activarLazyLoading() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '50px 0px' });

    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
  }
}
