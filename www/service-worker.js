const CACHE_NAME = 'evidencia-pwa-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    // Recursos externos esenciales para el diseño y gráficos (si se implementan)
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js', 
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css?family=Inter:wght@400;600;700&display=swap'
    // Las imágenes de icono 'icon-192x192.png' y 'icon-512x512.png' también deben estar en el mismo directorio.
];

self.addEventListener('install', (event) => {
    // Forzar la activación del service worker tan pronto como se haya instalado
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Service Worker: Caché abierta');
            // Añadir todos los recursos a la caché
            return cache.addAll(urlsToCache).catch(error => {
                console.error('Service Worker: Fallo al añadir recursos a la caché:', error);
            });
        })
    );
});

self.addEventListener('activate', (event) => {
    // Eliminar cachés viejas para asegurar que solo la versión actual esté activa
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
    // Tomar el control de todas las páginas sin esperar a la próxima navegación
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Para la sincronización con Gist (API de GitHub), es crucial
    // que la aplicación **siempre intente ir a la red** si no hay caché (Cache-First).
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Devolver recurso de la caché si se encuentra (Offline OK)
            if (response) {
                return response;
            }
            // Si no se encuentra (ej: Gist API), ir a la red
            return fetch(event.request).catch(error => {
                console.log('Service Worker: Fallo en Fetch y no hay caché para:', event.request.url);
            });
        })
    );
});

// Lógica de Notificación Push/Programada (Periodicsync)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'daily-check') {
        event.waitUntil(
            self.registration.showNotification('Recordatorio Diario de Evidencia', {
                body: 'No olvides subir la evidencia de hoy para mantener la sincronización del equipo.',
                icon: './icon-192x192.png',
                tag: 'daily-reminder'
            })
        );
    }
});

// Programar la sincronización periódica (solo si el navegador lo permite)
if ('periodicSync' in self.registration) {
    self.registration.periodicSync.register('daily-check', {
        minInterval: 24 * 60 * 60 * 1000, // 24 horas
    }).catch(error => {
        console.error('Error al registrar periodicSync:', error);
    });
}

