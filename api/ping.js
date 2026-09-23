export default function handler(req, res) {
  // Kein Caching, damit die Messung nicht verfälscht wird
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Einfach sofort 200 zurückgeben – die Zeitmessung passiert im Browser
  return res.status(200).json({ ok: true, ts: Date.now() });
}
