const CACHE = "fasqoo-v5";

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

  // Speed-test requests are never cached.
  if (
    request.url.includes("speed.cloudflare.com") ||
    request.url.includes("ipwho.is")
  ) {
    return;
  }

  if (request.method !== "GET") {
    return;
  }

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
});
