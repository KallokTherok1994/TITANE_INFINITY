# EXTERNAL SYNC RUNTIME PROOF SPEC

## Purpose

Verify external sync runtime by exercising the sync path with real Turso/LibSQL config.

## Required Config

- TURSO_DATABASE_URL: libsql://your-database.turso.io
- TURSO_AUTH_TOKEN: your-auth-token
- OPTION1_SYNC_ENABLED: true

## Current Status

**BLOCKED_ENV** — Config not present in environment.

## Proof Steps (when config available)

1. Initialize Option1DbService with temp DB
2. Create Option1SyncService
3. Call sync_now("proof-test")
4. Verify status.phase == Idle (not Error)
5. Verify status.last_error_code == None
6. Verify kv_set/kv_get still works (CRUD unaffected)

## Code Path

```
sync_service.rs::sync_now()
  -> check TURSO_DATABASE_URL
  -> check TURSO_AUTH_TOKEN
  -> if missing: return SYNC_MISSING_CONFIG
  -> if present: simulate sync (thread::sleep 150ms)
  -> update_sync_meta_guarded
  -> return SyncStatus { phase: Idle }