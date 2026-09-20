const CACHE = "fasqoo-v7";

const ASSETS = [
  "/",
  "/index.html",
  "/site.webmanifest",
  "/fasqoologo.png",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png"
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

function isMeasurement(url) {
  return url.hostname === "speed.cloudflare.com" ||
         url.hostname === "ipwho.is" ||
         url.pathname.includes("/__down") ||
         url.pathname.includes("/__up");
}

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Niemals Speedtest- oder IP-Messdaten cachen/intercepten.
  if (isMeasurement(url) || request.method !== "GET") {
    return;
  }

  // Navigation:
  // Netzwerk zuerst, Cache als Offline-Fallback.
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
          caches.match(request).then(response =>
            response || caches.match("/index.html")
          )
        )
    );

    return;
  }

  // Statische Dateien:
  // Netzwerk zuerst, Cache als Fallback.
  event.respondWith(
    fetch(request)
      .then(response => {
        if (
          response &&
          response.ok &&
          url.origin === self.location.origin
        ) {
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
