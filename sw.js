const CACHE = "fasqoo-v6";

const ASSETS = [
  "/",
  "/index.html",
  "/site.webmanifest",
  "/fasqoologo.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .catch(() => {})
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = request.url;

  // --------------------------------------------------
  // NEVER CACHE SPEED TEST / NETWORK DIAGNOSTIC DATA
  // --------------------------------------------------
  if (
    url.includes("speed.cloudflare.com") ||
    url.includes("ipwho.is") ||
    url.includes("__down") ||
    url.includes("__up")
  ) {
    return;
  }

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  // --------------------------------------------------
  // HTML NAVIGATION
  // Network first -> Cache fallback
  // --------------------------------------------------
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();

          caches.open(CACHE)
            .then(cache => cache.put(request, copy))
            .catch(() => {});

          return response;
        })
        .catch(() =>
          caches.match(request)
            .then(response =>
              response || caches.match("/index.html")
            )
        )
    );

    return;
  }

  // --------------------------------------------------
  // OTHER STATIC FILES
  // Network first -> Cache fallback
  // --------------------------------------------------
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();

          caches.open(CACHE)
            .then(cache => cache.put(request, copy))
            .catch(() => {});
        }

        return response;
      })
      .catch(() =>
        caches.match(request)
      )
  );
});
