const CACHE_NAME = "vex-hub-rc3-0-74-pendencias-aba";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./manifest.json",
  "./assets/logo/vex-logo.png",
  "./assets/logo/vex-logo-white.png",
  "./assets/icons/favicon.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-icon-192.png",
  "./assets/icons/maskable-icon-512.png",
  "./assets/icons/favicon-hub.png",
  "./assets/icons/apple-touch-icon-hub.png",
  "./assets/icons/icon-hub-192.png",
  "./assets/icons/icon-hub-512.png",
  "./assets/icons/maskable-hub-192.png",
  "./assets/icons/maskable-hub-512.png",
  "./assets/splash/splash.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});






