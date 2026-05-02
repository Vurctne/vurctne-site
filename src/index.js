// vurctne-site Worker entry script.
// Static assets (public/) are served first by the Workers runtime; this script
// is invoked only for paths that don't match a static asset. We handle:
//
//   POST /api/copy-event                         — beacon from /hotpot demo
//   POST /hotpot/admin/login                     — admin password → cookie
//   POST|GET /hotpot/admin/logout                — clear cookie
//   GET  /hotpot/admin/api/summary               — dashboard data
//   GET  /hotpot/admin/api/events                — paginated events
//   GET|POST|DELETE /hotpot/admin/api/investors  — manual investor list CRUD
//
// Anything else → 404 (we do not re-invoke env.ASSETS because static assets already had first chance).

// ============================================================================
// Constants
// ============================================================================

const COOKIE_NAME = 'vurctne_admin';
const COOKIE_PATH = '/hotpot/admin';
const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000; // 8 hours

const ALLOWED_ACTIONS = new Set([
  'decrypt-success', 'decrypt-fail',
  'copy', 'cut', 'contextmenu', 'shortcut', 'dragstart',
  'unknown'
]);

const SUSPICIOUS_ACTIONS = ['copy', 'cut', 'contextmenu', 'shortcut', 'dragstart', 'decrypt-fail'];

// ============================================================================
// Auth helpers (HMAC-SHA256 signed cookies)
// ============================================================================

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function b64urlEncode(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return b64urlEncode(sig);
}

async function signSession(secret, expiresAt) {
  const payload = String(expiresAt);
  const sig = await hmac(secret, payload);
  return `${payload}.${sig}`;
}

async function verifySession(secret, token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const idx = token.indexOf('.');
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expectedSig = await hmac(secret, payload);
  if (!safeCompare(sig, expectedSig)) return null;
  const expiresAt = parseInt(payload, 10);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;
  return { expiresAt };
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const k = part.slice(0, eq).trim();
    if (k === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}

function makeSetCookie(token) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=${COOKIE_PATH}; HttpOnly; Secure; SameSite=Strict; Max-Age=${Math.floor(SESSION_LIFETIME_MS / 1000)}`;
}

function makeClearCookie() {
  return `${COOKIE_NAME}=; Path=${COOKIE_PATH}; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

async function requireAuth(request, env) {
  if (!env.ADMIN_SESSION_SECRET) return json({ error: 'admin not configured' }, 503);
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return json({ error: 'unauthenticated' }, 401);
  const session = await verifySession(env.ADMIN_SESSION_SECRET, token);
  if (!session) return json({ error: 'session invalid or expired' }, 401);
  return null;
}

// ============================================================================
// JSON helper
// ============================================================================

function json(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...extraHeaders
    }
  });
}

// ============================================================================
// Handlers
// ============================================================================

async function handleCopyEvent(request, env) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let payload = {};
  try { payload = await request.json(); } catch (_) { return new Response(null, { status: 204 }); }

  const cfEmail = request.headers.get('Cf-Access-Authenticated-User-Email')
              || request.headers.get('cf-access-authenticated-user-email')
              || payload.email
              || 'unknown';
  const ip = request.headers.get('Cf-Connecting-Ip') || 'unknown';
  const country = request.headers.get('Cf-Ipcountry') || '?';
  const ua = (request.headers.get('User-Agent') || '').slice(0, 240);
  const referer = request.headers.get('Referer') || '-';

  let action = String(payload.action || 'unknown').slice(0, 40).toLowerCase();
  if (!ALLOWED_ACTIONS.has(action)) action = 'unknown';
  const detail = String(payload.detail || '').slice(0, 240);
  const ts = Date.now();

  console.log(JSON.stringify({
    tag: 'HOTPOT_COPY_EVENT',
    ts: new Date(ts).toISOString(),
    email: cfEmail, action, detail, ip, country, ua, referer
  }));

  if (env.DB) {
    try {
      await env.DB.prepare(
        'INSERT INTO events (ts, email, action, detail, ip, country, ua, referer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(ts, cfEmail, action, detail, ip, country, ua, referer).run();
    } catch (e) { console.error('D1 insert failed:', e && e.message); }
  }

  return new Response(null, { status: 204 });
}

async function handleAdminLogin(request, env) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
    return json({ error: 'admin not configured' }, 503);
  }

  let body;
  try { body = await request.json(); } catch (_) { return json({ error: 'bad json' }, 400); }

  const submitted = String(body.password || '');
  if (!safeCompare(submitted, String(env.ADMIN_PASSWORD))) {
    await new Promise(r => setTimeout(r, 250 + Math.floor(Math.random() * 250)));
    return json({ error: 'wrong password' }, 401);
  }

  const expiresAt = Date.now() + SESSION_LIFETIME_MS;
  const token = await signSession(env.ADMIN_SESSION_SECRET, expiresAt);
  return json({ ok: true, expiresAt }, 200, { 'Set-Cookie': makeSetCookie(token) });
}

async function handleAdminLogout(request) {
  if (request.method === 'GET') {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/hotpot/admin/',
        'Set-Cookie': makeClearCookie(),
        'Cache-Control': 'no-store'
      }
    });
  }
  return json({ ok: true }, 200, { 'Set-Cookie': makeClearCookie() });
}

async function handleSummary(request, env) {
  if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });
  const unauthed = await requireAuth(request, env);
  if (unauthed) return unauthed;
  if (!env.DB) return json({ error: 'D1 binding "DB" not configured' }, 503);

  const now = Date.now();
  const since24h = now - 24 * 60 * 60 * 1000;

  const totalsRows = await env.DB.batch([
    env.DB.prepare(`SELECT COUNT(DISTINCT email) AS c FROM events WHERE email != 'unknown'`),
    env.DB.prepare(`SELECT COUNT(*) AS c FROM events`),
    env.DB.prepare(`SELECT COUNT(*) AS c FROM events WHERE ts >= ?`).bind(since24h),
    env.DB.prepare(`SELECT COUNT(*) AS c FROM events WHERE action IN ('copy','cut','contextmenu','shortcut','dragstart','decrypt-fail')`)
  ]);
  const totals = {
    viewers: totalsRows[0].results[0]?.c || 0,
    events: totalsRows[1].results[0]?.c || 0,
    events_24h: totalsRows[2].results[0]?.c || 0,
    suspicious: totalsRows[3].results[0]?.c || 0
  };

  const viewersRes = await env.DB.prepare(`
    SELECT
      email,
      MIN(ts) AS first_seen,
      MAX(ts) AS last_seen,
      COUNT(*) AS total_events,
      SUM(CASE WHEN action='decrypt-success' THEN 1 ELSE 0 END) AS visits,
      SUM(CASE WHEN action IN ('copy','cut','contextmenu','shortcut','dragstart','decrypt-fail') THEN 1 ELSE 0 END) AS suspicious,
      (SELECT country FROM events e2 WHERE e2.email = events.email ORDER BY ts DESC LIMIT 1) AS country
    FROM events
    WHERE email != 'unknown'
    GROUP BY email
    ORDER BY last_seen DESC
  `).all();
  const viewers = viewersRes.results || [];

  const investorsRes = await env.DB.prepare(`SELECT email, added_at, note FROM investors ORDER BY added_at DESC`).all();
  const investors = investorsRes.results || [];

  const invSet = new Set(investors.map(i => i.email.toLowerCase()));
  const annotatedViewers = viewers.map(v => {
    const inList = invSet.has((v.email || '').toLowerCase());
    const matchedInvestor = investors.find(i => i.email.toLowerCase() === (v.email || '').toLowerCase());
    return { ...v, in_investor_list: inList, note: matchedInvestor ? matchedInvestor.note : null };
  });

  const viewerByEmail = Object.fromEntries(viewers.map(v => [v.email.toLowerCase(), v]));
  const annotatedInvestors = investors.map(i => {
    const v = viewerByEmail[i.email.toLowerCase()];
    return { ...i, active: !!v, visits: v ? v.visits : 0, last_seen: v ? v.last_seen : null };
  });

  const leaks = annotatedViewers.filter(v => !v.in_investor_list);

  return json({ totals, viewers: annotatedViewers, investors: annotatedInvestors, leaks, server_time: now });
}

async function handleEvents(request, env) {
  if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });
  const unauthed = await requireAuth(request, env);
  if (unauthed) return unauthed;
  if (!env.DB) return json({ error: 'D1 binding "DB" not configured' }, 503);

  const url = new URL(request.url);
  const email = url.searchParams.get('email') || '';
  const action = url.searchParams.get('action') || '';
  const limit = clamp(parseInt(url.searchParams.get('limit') || '200', 10), 1, 500);
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));

  const where = []; const args = [];
  if (email) { where.push('email = ?'); args.push(email); }
  if (action) { where.push('action = ?'); args.push(action); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const totalRes = await env.DB.prepare(`SELECT COUNT(*) AS c FROM events ${whereClause}`).bind(...args).all();
  const total = totalRes.results[0]?.c || 0;

  const eventsRes = await env.DB.prepare(
    `SELECT id, ts, email, action, detail, ip, country, ua, referer FROM events ${whereClause} ORDER BY ts DESC LIMIT ? OFFSET ?`
  ).bind(...args, limit, offset).all();

  return json({
    events: eventsRes.results || [],
    total, limit, offset,
    has_more: offset + (eventsRes.results || []).length < total
  });
}

async function handleInvestors(request, env) {
  const unauthed = await requireAuth(request, env);
  if (unauthed) return unauthed;
  if (!env.DB) return json({ error: 'D1 binding "DB" not configured' }, 503);

  if (request.method === 'GET') {
    const r = await env.DB.prepare('SELECT email, added_at, note FROM investors ORDER BY added_at DESC').all();
    return json({ investors: r.results || [] });
  }

  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch (_) { return json({ error: 'bad json' }, 400); }
    const email = String(body.email || '').trim().toLowerCase();
    const note = String(body.note || '').trim().slice(0, 240);
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'invalid email' }, 400);
    if (email.length > 240) return json({ error: 'email too long' }, 400);
    await env.DB.prepare(
      `INSERT INTO investors (email, added_at, note) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET note = excluded.note`
    ).bind(email, Date.now(), note).run();
    return json({ ok: true, email, note });
  }

  if (request.method === 'DELETE') {
    const url = new URL(request.url);
    const email = (url.searchParams.get('email') || '').trim().toLowerCase();
    if (!email) return json({ error: 'missing email' }, 400);
    await env.DB.prepare('DELETE FROM investors WHERE email = ?').bind(email).run();
    return json({ ok: true });
  }

  return new Response('Method Not Allowed', { status: 405 });
}

function clamp(n, lo, hi) {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

// ============================================================================
// Router
// ============================================================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/api/copy-event') return await handleCopyEvent(request, env);
      if (path === '/hotpot/admin/login') return await handleAdminLogin(request, env);
      if (path === '/hotpot/admin/logout') return await handleAdminLogout(request);
      if (path === '/hotpot/admin/api/summary') return await handleSummary(request, env);
      if (path === '/hotpot/admin/api/events') return await handleEvents(request, env);
      if (path === '/hotpot/admin/api/investors') return await handleInvestors(request, env);

      // Path didn't match a dynamic route. Defer to ASSETS so the configured
      // not_found_handling ("404-page") serves /public/404.html.
      if (env.ASSETS) return await env.ASSETS.fetch(request);
      return new Response('Not Found', { status: 404 });
    } catch (e) {
      console.error('Worker error:', e && e.stack);
      return json({ error: 'internal error' }, 500);
    }
  }
};
