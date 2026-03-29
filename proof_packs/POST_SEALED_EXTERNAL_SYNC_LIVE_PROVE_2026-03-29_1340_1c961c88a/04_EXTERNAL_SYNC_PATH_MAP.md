# EXTERNAL SYNC PATH MAP

## Sync Architecture

```
UI → IPC → Option1SyncService → sync_now()
  → Check TURSO_DATABASE_URL
  → Check TURSO_AUTH_TOKEN
  → If missing: return SYNC_MISSING_CONFIG
  → If present: connect to Turso/LibSQL
  → Execute sync operations
  → Update sync metadata
  → Return SyncStatus
```

## Current State

- **Local Source**: Option1DbService (SQLite)
- **Sync Initiator**: Option1SyncService::sync_now()
- **Remote Target**: Turso/LibSQL (config absent)
- **Readback Path**: Not available (no connection)
- **Proof Source**: sync_service.rs:41-47

## Blocker

**TURSO_DATABASE_URL absent** — Cannot establish connection to remote.
**TURSO_AUTH_TOKEN absent** — Cannot authenticate to remote.

## Classification

**BLOCKED_ENV** — Sync path cannot be exercised without config.