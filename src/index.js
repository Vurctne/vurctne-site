// vurctne-site Worker entry script.
// Static assets (public/) are served first; this Worker is only invoked for paths
// that don't match a static asset. Routes:
//
//   POST /api/unlock                                  — per-investor pw → identity + bundle key
//   POST /api/copy-event                              — beacon from /hotpot demo
//   POST /hotpot/admin/login                          — admin pw → cookie
//   POST|GET /hotpot/admin/logout                     — clear cookie
//   GET  /hotpot/admin/api/summary                    — dashboard data
//   GET  /hotpot/admin/api/events                     — paginated events
//   GET|POST|DELETE /hotpot/admin/api/investors       — investor CRUD (POST generates pw)
//   POST /hotpot/admin/api/investors/regenerate       — rotate one investor's pw
//   POST /hotpot/admin/api/investors/revoke           — revoke
//   POST /hotpot/admin/api/investors/restore          — un-revoke
//
// Required Worker secrets:
//   ADMIN_PASSWORD          — admin dashboard login
//   ADMIN_SESSION_SECRET    — HMAC for admin session cookie + demo tokens
//   BUNDLE_DECRYPT_KEY      — base64 of 32-byte AES-256-GCM key for the demo bundle

const COOKIE_NAME = 'vurctne_admin';
const COOKIE_PATH = '/hotpot/admin';
const ADMIN_SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000; // 8h
const DEMO_TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;   // 24h

const ALLOWED_ACTIONS = new Set([
  'unlock-success', 'unlock-fail',
  'copy', 'cut', 'contextmenu', 'shortcut', 'dragstart',
  'unknown'
]);

// ============================================================================
// Crypto / encoding helpers
// ============================================================================

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function bufToBase64Url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function bufToHex(buf) {
  const u8 = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < u8.length; i++) s += u8[i].toString(16).padStart(2, '0');
  return s;
}

async function sha256Hex(message) {
  const enc = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-256', enc);
  return bufToHex(hash);
}

async function hmacB64Url(secret, message, label) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode((label || '') + ':' + message));
  return bufToBase64Url(sig);
}

function randomToken(byteLen = 16) {
  const buf = new Uint8Array(byteLen);
  crypto.getRandomValues(buf);
  return bufToHex(buf);
}

// Friendly password generator: 12 chars, no ambiguous chars, dashed in 4-4-4 groups.
function generateInvestorPassword() {
  const ALPHA = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const buf = new Uint8Array(12);
  crypto.getRandomValues(buf);
  let raw = '';
  for (let i = 0; i < 12; i++) raw += ALPHA[buf[i] % ALPHA.length];
  return raw.match(/.{1,4}/g).join('-');
}

// Hash a pw for storage: salted SHA-256 (server-generated pw is high-entropy → no need for slow KDF)
async function hashInvestorPassword(password, saltHex) {
  return sha256Hex(saltHex + ':' + password);
}

// ============================================================================
// Admin session cookie
// ============================================================================

async function signAdminSession(secret, expiresAt) {
  const payload = String(expiresAt);
  const sig = await hmacB64Url(secret, payload, 'admin');
  return `${payload}.${sig}`;
}

async function verifyAdminSession(secret, token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const idx = token.indexOf('.');
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expectedSig = await hmacB64Url(secret, payload, 'admin');
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

function makeAdminSetCookie(token) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=${COOKIE_PATH}; HttpOnly; Secure; SameSite=Strict; Max-Age=${Math.floor(ADMIN_SESSION_LIFETIME_MS / 1000)}`;
}

function makeAdminClearCookie() {
  return `${COOKIE_NAME}=; Path=${COOKIE_PATH}; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

async function requireAdminAuth(request, env) {
  if (!env.ADMIN_SESSION_SECRET) return json({ error: 'admin not configured' }, 503);
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return json({ error: 'unauthenticated' }, 401);
  const session = await verifyAdminSession(env.ADMIN_SESSION_SECRET, token);
  if (!session) return json({ error: 'session invalid or expired' }, 401);
  return null;
}

// ============================================================================
// Demo token (sent in copy-event body) — HMAC-signed (investor_id, expires)
// ============================================================================

async function signDemoToken(secret, investorId, expiresAt) {
  const payload = `${investorId}.${expiresAt}`;
  const sig = await hmacB64Url(secret, payload, 'demo');
  return `${payload}.${sig}`;
}

async function verifyDemoToken(secret, token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [investorIdStr, expiresStr, sig] = parts;
  const expectedSig = await hmacB64Url(secret, `${investorIdStr}.${expiresStr}`, 'demo');
  if (!safeCompare(sig, expectedSig)) return null;
  const investorId = parseInt(investorIdStr, 10);
  const expiresAt = parseInt(expiresStr, 10);
  if (!Number.isFinite(investorId) || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;
  return { investorId, expiresAt };
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

function clamp(n, lo, hi) {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

// ============================================================================
// /api/unlock — per-investor password validation
// ============================================================================

async function handleUnlock(request, env) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  if (!env.DB) return json({ error: 'db not configured' }, 503);
  if (!env.BUNDLE_DECRYPT_KEY || !env.ADMIN_SESSION_SECRET) return json({ error: 'server not configured' }, 503);

  let body;
  try { body = await request.json(); } catch (_) { return json({ error: 'bad json' }, 400); }
  const submitted = String(body.password || '');

  // Pull all active investors. (For 5–20 investors this is trivially small.)
  // We can't index by hash directly because each investor has its own salt.
  const rows = await env.DB.prepare(
    'SELECT id, name, password_hash, password_salt FROM investors WHERE revoked_at IS NULL'
  ).all();

  let matched = null;
  for (const r of (rows.results || [])) {
    const computed = await hashInvestorPassword(submitted, r.password_salt);
    if (safeCompare(computed, r.password_hash)) { matched = r; break; }
  }

  // Always log the attempt (success or fail)
  const ip = request.headers.get('Cf-Connecting-Ip') || 'unknown';
  const country = request.headers.get('Cf-Ipcountry') || '?';
  const ua = (request.headers.get('User-Agent') || '').slice(0, 240);
  const referer = request.headers.get('Referer') || '-';
  const ts = Date.now();

  if (!matched) {
    // Log the failed attempt with no investor_id
    try {
      await env.DB.prepare(
        'INSERT INTO events (ts, investor_id, action, detail, ip, country, ua, referer) VALUES (?, NULL, ?, ?, ?, ?, ?, ?)'
      ).bind(ts, 'unlock-fail', '', ip, country, ua, referer).run();
    } catch (_) {}
    await new Promise(r => setTimeout(r, 200 + Math.floor(Math.random() * 200)));
    return json({ error: 'wrong password' }, 401);
  }

  // Success: log it
  try {
    await env.DB.prepare(
      'INSERT INTO events (ts, investor_id, action, detail, ip, country, ua, referer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(ts, matched.id, 'unlock-success', '', ip, country, ua, referer).run();
  } catch (_) {}

  // Issue a demo token (signed) — expires in 24h. Wrapper sends it back with each copy event.
  const expiresAt = ts + DEMO_TOKEN_LIFETIME_MS;
  const demoToken = await signDemoToken(env.ADMIN_SESSION_SECRET, matched.id, expiresAt);

  return json({
    ok: true,
    investor_id: matched.id,
    investor_name: matched.name,
    demo_token: demoToken,
    bundle_key: env.BUNDLE_DECRYPT_KEY
  });
}

// ============================================================================
// /api/copy-event
// ============================================================================

async function handleCopyEvent(request, env) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let payload = {};
  try { payload = await request.json(); } catch (_) { return new Response(null, { status: 204 }); }

  // Verify the demo token to get investor_id (untamperable without the HMAC secret)
  let investorId = null;
  if (env.ADMIN_SESSION_SECRET) {
    const verified = await verifyDemoToken(env.ADMIN_SESSION_SECRET, payload.demo_token);
    if (verified) investorId = verified.investorId;
  }

  let action = String(payload.action || 'unknown').slice(0, 40).toLowerCase();
  if (!ALLOWED_ACTIONS.has(action)) action = 'unknown';
  const detail = String(payload.detail || '').slice(0, 240);
  const ip = request.headers.get('Cf-Connecting-Ip') || 'unknown';
  const country = request.headers.get('Cf-Ipcountry') || '?';
  const ua = (request.headers.get('User-Agent') || '').slice(0, 240);
  const referer = request.headers.get('Referer') || '-';
  const ts = Date.now();

  console.log(JSON.stringify({
    tag: 'HOTPOT_COPY_EVENT',
    ts: new Date(ts).toISOString(),
    investor_id: investorId, action, detail, ip, country, ua, referer
  }));

  if (env.DB) {
    try {
      await env.DB.prepare(
        'INSERT INTO events (ts, investor_id, action, detail, ip, country, ua, referer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(ts, investorId, action, detail, ip, country, ua, referer).run();
    } catch (e) { console.error('D1 insert failed:', e && e.message); }
  }

  return new Response(null, { status: 204 });
}

// ============================================================================
// Admin login / logout
// ============================================================================

async function handleAdminLogin(request, env) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) return json({ error: 'admin not configured' }, 503);

  let body;
  try { body = await request.json(); } catch (_) { return json({ error: 'bad json' }, 400); }
  const submitted = String(body.password || '');
  if (!safeCompare(submitted, String(env.ADMIN_PASSWORD))) {
    await new Promise(r => setTimeout(r, 250 + Math.floor(Math.random() * 250)));
    return json({ error: 'wrong password' }, 401);
  }

  const expiresAt = Date.now() + ADMIN_SESSION_LIFETIME_MS;
  const token = await signAdminSession(env.ADMIN_SESSION_SECRET, expiresAt);
  return json({ ok: true, expiresAt }, 200, { 'Set-Cookie': makeAdminSetCookie(token) });
}

async function handleAdminLogout(request) {
  if (request.method === 'GET') {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/hotpot/admin/',
        'Set-Cookie': makeAdminClearCookie(),
        'Cache-Control': 'no-store'
      }
    });
  }
  return json({ ok: true }, 200, { 'Set-Cookie': makeAdminClearCookie() });
}

// ============================================================================
// Admin: summary, events, investors
// ============================================================================

async function handleSummary(request, env) {
  if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });
  const unauthed = await requireAdminAuth(request, env);
  if (unauthed) return unauthed;
  if (!env.DB) return json({ error: 'db not configured' }, 503);

  const now = Date.now();
  const since24h = now - 24 * 60 * 60 * 1000;

  const totalsRows = await env.DB.batch([
    env.DB.prepare(`SELECT COUNT(DISTINCT investor_id) AS c FROM events WHERE investor_id IS NOT NULL`),
    env.DB.prepare(`SELECT COUNT(*) AS c FROM events`),
    env.DB.prepare(`SELECT COUNT(*) AS c FROM events WHERE ts >= ?`).bind(since24h),
    env.DB.prepare(`SELECT COUNT(*) AS c FROM events WHERE action IN ('copy','cut','contextmenu','shortcut','dragstart','unlock-fail')`)
  ]);

  const totals = {
    viewers: totalsRows[0].results[0]?.c || 0,
    events: totalsRows[1].results[0]?.c || 0,
    events_24h: totalsRows[2].results[0]?.c || 0,
    suspicious: totalsRows[3].results[0]?.c || 0
  };

  // Per-investor rollup with activity
  const investorsRes = await env.DB.prepare(`
    SELECT
      i.id, i.name, i.note, i.added_at, i.revoked_at,
      (SELECT COUNT(*) FROM events e WHERE e.investor_id = i.id AND e.action='unlock-success') AS visits,
      (SELECT COUNT(*) FROM events e WHERE e.investor_id = i.id AND e.action IN ('copy','cut','contextmenu','shortcut','dragstart')) AS suspicious,
      (SELECT MIN(ts) FROM events e WHERE e.investor_id = i.id) AS first_seen,
      (SELECT MAX(ts) FROM events e WHERE e.investor_id = i.id) AS last_seen,
      (SELECT country FROM events e WHERE e.investor_id = i.id ORDER BY ts DESC LIMIT 1) AS country
    FROM investors i
    ORDER BY i.added_at DESC
  `).all();

  const investors = (investorsRes.results || []).map(r => ({
    ...r,
    status: r.revoked_at ? 'revoked' : (r.visits > 0 ? 'active' : 'pending')
  }));

  // Recent unattributed unlock-fail events (might indicate guessing attempts)
  const failsRes = await env.DB.prepare(`
    SELECT id, ts, ip, country, ua FROM events
    WHERE action = 'unlock-fail' AND ts >= ?
    ORDER BY ts DESC LIMIT 20
  `).bind(since24h).all();

  return json({
    totals,
    investors,
    recent_unlock_fails: failsRes.results || [],
    server_time: now
  });
}

async function handleEvents(request, env) {
  if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });
  const unauthed = await requireAdminAuth(request, env);
  if (unauthed) return unauthed;
  if (!env.DB) return json({ error: 'db not configured' }, 503);

  const url = new URL(request.url);
  const investorId = url.searchParams.get('investor_id');
  const action = url.searchParams.get('action') || '';
  const limit = clamp(parseInt(url.searchParams.get('limit') || '200', 10), 1, 500);
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));

  const where = []; const args = [];
  if (investorId) { where.push('e.investor_id = ?'); args.push(parseInt(investorId, 10)); }
  if (action) { where.push('e.action = ?'); args.push(action); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const totalRes = await env.DB.prepare(`SELECT COUNT(*) AS c FROM events e ${whereClause}`).bind(...args).all();
  const total = totalRes.results[0]?.c || 0;

  const eventsRes = await env.DB.prepare(
    `SELECT e.id, e.ts, e.investor_id, e.action, e.detail, e.ip, e.country, e.ua, e.referer,
            (SELECT name FROM investors WHERE id = e.investor_id) AS investor_name
     FROM events e
     ${whereClause}
     ORDER BY e.ts DESC LIMIT ? OFFSET ?`
  ).bind(...args, limit, offset).all();

  return json({
    events: eventsRes.results || [],
    total, limit, offset,
    has_more: offset + (eventsRes.results || []).length < total
  });
}

async function handleInvestors(request, env) {
  const unauthed = await requireAdminAuth(request, env);
  if (unauthed) return unauthed;
  if (!env.DB) return json({ error: 'db not configured' }, 503);

  if (request.method === 'GET') {
    const r = await env.DB.prepare(
      'SELECT id, name, note, added_at, revoked_at FROM investors ORDER BY added_at DESC'
    ).all();
    return json({ investors: r.results || [] });
  }

  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch (_) { return json({ error: 'bad json' }, 400); }
    const name = String(body.name || '').trim().slice(0, 80);
    const note = String(body.note || '').trim().slice(0, 240);
    if (!name) return json({ error: 'name required' }, 400);

    // Generate password + salt + hash
    const password = generateInvestorPassword();
    const saltHex = randomToken(16);
    const passwordHash = await hashInvestorPassword(password, saltHex);

    try {
      const ins = await env.DB.prepare(
        'INSERT INTO investors (name, note, password_hash, password_salt, added_at, revoked_at) VALUES (?, ?, ?, ?, ?, NULL)'
      ).bind(name, note, passwordHash, saltHex, Date.now()).run();
      const newId = ins.meta && ins.meta.last_row_id;
      // Return password ONCE (never stored in plaintext anywhere)
      return json({ ok: true, id: newId, name, note, password });
    } catch (e) {
      if (String(e && e.message).includes('UNIQUE')) return json({ error: 'name already exists' }, 409);
      return json({ error: 'insert failed' }, 500);
    }
  }

  if (request.method === 'DELETE') {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '', 10);
    if (!Number.isFinite(id)) return json({ error: 'missing id' }, 400);
    // Orphan related events first (D1 enforces FKs, so direct DELETE would fail).
    // We keep events for audit trail; just clear the investor link.
    await env.DB.prepare('UPDATE events SET investor_id = NULL WHERE investor_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM investors WHERE id = ?').bind(id).run();
    return json({ ok: true });
  }

  return new Response('Method Not Allowed', { status: 405 });
}

async function handleInvestorRegenerate(request, env) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const unauthed = await requireAdminAuth(request, env);
  if (unauthed) return unauthed;
  if (!env.DB) return json({ error: 'db not configured' }, 503);

  let body;
  try { body = await request.json(); } catch (_) { return json({ error: 'bad json' }, 400); }
  const id = parseInt(body.id, 10);
  if (!Number.isFinite(id)) return json({ error: 'missing id' }, 400);

  const password = generateInvestorPassword();
  const saltHex = randomToken(16);
  const passwordHash = await hashInvestorPassword(password, saltHex);

  const r = await env.DB.prepare(
    'UPDATE investors SET password_hash = ?, password_salt = ?, revoked_at = NULL WHERE id = ?'
  ).bind(passwordHash, saltHex, id).run();
  if (!r.meta || r.meta.changes === 0) return json({ error: 'not found' }, 404);
  return json({ ok: true, id, password });
}

async function handleInvestorRevoke(request, env, revoke) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const unauthed = await requireAdminAuth(request, env);
  if (unauthed) return unauthed;
  if (!env.DB) return json({ error: 'db not configured' }, 503);

  let body;
  try { body = await request.json(); } catch (_) { return json({ error: 'bad json' }, 400); }
  const id = parseInt(body.id, 10);
  if (!Number.isFinite(id)) return json({ error: 'missing id' }, 400);

  const r = await env.DB.prepare(
    'UPDATE investors SET revoked_at = ? WHERE id = ?'
  ).bind(revoke ? Date.now() : null, id).run();
  if (!r.meta || r.meta.changes === 0) return json({ error: 'not found' }, 404);
  return json({ ok: true });
}

// ============================================================================
// Router
// ============================================================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/api/unlock') return await handleUnlock(request, env);
      if (path === '/api/copy-event') return await handleCopyEvent(request, env);

      if (path === '/hotpot/admin/login') return await handleAdminLogin(request, env);
      if (path === '/hotpot/admin/logout') return await handleAdminLogout(request);

      if (path === '/hotpot/admin/api/summary') return await handleSummary(request, env);
      if (path === '/hotpot/admin/api/events') return await handleEvents(request, env);
      if (path === '/hotpot/admin/api/investors') return await handleInvestors(request, env);
      if (path === '/hotpot/admin/api/investors/regenerate') return await handleInvestorRegenerate(request, env);
      if (path === '/hotpot/admin/api/investors/revoke') return await handleInvestorRevoke(request, env, true);
      if (path === '/hotpot/admin/api/investors/restore') return await handleInvestorRevoke(request, env, false);

      // Defer to ASSETS so the configured 404 page is served for unmatched paths
      if (env.ASSETS) return await env.ASSETS.fetch(request);
      return new Response('Not Found', { status: 404 });
    } catch (e) {
      console.error('Worker error:', e && e.stack);
      return json({ error: 'internal error' }, 500);
    }
  }
};
