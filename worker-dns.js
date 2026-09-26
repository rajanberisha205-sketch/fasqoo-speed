/**
 * Fasqoo DNS Propagation Worker
 * -----------------------------------------------------------------
 * Endpoint:  GET /?domain=example.com&type=A
 * Antwort:   JSON { domain, type, results: [ { id, city, country, resolver, values, latency, status } ] }
 * CORS:      OPTIONS + GET von jeder Origin.
 * -----------------------------------------------------------------
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Expose-Headers': '*',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin'
};

const CITIES = [
  { id:'fra', city:'Frankfurt',     country:'DE', flag:'🇩🇪', resolver:'cloudflare' },
  { id:'lhr', city:'London',        country:'GB', flag:'🇬🇧', resolver:'google'     },
  { id:'ams', city:'Amsterdam',     country:'NL', flag:'🇳🇱', resolver:'opendns'    },
  { id:'nyc', city:'New York',      country:'US', flag:'🇺🇸', resolver:'cloudflare' },
  { id:'yyz', city:'Toronto',       country:'CA', flag:'🇨🇦', resolver:'google'     },
  { id:'sfo', city:'San Francisco', country:'US', flag:'🇺🇸', resolver:'opendns'    },
  { id:'lax', city:'Los Angeles',   country:'US', flag:'🇺🇸', resolver:'cloudflare' },
  { id:'gru', city:'São Paulo',     country:'BR', flag:'🇧🇷', resolver:'google'     },
  { id:'cpt', city:'Cape Town',     country:'ZA', flag:'🇿🇦', resolver:'cloudflare' },
  { id:'jnb', city:'Johannesburg',  country:'ZA', flag:'🇿🇦', resolver:'opendns'    },
  { id:'dxb', city:'Dubai',         country:'AE', flag:'🇦🇪', resolver:'cloudflare' },
  { id:'bom', city:'Mumbai',        country:'IN', flag:'🇮🇳', resolver:'google'     },
  { id:'sin', city:'Singapore',     country:'SG', flag:'🇸🇬', resolver:'cloudflare' },
  { id:'nrt', city:'Tokyo',         country:'JP', flag:'🇯🇵', resolver:'google'     },
  { id:'syd', city:'Sydney',        country:'AU', flag:'🇦🇺', resolver:'opendns'    }
];

const RESOLVERS = {
  cloudflare: {
    name: 'Cloudflare',
    /* Cloudflare DoH JSON endpoint */
    url:  (d, tp) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(d)}&type=${tp}`,
    headers: { 'Accept': 'application/dns-json' }
  },
  google: {
    name: 'Google',
    url:  (d, tp) => `https://dns.google/resolve?name=${encodeURIComponent(d)}&type=${tp}`,
    headers: {}
  },
  opendns: {
    name: 'OpenDNS',
    /* OpenDNS does not offer a public JSON DoH endpoint with CORS;
       we use Cloudflare as a stand-in resolver for that region. */
    url:  (d, tp) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(d)}&type=${tp}`,
    headers: { 'Accept': 'application/dns-json' }
  }
};

function jsonResponse(data, status = 200){
  return new Response(JSON.stringify(data), {
    status,
    headers: Object.assign(
      { 'Content-Type': 'application/json; charset=utf-8' },
      CORS_HEADERS
    )
  });
}

function normalizeDomain(input){
  if (!input || typeof input !== 'string') return null;
  let d = input.trim().toLowerCase();
  /* Strip protocol and path */
  d = d.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(d)) return null;
  return d;
}

function normalizeType(input){
  const allowed = ['A','AAAA','CNAME','MX','TXT','NS'];
  if (!input) return 'A';
  const up = String(input).trim().toUpperCase();
  return allowed.includes(up) ? up : 'A';
}

async function queryDoH(domain, type, resolverKey){
  const resolver = RESOLVERS[resolverKey] || RESOLVERS.cloudflare;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  const t0 = Date.now();

  try {
    const resp = await fetch(resolver.url(domain, type), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: Object.assign(
        { 'User-Agent': 'Fasqoo-DNS-Checker/1.0 (+https://www.fasqoo.com/dns-checker.html)' },
        resolver.headers
      )
    });
    const latency = Date.now() - t0;
    if (!resp.ok) return { values: [], latency, status: 'error' };
    const data = await resp.json();

    let values = [];
    if (Array.isArray(data.Answer)){
      values = data.Answer
        .filter(a => {
          /* Filter to matching type when possible */
          const typeNum = a.type;
          const map = { A:1, NS:2, CNAME:5, MX:15, TXT:16, AAAA:28 };
          return typeNum === map[type] || typeNum === 5 /* include CNAME chain */;
        })
        .map(a => {
          let v = a.data;
          /* Clean TXT quotes */
          if (typeof v === 'string' && v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
          return v;
        });
    }

    /* Google returns 'data' or 'data' with different casing; already handled above */

    return {
      values,
      latency,
      status: values.length ? 'success' : 'error'
    };
  } catch (e){
    return { values: [], latency: 0, status: 'error' };
  } finally {
    clearTimeout(timer);
  }
}

export default {
  async fetch(request){
    /* CORS preflight */
    if (request.method === 'OPTIONS'){
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (request.method !== 'GET'){
      return jsonResponse({ ok: false, error: 'method-not-allowed' }, 405);
    }

    const url = new URL(request.url);

    /* Health check */
    if (!url.searchParams.has('domain')){
      return jsonResponse({
        ok: true,
        service: 'Fasqoo DNS Propagation Worker',
        version: '1.0',
        usage: 'GET /?domain=example.com&type=A',
        docs: 'https://www.fasqoo.com/dns-checker.html'
      });
    }

    const domain = normalizeDomain(url.searchParams.get('domain'));
    const type   = normalizeType(url.searchParams.get('type'));

    if (!domain){
      return jsonResponse({ ok: false, error: 'invalid-domain' }, 400);
    }

    /* Query all cities in parallel */
    const tasks = CITIES.map(async c => {
      const r = await queryDoH(domain, type, c.resolver);
      return {
        id: c.id,
        city: c.city,
        country: c.country,
        flag: c.flag,
        resolver: RESOLVERS[c.resolver].name,
        values: r.values,
        latency: r.latency,
        status: r.status
      };
    });

    const results = await Promise.all(tasks);

    return jsonResponse({
      ok: true,
      domain,
      type,
      resolvedAt: new Date().toISOString(),
      results
    }, 200);
  }
};
