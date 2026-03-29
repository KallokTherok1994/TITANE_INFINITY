# P1.14c — EXTERNAL SYNC RUNTIME PROOF SPEC

## Purpose

Defines how to prove live external sync runtime for TITANE∞ when environment becomes available.

## Current Status

**BLOCKED_ENV** — Config not present in environment at 2026-03-29T14:04.

---

## Required Config

| Variable | Required | Example |
|----------|----------|---------|
| TURSO_DATABASE_URL | YES | `libsql://your-database.turso.io` |
| TURSO_AUTH_TOKEN | YES | `your-auth-token` |
| OPTION1_SYNC_ENABLED | YES | `true` |

---

## Proof Steps (when config available — P1.14d LANE B)

1. Verify TURSO_DATABASE_URL is present and non-empty
2. Verify TURSO_AUTH_TOKEN is present and non-empty
3. Initialize Option1DbService with test SQLite DB
4. Write one bounded test entry to local DB
5. Create Option1SyncService
6. Call sync_now("p1-14d-proof-test")
7. Verify SyncStatus.phase == Idle (not Error)
8. Verify SyncStatus.last_error_code == None
9. Query remote Turso/LibSQL for same test entry
10. Compare local vs remote — classify COHERENT or MISMATCH
11. Repeat x3 (x3 required gate)
12. Clean up test entry from both local and remote

---

## Code Path

```
sync_service.rs::sync_now()
  → check TURSO_DATABASE_URL (env)
  → check TURSO_AUTH_TOKEN (env)
  → if missing: return SYNC_MISSING_CONFIG [← current gate]
  → if present: connect via libsql-client
  → execute sync operations
  → update_sync_meta_guarded()
  → return SyncStatus { phase: Idle }
```

---

## Evidence Required for PROVEN Verdict

| Evidence | Source | Required |
|----------|--------|----------|
| TURSO_DATABASE_URL non-empty | env | YES |
| TURSO_AUTH_TOKEN non-empty | env | YES |
| sync_now() returns phase: Idle | SyncStatus | YES |
| No last_error_code in SyncStatus | SyncStatus | YES |
| Remote entry visible after sync | Turso query | YES |
| x3 runs all PASS | test harness | YES |

---

## Failure Classification

| Failure Mode | Classification |
|-------------|----------------|
| Env vars absent | BLOCKED_ENV |
| Env vars present but connection refused | EXTERNAL_SYNC_BREAK_IDENTIFIED |
| Connection ok but write fails | EXTERNAL_SYNC_BREAK_IDENTIFIED |
| Write ok but readback mismatch | EXTERNAL_SYNC_COHERENCE_BROKEN |
| All pass | EXTERNAL_SYNC_RUNTIME_PROVEN |
