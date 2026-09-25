const CACHE_NAME = "mbayompos-cache-v1";
const APP_SHELL = [
  "/mbayompos/",
  "/mbayompos/index.html",
  "/mbayompos/manifest.json"
  // Add your CSS/JS/icon file paths here so they work offline
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Network-first for the Google Apps Script API calls (always fresh data),
// cache-first for static app shell files.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.origin.includes("script.google.com")) {
    // Always go to network for live POS data; don't cache API responses.
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
