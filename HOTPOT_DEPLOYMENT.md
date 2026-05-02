# /hotpot deployment — handoff (v5: Worker + assets, D1 already provisioned)

> Investor demo at `vurctne.com/hotpot` with admin dashboard at `vurctne.com/hotpot/admin/`.
> This site is a **Cloudflare Worker + assets** project (NOT Pages). Functions live in `src/index.js`, not in a `functions/` tree.
> D1 database is already created and migrated via Cloudflare MCP.
> Updated 2026-05-02.

---

## Two passwords (save both)

| | Value |
|---|---|
| **Demo password** (share with investors) | `erg3-X9Xd-6bcn-AGc6-GSLw-Lctj` |
| **Admin password** (private — for `/hotpot/admin/`) | `bgkB-jtKM-yLNh-BHbd-uv7B-CrWK` |
| **Session secret** (paste into Worker secrets) | `0rU6WTpPT2Y4MbIJE79rzutMRo/gmG2Jsedkph/lxNc=` |

---

## What's already done (Claude via Cloudflare MCP)

- ✅ Created D1 database `vurctne-hotpot` (UUID `2774b690-97ff-4f40-a20d-188604c2644c`, APAC region)
- ✅ Ran schema: tables `events` + `investors` + 3 indexes
- ✅ Wrote `src/index.js` Worker entry (handles all dynamic routes)
- ✅ Updated `wrangler.jsonc` with `main`, `d1_databases` binding, `assets.binding` = `ASSETS`
- ✅ Built encrypted demo wrapper at `public/hotpot/index.NEW.html`
- ✅ Built admin login + dashboard pages at `public/hotpot/admin/`

## What you still need to do (3 things)

| Step | Approx time |
|---|---|
| 1. Set 2 Worker secrets via dashboard (or `wrangler secret put`) | 2 min |
| 2. Configure Cloudflare Access — 2 apps with Bypass on admin path | 6 min |
| 3. Local cleanup + git push | 1 min |

---

## Step 1 — Set Worker secrets

The MCP I'm using doesn't expose a secret-set tool, so this is dashboard or CLI.

**Option A — Dashboard:**

1. **dash.cloudflare.com** → **Workers & Pages** → click **vurctne-site**.
2. **Settings** → **Variables and Secrets** → **Add variable**.
3. Add two variables (Type = **Secret** for both):

   | Variable name | Value |
   |---|---|
   | `ADMIN_PASSWORD` | `bgkB-jtKM-yLNh-BHbd-uv7B-CrWK` |
   | `ADMIN_SESSION_SECRET` | `0rU6WTpPT2Y4MbIJE79rzutMRo/gmG2Jsedkph/lxNc=` |

4. Save. Cloudflare may auto-redeploy; if not, the next push picks them up.

**Option B — Wrangler CLI** (from `D:\Software\vurctne-site`):

```powershell
npx wrangler secret put ADMIN_PASSWORD
# paste: bgkB-jtKM-yLNh-BHbd-uv7B-CrWK
npx wrangler secret put ADMIN_SESSION_SECRET
# paste: 0rU6WTpPT2Y4MbIJE79rzutMRo/gmG2Jsedkph/lxNc=
```

## Step 2 — Cloudflare Access (2 applications)

dash.cloudflare.com → **Zero Trust** → **Access** → **Applications**.

### Application 1 — Demo (Allow allowlisted investors)

| Field | Value |
|---|---|
| Type | Self-hosted |
| Name | `Hotpot Investor Demo` |
| Session duration | `24 hours` |
| Domain | `vurctne.com` · Path `/hotpot/*` |
| Identity providers | One-time PIN |
| Policy: action | Allow |
| Policy: include | Selector **Emails** · paste investor emails |

### Application 2 — Admin (Bypass)

| Field | Value |
|---|---|
| Type | Self-hosted |
| Name | `Hotpot Admin` |
| Domain | `vurctne.com` · Path `/hotpot/admin/*` |
| Policy: action | **Bypass** |
| Policy: include | Selector **Everyone** |

Cloudflare evaluates the more specific path first, so `/hotpot/admin/*` hits App 2 (Bypass = no Access check) and the dashboard's own password gate handles auth. Other `/hotpot/*` paths still go through App 1.

## Step 3 — Local cleanup + push

PowerShell at `D:\Software\vurctne-site`:

```powershell
# 1. Replace old plaintext demo with new encrypted wrapper
Move-Item public\hotpot\index.NEW.html public\hotpot\index.html -Force

# 2. Remove orphan test file
Remove-Item public\hotpot\test-writable.txt -Force

# 3. Remove the dead functions/ directory (Pages-style functions don't apply on a Worker)
Remove-Item functions -Recurse -Force

# 4. Remove stale git lock
Remove-Item .git\index.lock -Force

# 5. Stage + commit + push
git add -A
git commit -m "Hotpot v5: encrypted demo + admin Worker (D1 + login + viewer dashboard)"
git push origin main
```

Cloudflare auto-deploys the Worker (including the new `src/index.js` and `wrangler.jsonc` bindings) in ~1–2 min.

## Step 4 — Smoke-test (~5 min)

### Demo path (incognito)

1. `https://vurctne.com/hotpot` → CF Access PIN page → enter allowlisted email → enter 6-digit PIN.
2. Dark password card → enter the **demo password**.
3. Demo loads with watermark of your authenticated email.
4. Try Ctrl+C → modal pops, event posts to `/api/copy-event` → row appears in D1.

### Admin path (separate incognito)

1. `https://vurctne.com/hotpot/admin/` → no CF Access challenge (Bypass) → Hotpot Admin login.
2. Enter the **admin password** → dashboard loads.
3. Stats show your demo session (visits=1, suspicious=N depending on what you tried).
4. Click "+ Add" to add yourself as an investor; refresh → status flips to Active.
5. Click "Events" on a viewer row → drawer with chronological event timeline.

### Negative tests

- Wrong demo password → "密码错误，请重试", no decrypt
- Wrong admin password → "密码错误"
- Non-allowlisted email at CF Access → blocked at edge, never sees the password page
- `curl https://vurctne.com/hotpot/admin/api/summary` (no cookie) → 401

---

## File map

| Path | What |
|---|---|
| `public/hotpot/index.NEW.html` | Encrypted demo wrapper (rename to `index.html` in step 3) |
| `public/hotpot/admin/index.html` | Admin login page (static) |
| `public/hotpot/admin/dashboard.html` | Admin dashboard UI (static) |
| `src/index.js` | **Worker entry** — routes `/api/copy-event`, `/hotpot/admin/login`, `/hotpot/admin/logout`, `/hotpot/admin/api/*` |
| `wrangler.jsonc` | Worker config: `main`, `d1_databases` binding (DB → vurctne-hotpot), `assets.binding` |
| `hotpot-d1-schema.sql` | Schema reference (already applied via MCP, kept for reference / re-runs) |
| `functions/` | **DEAD CODE** — Pages-Functions style, doesn't apply on a Worker. Delete in step 3. |

## Threat model

| Threat | Mitigated by |
|---|---|
| Random visitor on `/hotpot` | CF Access App 1 (Allow allowlisted) |
| Random visitor on `/hotpot/admin/` | Admin password + signed cookie |
| URL leaked to a non-investor | Access blocks at the edge before any byte served |
| At-rest leak (cache/CDN scrape) | AES-256-GCM ciphertext, no key in repo |
| Authorized investor saves the demo | Decrypted demo lives in iframe; obfuscated JS; per-viewer email watermark |
| Authorized investor copies content | Copy event written to D1; visible in admin dashboard |
| Stolen admin cookie | 8h expiry; HMAC-signed; HttpOnly + Secure + SameSite=Strict |
| Admin password brute force | 250–500 ms artificial delay per failed login |
| Determined adversary with phone camera | Watermark still attributes to specific investor email |

## Where data lives now

| What | Where |
|---|---|
| D1 database | `vurctne-hotpot` (UUID `2774b690-97ff-4f40-a20d-188604c2644c`) |
| Query D1 directly | dash.cloudflare.com → Workers & Pages → D1 → vurctne-hotpot → Console: `SELECT * FROM events ORDER BY ts DESC LIMIT 50;` |
| Worker runtime logs | dash.cloudflare.com → Workers & Pages → vurctne-site → Logs → Begin log stream |
| CF Access audit | dash.cloudflare.com → Zero Trust → Logs → Access |

## Rotation

**Admin password:** change `ADMIN_PASSWORD` secret value in dashboard → save (auto-redeploys). Existing sessions remain valid until expiry.

**Force-invalidate all sessions:** ALSO change `ADMIN_SESSION_SECRET`. Existing cookies will fail HMAC verification on next request.

**Demo password:** tell me "rotate hotpot password" — I regenerate, re-encrypt, and place a new `index.NEW.html`.

## Troubleshooting

**Admin login returns 503 "admin not configured"**
→ Secrets aren't set. Verify `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` exist in Worker variables (Type = Secret). After setting, push any commit to trigger a redeploy.

**Admin login returns 401 with right password**
→ The Worker may not have the new secret yet. Trigger a redeploy by pushing any small change (or use `wrangler deploy`).

**Demo skips CF Access**
→ App 1's path glob is wrong. Must be `/hotpot/*` exactly.

**Admin path redirects to CF Access PIN**
→ App 2 (Bypass) isn't taking precedence over App 1. Verify App 2's path `/hotpot/admin/*` is more specific than App 1's `/hotpot/*`. CF Access uses most-specific-path matching.

**Dashboard shows "D1 binding not configured"**
→ Worker hasn't redeployed since wrangler.jsonc change. Push any commit, or run `wrangler deploy`.

**Dashboard loads but no viewers appear**
→ The Worker is running but nobody has used the demo yet. Walk through the demo path once and refresh.

## Optional — gitignore this file

Add to `.gitignore`:
```
HOTPOT_DEPLOYMENT.md
```
