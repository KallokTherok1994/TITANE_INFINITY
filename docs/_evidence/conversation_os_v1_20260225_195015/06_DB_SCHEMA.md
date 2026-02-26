# 06_DB_SCHEMA.md

## Moteur
- SQLite via `rusqlite`
- Service: `src-tauri/src/services/db_service.rs`

## Tables

### `events` (append-only)
- `id TEXT PRIMARY KEY`
- `ts INTEGER NOT NULL`
- `session_id TEXT NOT NULL`
- `kind TEXT NOT NULL`
- `payload_json TEXT NOT NULL`
- `sha256 TEXT NOT NULL`
- Index: `idx_events_session(session_id, ts)`, `idx_events_ts(ts)`

### `snapshots`
- `id TEXT PRIMARY KEY`
- `ts INTEGER NOT NULL`
- `session_id TEXT NOT NULL`
- `summary_fr TEXT NOT NULL`
- `state_json TEXT NOT NULL`
- `sha256 TEXT NOT NULL`
- Index: `idx_snapshots_session(session_id, ts DESC)`

### `provider_decisions`
- `id TEXT PRIMARY KEY`
- `ts INTEGER NOT NULL`
- `session_id TEXT NOT NULL`
- `decision_json TEXT NOT NULL`
- `sha256 TEXT NOT NULL`
- Index: `idx_provider_decisions_session(session_id, ts)`

### `sources`
- `id TEXT PRIMARY KEY`
- `ts INTEGER NOT NULL`
- `session_id TEXT NOT NULL`
- `provider TEXT NOT NULL`
- `url TEXT NOT NULL`
- `title TEXT NOT NULL`
- `snippet TEXT NOT NULL`
- `retrieved_at INTEGER NOT NULL`
- `sha256 TEXT NOT NULL`
- Index: `idx_sources_session(session_id, ts)`

### `failures`
- `id TEXT PRIMARY KEY`
- `ts INTEGER NOT NULL`
- `session_id TEXT NOT NULL`
- `class TEXT NOT NULL`
- `detail_json TEXT NOT NULL`
- `sha256 TEXT NOT NULL`
- Index: `idx_failures_session(session_id, ts)`

## Intégrité
- Hash SHA256 calculé pour chaque payload (helpers `create_*` + `compute_sha256`).
- API runtime expose uniquement des méthodes d’insertion append-only.
- Aucun chemin runtime `UPDATE/DELETE` documenté dans le service.
