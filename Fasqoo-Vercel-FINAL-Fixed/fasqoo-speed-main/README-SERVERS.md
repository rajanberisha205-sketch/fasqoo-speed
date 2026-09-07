# Fasqoo server selection

This version is Vercel-ready and uses Cloudflare's browser speed-test endpoint.

## Important technical limitation

`speed.cloudflare.com` is a global Anycast service. A browser cannot reliably force Cloudflare to use a specific city/PoP merely by changing the URL. Therefore the UI must not pretend that "Pristina", "Frankfurt", etc. are separate test servers unless Fasqoo operates real endpoints in those locations.

The current selector contains only legitimate choices:

- **Auto Select** — Cloudflare selects the available edge automatically.
- **Cloudflare Edge** — uses the same Cloudflare edge service; the exact PoP is still selected by Cloudflare Anycast.

## Adding real Fasqoo servers later

For true manual city/server selection, deploy one identical HTTPS speed-test endpoint per location. Each endpoint should provide:

- `GET /__down?bytes=<number>` — binary response, CORS enabled.
- `POST /__up` — accepts request body, CORS enabled.
- A lightweight ping/health endpoint.

Then add each endpoint to `FASQOO_SERVERS` in `index.html`. Do not add a city name until the endpoint is actually hosted there.
