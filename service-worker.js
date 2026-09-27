/* ============================================================
   FASQOO SERVICE WORKER
   ------------------------------------------------------------
   Zweck:
   - PWA-Offline-Fähigkeit
   - Millisekunden-Start der installierten App
   - Cache-First für App-Shell, Network-Only für Speedtest-APIs

   WICHTIG:
   - Nichts mit Cloudflare "worker.js" zu tun (das ist was anderes!)
   - Muss über HTTPS geladen werden
   ============================================================ */

const SW_VERSION  = 'v1.0.0';
const CACHE_NAME  = 'fasqoo-' + SW_VERSION;
const OFFLINE_URL = '/offline.html'; // optional – siehe unten

/* ------------------------------------------------------------
   1) APP-SHELL
   Diese Dateien werden beim ersten Laden in den Cache gelegt,
   damit die App danach offline & in Millisekunden startet.
   ------------------------------------------------------------ */
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/site.webmanifest',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png'
];

/* ------------------------------------------------------------
   2) NIE CACHEN
   Speedtest-Messungen MÜSSEN immer live aus dem Netz kommen,
   sonst wären die Werte falsch. Gleiches gilt für IP-Lookup,
   Analytics und Fonts (haben eigene Caches).
   ------------------------------------------------------------ */
const NEVER_CACHE_HOSTS = [
  'speed.cloudflare.com',       // Speedtest-Endpunkte
  'ipwho.is',                   // IP-/ISP-Lookup
  'www.googletagmanager.com',   // GTM
  'www.google-analytics.com',   // GA
  'fonts.googleapis.com',       // Webfonts (eigener Cache)
  'fonts.gstatic.com',
  'lite.fasqoo.com'             // Widget laden wir extern
];

/* ============================================================
   INSTALL
   App-Shell einzeln in den Cache legen – so blockiert ein
   einzelnes fehlendes Asset nicht die komplette Installation.
   ============================================================ */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        CORE_ASSETS.map(url =>
          cache.add(url).catch(err =>
            console.warn('[SW] Konnte nicht cachen:', url, err)
          )
        )
      );
    }).then(() => self.skipWaiting())
  );
});

/* ============================================================
   ACTIVATE
   Alte Fasqoo-Caches aufräumen, sofort die Kontrolle übernehmen.
   ============================================================ */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('fasqoo-') && k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ============================================================
   FETCH-STRATEGIE
   ============================================================ */
self.addEventListener('fetch', event => {
  const req = event.request;

  /* Nur GET unterstützen – POST/PUT etc. direkt ans Netz */
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  /* ---------------------------------------------------------
     A) Speedtest & Co. → Network-Only (niemals cachen!)
     --------------------------------------------------------- */
  if (NEVER_CACHE_HOSTS.some(h => url.hostname.includes(h))) {
    return; // Browser macht Standard-Fetch
  }

  /* ---------------------------------------------------------
     B) HTML-Navigation → Network-First
        (App soll immer die aktuellste Version laden, mit
         Cache als Offline-Fallback)
     --------------------------------------------------------- */
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then(res => {
          // Erfolgreiche Antwort in den Cache spiegeln
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(req)
            .then(hit => hit || caches.match('/index.html'))
        )
    );
    return;
  }

  /* ---------------------------------------------------------
     C) Alles andere (CSS, JS, Bilder) → Cache-First
        mit Hintergrund-Update (Stale-While-Revalidate)
     --------------------------------------------------------- */
  event.respondWith(
    caches.match(req).then(cached => {
      const networkFetch = fetch(req)
        .then(res => {
          // Nur saubere, same-origin Antworten cachen
          if (res && res.status === 200 && res.type !== 'opaque') {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached); // Netz weg → nimm Cache

      return cached || networkFetch;
    })
  );
});

/* ============================================================
   MESSAGE-HANDLER
   Erlaubt es der Seite, die SW-Version abzufragen oder ein
   sofortiges Update zu triggern.
   ============================================================ */
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'GET_VERSION') {
    event.source?.postMessage({ type: 'VERSION', version: SW_VERSION });
  }
});
