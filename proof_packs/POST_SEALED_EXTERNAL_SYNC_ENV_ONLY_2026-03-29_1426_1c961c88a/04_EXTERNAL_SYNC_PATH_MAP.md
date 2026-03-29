# P1.14d — EXTERNAL SYNC PATH MAP

## Full Path (from code)

```
sync_scheduler.rs
  → check OPTION1_SYNC_ENABLED (env) [NEW EXPLICIT CHECK IN P1.14d]
  → if false/absent: scheduler disabled, sync_now() never called

UI (React)
  → IPC invoke("option1_sync_now")
  → Tauri: option1_sync_now()
  → Option1SyncService::sync_now(session_id)
    → check TURSO_DATABASE_URL (env) → ABSENT → return SYNC_MISSING_CONFIG
    → check TURSO_AUTH_TOKEN (env) → ABSENT → return SYNC_MISSING_CONFIG
    → [if present] connect libsql-client → execute sync → return SyncStatus
```

## Path Components

| Component | Status | Proof source |
|-----------|--------|-------------|
| Local source (SQLite) | PROVEN | P1.13d |
| Sync scheduler toggle | WIRED — disabled (OPTION1_SYNC_ENABLED absent) | sync_scheduler.rs:12-16 |
| Sync initiator (sync_now) | WIRED — blocked at env gate | sync_service.rs:41-47 |
| Remote connection | UNKNOWN | no config to connect |
| Remote write | NOT_EXECUTED | env absent |
| Remote readback | NOT_EXECUTED | env absent |
| Coherence check | NOT_EXECUTED | env absent |

## Classification

**BLOCKED_ENV** — Three independent env gates prevent sync execution. No code defect.
