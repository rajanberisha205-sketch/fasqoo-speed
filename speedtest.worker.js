/* ==========================================================
   FASQOO SPEEDTEST WORKER ENGINE v4.0 (speedtest.worker.js)
   Hintergrund-Thread für verzugsfreie Netzwerkmessungen
   ========================================================== */

const SPEED_BASE = "https://speed.cloudflare.com";

/* ---------- MATHEMATISCHE HELFER ---------- */
function percentile(arr, q) {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y);
  const pos = (a.length - 1) * q;
  const base = Math.floor(pos), rest = pos - base;
  return a[base + 1] !== undefined ? a[base] + rest * (a[base + 1] - a[base]) : a[base];
}

function median(arr) { return percentile(arr, 0.5); }

/* ---------- PING & JITTER (EXAKTER MEDIAN) ---------- */
async function measurePingAndJitter() {
  const pings = [];
  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    try {
      await fetch(`${SPEED_BASE}/__down?bytes=0&t=${Date.now()}_${Math.random()}`, { cache: "no-store", mode: "cors" });
      const duration = performance.now() - start;
      if (duration > 0 && duration < 3000) pings.push(duration);
    } catch (e) {}
  }
  if (pings.length < 3) throw new Error("Ping-Messung fehlgeschlagen");

  const pingVal = median(pings);
  const deltas = [];
  for (let i = 1; i < pings.length; i++) deltas.push(Math.abs(pings[i] - pings[i - 1]));
  const jitterVal = median(deltas);

  return { ping: pingVal, jitter: jitterVal };
}

/* ---------- PARALLELE MULTI-STREAM MESSUNG (3-5 SEC) ---------- */
async function measureParallelThroughput(type = 'down') {
  const isDown = type === 'down';
  const streams = 6; // 6 parallele Threads für maximale Bandbreitenauslastung
  const sampleDurationMs = 3000; // Maximale Testdauer: 3 Sekunden
  const chunkSize = isDown ? 12 * 1024 * 1024 : 4 * 1024 * 1024;
  
  let totalBytes = 0;
  const startTime = performance.now();

  const tasks = Array.from({ length: streams }, async () => {
    try {
      if (isDown) {
        const res = await fetch(`${SPEED_BASE}/__down?bytes=${chunkSize}&r=${Math.random()}`, { cache: "no-store", mode: "cors" });
        const reader = res.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done || (performance.now() - startTime) > sampleDurationMs) break;
          totalBytes += value.byteLength;
          
          const currentMbps = (totalBytes * 8) / ((performance.now() - startTime) / 1000) / 1e6;
          // Live-Update an Hauptthread senden
          postMessage({ type: 'progress', phase: type, speed: currentMbps });
        }
      } else {
        const dummyData = new Uint8Array(1024 * 512); // 512KB Datenpakete
        while ((performance.now() - startTime) < sampleDurationMs) {
          await fetch(`${SPEED_BASE}/__up?r=${Math.random()}`, { method: "POST", body: dummyData, mode: "cors" });
          totalBytes += dummyData.byteLength;
          
          const currentMbps = (totalBytes * 8) / ((performance.now() - startTime) / 1000) / 1e6;
          postMessage({ type: 'progress', phase: type, speed: currentMbps });
        }
      }
    } catch (e) {}
  });

  await Promise.all(tasks);
  const elapsedSeconds = (performance.now() - startTime) / 1000;
  const finalMbps = (totalBytes * 8) / elapsedSeconds / 1e6;
  return Number.isFinite(finalMbps) && finalMbps > 0 ? finalMbps : 0;
}

/* ---------- WORKER STEUERUNG ---------- */
self.onmessage = async function(e) {
  if (e.data === 'start') {
    try {
      // 1. Ping & Jitter Phase
      postMessage({ type: 'phase', phase: 'ping' });
      const { ping, jitter } = await measurePingAndJitter();
      postMessage({ type: 'pingResult', ping, jitter });

      // 2. Download Phase
      postMessage({ type: 'phase', phase: 'download' });
      const downloadSpeed = await measureParallelThroughput('down');
      postMessage({ type: 'downloadResult', downloadSpeed });

      // 3. Upload Phase
      postMessage({ type: 'phase', phase: 'upload' });
      const uploadSpeed = await measureParallelThroughput('up');
      postMessage({ type: 'uploadResult', uploadSpeed });

      // 4. Abschluss
      postMessage({ type: 'complete' });
    } catch (err) {
      postMessage({ type: 'error', message: err.message });
    }
  }
};
