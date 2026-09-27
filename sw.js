const CACHE = "fasqoo-v9"; // ← Version hochgezogen, damit der neue SW sofort greift

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

/* ----------------------------------------------------------
   INSTALL — Assets einzeln cachen, damit ein 404 nicht
   den kompletten Cache verhindert.
   ---------------------------------------------------------- */
self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(
        ASSETS.map(url =>
          cache.add(url).catch(err =>
            console.warn("[SW] skip asset:", url, err)
          )
        )
      );
      // Erst nach erfolgreichem Caching übernehmen
      await self.skipWaiting();
    })()
  );
});

/* ----------------------------------------------------------
   ACTIVATE — alte Caches löschen, sofort Kontrolle übernehmen
   ---------------------------------------------------------- */
self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

/* ----------------------------------------------------------
   Messendpunkte NIE abfangen
   ---------------------------------------------------------- */
function isMeasurement(url) {
  return (
    url.hostname === "speed.cloudflare.com" ||
    url.hostname === "ipwho.is" ||
    url.hostname.endsWith("googletagmanager.com") ||
    url.hostname.endsWith("google-analytics.com") ||
    url.pathname.includes("/__down") ||
    url.pathname.includes("/__up")
  );
}

/* ----------------------------------------------------------
   FETCH
   ---------------------------------------------------------- */
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Messendpunkte + alles außer GET unberührt lassen
  if (isMeasurement(url) || request.method !== "GET") return;

  // Nur Same-Origin-Anfragen im SW verwalten
  if (url.origin !== self.location.origin) return;

  // Manifest: network-first, damit Änderungen sofort greifen
  if (url.pathname === "/site.webmanifest") {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // HTML-Navigation: network-first mit Offline-Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const copy = response.clone();
          const cache = await caches.open(CACHE);
          cache.put(request, copy).catch(() => {});
          return response;
        } catch {
          const cached =
            (await caches.match(request)) ||
            (await caches.match("/index.html")) ||
            (await caches.match("/"));
          return cached || new Response(
            "<h1>Offline</h1><p>Fasqoo ist offline nicht verfügbar.</p>",
            { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        }
      })()
    );
    return;
  }

  // Statische Assets: cache-first mit Netzwerk-Fallback
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      try {
        const response = await fetch(request);
        if (response && response.ok && url.origin === self.location.origin) {
          const copy = response.clone();
          const cache = await caches.open(CACHE);
          cache.put(request, copy).catch(() => {});
        }
        return response;
      } catch {
        return new Response("", { status: 504, statusText: "Offline" });
      }
    })()
  );
});
