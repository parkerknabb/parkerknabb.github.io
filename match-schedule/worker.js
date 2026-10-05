/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const ALLOWED_ORIGIN = 'https://parkerknabb.com'
 
// Whitelist of upstream hosts this worker will proxy — prevents open-relay abuse
const ALLOWED_UPSTREAM_HOSTS = [
  'api.leagueos.gg',
];
 
const FRESH_MS = 5 * 60 * 1000;   // older than this -> refresh in background
const KEEP_S = 24 * 60 * 60;      // keep stale copy a day as a fallback

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }
 
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
 
    if (!targetUrl) {
      return new Response('Missing ?url= parameter', { status: 400, headers: corsHeaders() });
    }
 
    // Validate upstream host
    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return new Response('Invalid URL', { status: 400, headers: corsHeaders() });
    }
 
    if (!ALLOWED_UPSTREAM_HOSTS.includes(parsed.hostname)) {
      return new Response(`Upstream host not allowed: ${parsed.hostname}`, {
        status: 403,
        headers: corsHeaders(),
      });
    }
 
    // Stale-while-revalidate: LeagueOS takes 12-15s to respond, so serve whatever
    // is in the edge cache immediately and refresh it in the background.
    const cache = caches.default;
    const cacheKey = new Request(parsed.toString());
    const cached = await cache.match(cacheKey);

    if (cached) {
      const age = Date.now() - Number(cached.headers.get('X-Fetched-At') || 0);
      if (age > FRESH_MS) ctx.waitUntil(refresh(cache, cacheKey, parsed.toString()).catch(() => {}));
      return icsResponse(await cached.text(), 'HIT');
    }

    // Cold cache: no choice but to wait on the upstream
    let body;
    try {
      body = await refresh(cache, cacheKey, parsed.toString());
    } catch (err) {
      return new Response(err.message, { status: 502, headers: corsHeaders() });
    }
    return icsResponse(body, 'MISS');
  },
};

async function refresh(cache, cacheKey, targetUrl) {
  const upstream = await fetch(targetUrl, {
    headers: {
      // Mimic a calendar client so LeagueOS doesn't block the request
      'User-Agent': 'Mozilla/5.0 (compatible; CalendarFetch/1.0)',
      'Accept': 'text/calendar, application/ics, */*',
    },
  });
  if (!upstream.ok) throw new Error(`Upstream returned ${upstream.status}`);
  const body = await upstream.text();
  if (!body.includes('BEGIN:VCALENDAR')) throw new Error('Upstream returned non-ICS body');
  await cache.put(cacheKey, new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': `public, max-age=${KEEP_S}`,
      'X-Fetched-At': String(Date.now()),
    },
  }));
  return body;
}

function icsResponse(body, status) {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Worker-Cache': status,
      'Access-Control-Expose-Headers': 'X-Worker-Cache',
      ...corsHeaders(),
    },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
