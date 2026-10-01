/* ==========================================================
   FASQOO SERVICE WORKER — v10 (fixed)
   - Measurement-Endpoints werden NIE abgefangen
   - HTML: network-first (immer frisch, offline-fallback)
   - CSS/JS: stale-while-revalidate (sofort schnell, bald aktuell)
   - Bilder/Fonts: cache-first (ändern sich kaum)
   - GTM/GA + Speed-Endpoints: bypass
   ========================================================== */

const CACHE = "fasqoo-v10";
const HTML_CACHE = "fasqoo-html-v10";
const ASSET_CACHE = "fasqoo-assets-v10";

const PRECACHE = [
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

const ALL_CACHES = [CACHE, HTML_CACHE, ASSET_CACHE];

/* ----------------------------------------------------------
   INSTALL
   ---------------------------------------------------------- */
self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(
        PRECACHE.map(url =>
          cache.add(url).catch(err =>
            console.warn("[SW] skip asset:", url, err)
          )
        )
      );
      await self.skipWaiting();
    })()
  );
});

/* ----------------------------------------------------------
   ACTIVATE — alte Caches löschen, sofort übernehmen
   ---------------------------------------------------------- */
self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(k => !ALL_CACHES.includes(k))
          .map(k => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

/* ----------------------------------------------------------
   Bypass-Regeln: Messung, Analytics, Nicht-GET
   ---------------------------------------------------------- */
function shouldBypass(url, request) {
  if (request.method !== "GET") return true;
  if (url.origin !== self.location.origin) {
    // externe Hosts grundsätzlich nicht cachen
    if (
      url.hostname === "speed.cloudflare.com" ||
      url.hostname === "ipwho.is" ||
      url.hostname === "www.googletagmanager.com" ||
      url.hostname.endsWith(".googletagmanager.com") ||
      url.hostname === "www.google-analytics.com" ||
      url.hostname.endsWith(".google-analytics.com") ||
      url.hostname.endsWith(".google.com") ||
      url.pathname.includes("/__down") ||
      url.pathname.includes("/__up")
    ) {
      return true;
    }
  }
  return false;
}

/* ----------------------------------------------------------
   Helpers
   ---------------------------------------------------------- */
function isHtmlRequest(request) {
  return request.mode === "navigate" ||
         (request.headers.get("accept") || "").includes("text/html");
}

function isStaticAsset(url) {
  return /\.(?:css|js|mjs|woff2?|ttf|otf|png|jpe?g|webp|avif|svg|ico|gif)$/i.test(url.pathname);
}

function isManifest(url) {
  return url.pathname === "/site.webmanifest" || url.pathname.endsWith(".webmanifest");
}

async function networkFirstHTML(request) {
  const cache = await caches.open(HTML_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    const cached =
      (await cache.match(request)) ||
      (await cache.match("/index.html")) ||
      (await cache.match("/"));
    return cached || new Response(
      "<!doctype html><meta charset='utf-8'><title>Offline</title>" +
      "<h1>Offline</h1><p>Fasqoo ist offline nicht verfügbar.</p>",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then(response => {
      if (response && response.ok) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => null);

  // Sofort gecachte Version liefern, parallel im Hintergrund aktualisieren
  if (cached) return cached;

  const fresh = await network;
  if (fresh) return fresh;

  return new Response("", { status: 504, statusText: "Offline" });
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

/* ----------------------------------------------------------
   FETCH
   ---------------------------------------------------------- */
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (shouldBypass(url, request)) return;

  // Nur Same-Origin verwalten
  if (url.origin !== self.location.origin) return;

  // Manifest: network-first, damit Branding-Änderungen sofort greifen
  if (isManifest(url)) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // HTML-Navigation: network-first
  if (isHtmlRequest(request)) {
    event.respondWith(networkFirstHTML(request));
    return;
  }

  // Statisches Asset: stale-while-revalidate
  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Alles andere (JSON, Fonts, etc.): cache-first
  event.respondWith(cacheFirst(request));
});
