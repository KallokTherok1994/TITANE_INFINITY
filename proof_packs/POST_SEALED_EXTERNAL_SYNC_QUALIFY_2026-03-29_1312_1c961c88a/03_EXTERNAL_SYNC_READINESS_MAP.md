# 03_EXTERNAL_SYNC_READINESS_MAP

## Required Prerequisites for External Sync

| Prerequisite | Required | Present | Status |
|---|---|---|---|
| TURSO_DATABASE_URL | YES | NO | BLOCKED |
| TURSO_AUTH_TOKEN | YES | NO | BLOCKED |
| Sync mode = auto | Optional | NO | BLOCKED |
| External service endpoint | YES | NO | BLOCKED |

## Option1SyncService Contract
From `proof_packs/POST_SEALED_LOCAL_PERSISTENCE_CANON_2026-03-28_1407_e88264039/07_LOCAL_PERSISTENCE_SPINE_SPEC.md`:

> Sync completion: Option1SyncService `sync_now` requires `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`, otherwise `SYNC_MISSING_CONFIG` and last_sync_ok=false.

## SyncConfig UI Status
From `src/pages/CloudCenter/SyncConfig.tsx`:

> "La synchronisation automatique reste non prouvée en runtime dans cette build. Utilisez Push/Pull manuel."

- Auto sync: disabled in UI
- Manual sync: available (local_folder, s3_private backends)
- P2P: not available

## Classification
**BLOCKED_ENV** — required environment variables absent.
