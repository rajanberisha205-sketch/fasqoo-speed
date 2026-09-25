/* ============================================================
   Fasqoo 24/7 Monitor — GitHub Actions Edition
   ============================================================ */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_FILE = path.join(__dirname, "..", "history.json");
const TARGET_URL = "https://fasqoo.com/";
const TIMEOUT_MS = 15000;

// 30 Tage aufbewahren, damit der 30d-Tab im Frontend gefüllt ist
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
// 30 Tage × 144 Checks/Tag ≈ 4320 → Puffer auf 5000
const MAX_ENTRIES = 5000;

async function loadHistory() {
  try {
    const data = await fs.readFile(HISTORY_FILE, "utf8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveHistory(rows) {
  const cutoff = Date.now() - MAX_AGE_MS;
  let cleaned = rows.filter(r => r && r.t >= cutoff);
  if (cleaned.length > MAX_ENTRIES) cleaned = cleaned.slice(-MAX_ENTRIES);

  await fs.writeFile(
    HISTORY_FILE,
    JSON.stringify(cleaned, null, 2) + "\n",
    "utf8"
  );
  return cleaned;
}

async function check() {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let ok = false;
  let status = 0;
  let error = null;

  try {
    const res = await fetch(TARGET_URL + "?gh_monitor=" + start, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      headers: {
        "User-Agent": "Fasqoo-Monitor/1.0 (+https://fasqoo.com)",
        "Accept": "text/html,*/*"
      },
      signal: controller.signal
    });
    status = res.status;
    ok = res.status >= 200 && res.status < 400;
    await res.text();
  } catch (e) {
    error = e?.name === "AbortError" ? "Timeout" : (e?.message || "Unknown");
  } finally {
    clearTimeout(timer);
  }

  const ms = Date.now() - start;

  console.log(
    `[${new Date().toISOString()}] ` +
    `${ok ? "OK" : "FAIL"} ${ms}ms HTTP ${status || "-"} ${error ? "| " + error : ""}`
  );

  return { t: start, ok, ms, status, error };
}

async function main() {
  const entry = await check();

  const history = await loadHistory();
  history.push(entry);
  const cleaned = await saveHistory(history);

  const last24h = cleaned.filter(r => r.t > Date.now() - 86400000);
  const successes = last24h.filter(r => r.ok).length;
  const uptime = last24h.length
    ? ((successes / last24h.length) * 100).toFixed(2)
    : "100.00";

  const latencies = last24h.filter(r => r.ok).map(r => r.ms);
  const avg = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : 0;

  console.log(`24h: Uptime ${uptime}% | ${last24h.length} checks | Avg ${avg}ms`);

  if (!entry.ok) {
    console.error("Check FAILED");
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
