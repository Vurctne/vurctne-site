-- /hotpot admin backend — D1 schema
-- Run once in Cloudflare D1 console after creating the database.
-- dash.cloudflare.com → Workers & Pages → D1 → <db> → Console → paste this whole file.

-- Every observable action by a viewer of /hotpot.
-- Action values:
--   auth              CF Access PIN succeeded (logged from Pages Function via CF headers)
--   decrypt-success   Correct password entered on the demo
--   decrypt-fail      Wrong password attempt
--   copy / cut        Copy or cut event in the demo
--   contextmenu       Right-click attempt
--   shortcut          Ctrl+C / Ctrl+S / F12 / etc.
--   dragstart         Drag-out attempt
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,                  -- epoch milliseconds (server time)
  email TEXT NOT NULL,                  -- from CF Access; "unknown" if missing
  action TEXT NOT NULL,
  detail TEXT,                          -- truncated content / keystroke / target
  ip TEXT,
  country TEXT,
  ua TEXT,
  referer TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts DESC);
CREATE INDEX IF NOT EXISTS idx_events_email_ts ON events(email, ts DESC);
CREATE INDEX IF NOT EXISTS idx_events_action_ts ON events(action, ts DESC);

-- Manually curated list of investors you've shared the password with.
-- The admin dashboard cross-references this with the events table to flag:
--   - Investors who haven't shown up yet (still pending)
--   - Viewers who showed up but aren't in this list (potential leaks)
CREATE TABLE IF NOT EXISTS investors (
  email TEXT PRIMARY KEY,
  added_at INTEGER NOT NULL,            -- epoch milliseconds
  note TEXT
);

-- Helpful one-row sanity check
INSERT INTO events (ts, email, action, detail, ip, country, ua, referer)
VALUES (strftime('%s','now') * 1000, 'system@vurctne', 'system-init', 'schema initialized', '-', '-', '-', '-');
