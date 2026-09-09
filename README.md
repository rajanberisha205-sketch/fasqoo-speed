# Fasqoo Network Backend

Dieses Backend liefert echte serverseitige Messungen. Es erzeugt keine Ping-, Port- oder Traceroute-Fakewerte.

## Enthalten
- GET /api/health
- GET /api/ping?host=8.8.8.8
- GET /api/port?host=example.com&port=443
- GET /api/tls?host=example.com
- GET /api/traceroute?host=8.8.8.8
- GET /api/dns?host=example.com&type=A
- GET /api/http?url=https://example.com/

## Installation

Node.js 18+ installieren, dann:

    npm install
    npm start

Das Backend läuft standardmäßig auf Port 3000.

## Wichtig
Das Backend blockiert private/reservierte IP-Ziele, damit die Diagnose-API nicht als SSRF-/Portscan-Dienst gegen interne Netze missbraucht werden kann.

Für Traceroute muss `traceroute` (Linux/macOS) bzw. `tracert` (Windows) vorhanden sein.
Für HTTP-Header muss `curl` vorhanden sein.

In Produktion:
- HTTPS vor den Dienst setzen (Reverse Proxy)
- ALLOWED_ORIGIN auf https://www.fasqoo.com setzen
- Rate-Limits beibehalten
- Backend nicht direkt ungeschützt ins Internet stellen
