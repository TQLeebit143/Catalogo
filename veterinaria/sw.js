const CACHE = 'dongato-vet-v13';
const CACHE_PREFIX = 'dongato-vet-';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './script.js',
  './JS/data.js',
  './data/catalogo.json',
  './shared/boot.js',
  './shared/base.css',
  './shared/core.js',
  './shared/validacion.js',
  './shared/supabase-config.js',
  './shared/supabase.js',
  './Img/LOGO DE DON GATO sin fondo.png',
  './Img/arena sanitaria.jpg',
  './Img/bano.jpg',
  './Img/castracion gatos.jpg',
  './Img/castracion perro.jpg',
  './Img/cepillo mascota.jpg',
  './Img/collar gps.jpg',
  './Img/consulta.jpg',
  './Img/corte unas.jpg',
  './Img/corte.jpg',
  './Img/cremas.jpg',
  './Img/ecografia.jpg',
  './Img/estirilizacion gatas.jpg',
  './Img/estirilizacion perras.jpg',
  './Img/eutanasia.jpg',
  './Img/fluidoterapia.jpg',
  './Img/inyectable.jpg',
  './Img/jarabes.jpg',
  './Img/limpieza dental.jpg',
  './Img/peluqueria gato.jpg',
  './Img/peluqueria.jpg',
  './Img/shampoo.jpg',
  './Img/tabletas.jpg',
  './Img/via intravenosa.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(ASSETS.map((url) => cache.add(url).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE && key.indexOf(CACHE_PREFIX) === 0)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200 && new URL(request.url).origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => new Response('', { status: 408 }));
    })
  );
});