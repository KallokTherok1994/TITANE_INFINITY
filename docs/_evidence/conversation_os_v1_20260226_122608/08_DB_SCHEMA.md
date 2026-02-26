# 08_DB_SCHEMA.md

Date (UTC): 2026-02-26

## Source
- `src-tauri/src/services/db_service.rs`

## Tables observées

### `events`
- Colonnes: `id`, `ts`, `session_id`, `kind`, `payload_json`, `sha256`
- Index: `idx_events_session`, `idx_events_ts`
- Contrat: append-only (insert)

### `snapshots`
- Colonnes: `id`, `ts`, `session_id`, `summary_fr`, `state_json`, `sha256`
- Index: `idx_snapshots_session`
- Contrat: append-only (insert)

### `provider_decisions`
- Colonnes: `id`, `ts`, `session_id`, `decision_json`, `sha256`
- Index: `idx_provider_decisions_session`
- Contrat: append-only (insert)

### `sources`
- Colonnes: `id`, `ts`, `session_id`, `provider`, `url`, `title`, `snippet`, `retrieved_at`, `sha256`
- Index: `idx_sources_session`
- Contrat: append-only (insert)

### `failures`
- Colonnes: `id`, `ts`, `session_id`, `class`, `detail_json`, `sha256`
- Index: `idx_failures_session`
- Contrat: append-only (insert)

## Intégrité
- Hash SHA256 par ligne persistance.
- Aucun chemin runtime UPDATE/DELETE observé dans le service.

