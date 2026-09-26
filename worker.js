/**
 * Fasqoo Header Analyzer – Cloudflare Worker
 * ---------------------------------------------------------------
 * Endpoint:  GET /?url=https%3A%2F%2Fexample.com
 * Antwort:   JSON { ok, url, status, headers: {...} }
 * CORS:      OPTIONS + GET erlaubt von jeder Origin.
 * ---------------------------------------------------------------
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Expose-Headers': '*',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin'
};

const USER_AGENT = 'Fasqoo-Header-Analyzer/1.0 (+https://www.fasqoo.com/security-checker.html)';

function jsonResponse(data, status = 200){
  return new Response(JSON.stringify(data), {
    status,
    headers: Object.assign(
      { 'Content-Type': 'application/json; charset=utf-8' },
      CORS_HEADERS
    )
  });
}

function normalizeTarget(input){
  if (!input || typeof input !== 'string') return null;
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.toString();
  } catch (e) {
    return null;
  }
}

async function fetchTargetHeaders(target, method){
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const resp = await fetch(target, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const finalUrl = resp.url || target;
    const headers = {};
    for (const [k, v] of resp.headers) {
      headers[k.toLowerCase()] = v;
    }

    return {
      ok: true,
      url: finalUrl,
      status: resp.status,
      statusText: resp.statusText,
      headers,
      method
    };
  } finally {
    clearTimeout(timeout);
  }
}

export default {
  async fetch(request){
    /* CORS preflight */
    if (request.method === 'OPTIONS'){
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    /* Only GET and HEAD allowed */
    if (request.method !== 'GET' && request.method !== 'HEAD'){
      return jsonResponse(
        { ok: false, error: 'method-not-allowed', message: 'Only GET and HEAD are supported.' },
        405
      );
    }

    const reqUrl = new URL(request.url);

    /* Health check without url param */
    if (!reqUrl.searchParams.has('url')){
      return jsonResponse({
        ok: true,
        service: 'Fasqoo Header Analyzer',
        version: '1.0',
        usage: 'Add ?url=https://example.com to fetch security headers.',
        docs: 'https://www.fasqoo.com/security-checker.html'
      });
    }

    const target = normalizeTarget(reqUrl.searchParams.get('url'));
    if (!target){
      return jsonResponse(
        { ok: false, error: 'invalid-url', message: 'The provided URL is invalid.' },
        400
      );
    }

    /* Try HEAD first, fall back to GET */
    let result = null;
    let lastError = null;

    try {
      result = await fetchTargetHeaders(target, 'HEAD');
    } catch (err){
      lastError = err;
    }

    if (!result || result.status >= 400 || Object.keys(result.headers).length < 3){
      try {
        result = await fetchTargetHeaders(target, 'GET');
        lastError = null;
      } catch (err){
        lastError = err;
      }
    }

    if (!result){
      const message = lastError && lastError.name === 'AbortError'
        ? 'The target did not respond within 12 seconds.'
        : 'The target could not be reached.';
      return jsonResponse(
        { ok: false, error: 'fetch-failed', message, target },
        502
      );
    }

    return jsonResponse({
      ok: true,
      url: result.url,
      requestedUrl: target,
      status: result.status,
      statusText: result.statusText,
      method: result.method,
      fetchedAt: new Date().toISOString(),
      headers: result.headers
    }, 200);
  }
};
