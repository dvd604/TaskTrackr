//modified from https://iamsrijan.medium.com/guide-to-implementing-service-workers-in-javascript-af2545ec09d9
const CACHE_NAME = "trackr-cache-v1";
const cacheFiles = [
    '/pwa/ttrackr.png',
    '/stylesheets/style.css',
    '/images/favicon.ico',
    '/javascripts/validate.js',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(cacheFiles))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});