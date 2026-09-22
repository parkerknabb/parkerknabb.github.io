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
 
export default {
  async fetch(request) {
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
 
    // Fetch the ICS feed from the upstream server
    let upstream;
    try {
      upstream = await fetch(targetUrl, {
        headers: {
          // Mimic a calendar client so LeagueOS doesn't block the request
          'User-Agent': 'Mozilla/5.0 (compatible; CalendarFetch/1.0)',
          'Accept': 'text/calendar, application/ics, */*',
        },
        cf: { cacheTtl: 900 }, // Cache in Cloudflare edge for 15 min — keeps LeagueOS load down without going stale
      });
    } catch (err) {
      return new Response(`Upstream fetch failed: ${err.message}`, {
        status: 502,
        headers: corsHeaders(),
      });
    }
 
    if (!upstream.ok) {
      return new Response(`Upstream returned ${upstream.status}`, {
        status: 502,
        headers: corsHeaders(),
      });
    }
 
    const body = await upstream.text();
 
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Cache-Control': 'public, max-age=900',
        ...corsHeaders(),
      },
    });
  },
};
 
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
