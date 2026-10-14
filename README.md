# Lattice Vault UI (prototype, step 1)

Local, read-only web UI for a Lattice Vault SQLite DB. Python stdlib only (http.server + sqlite3), no build step.
Reuses `vault.py` from a sibling `lattice-vault` (or `lattice-vault-release`) checkout; override with `VAULT_SRC`.

## Clone (on your machine)
```sh
git clone https://github.com/keremtalhaoral/lattice-vault.git
git clone https://github.com/keremtalhaoral/lattice-vault-ui.git
# folders must be siblings: lattice-vault/ and lattice-vault-ui/
```

`server.py` imports `vault.py` from `../lattice-vault` or `../lattice-vault-release` by default (override with `VAULT_SRC=/path/to/vault`).

## Run
```sh
python3 ../lattice-vault/examples/seed.py demo                # synthetic demo DB -> demo/vault.db
VAULT_DB=demo/vault.db python3 server.py                      # or: python3 server.py --db demo/vault.db [--port 8765]
# open http://127.0.0.1:8765/
python3 -m unittest test_api                                  # tests (seed a temp DB)
```

- Binds 127.0.0.1 only; DB opened with `file:...?mode=ro` per request; POST returns 405.
- `GET /api/events?status=&trust=&limit=&offset=` newest first (HLC order). status: proposed|active|rejected|reverted; trust: verified|agent|unverified.
- `GET /api/search?q=` uses `vault.search()` (FTS5 + Turkish `tr_norm`).
- Encrypted payload fields show as `[encrypted]`, redacted events as `[redacted]` (no decryption in the UI).

## Plan
2. **Approve flow** (human-only): either a CLI delegate (UI shows the `vault review <id>` command) or a localhost-only POST guarded by an owner session (one-time token printed to the terminal at startup), CSRF token, Origin/Host checks; separate RW connection; writes via `vault.review()` only. Agents never get this path. Later: Ed25519-signed approvals.
3. **Event detail & corrections**: `/api/events/<id>` with parents/targets, history (`vault.get_history`), correction form (human, same guards as step 2).
4. **Pack export**: preview/download `vault.pack()` by profile, with unverified items clearly marked/excluded by default.
