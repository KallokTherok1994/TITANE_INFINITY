# P1.14c — EXTERNAL SYNC PATH MAP

## Sync Architecture (from code)

```
UI (React)
  → IPC invoke("option1_sync_now")
  → Tauri command: option1_sync_now()
  → Option1SyncService::sync_now(session_id)
    → Check TURSO_DATABASE_URL (env)
    → Check TURSO_AUTH_TOKEN (env)
    → If ABSENT: return DbError { code: "SYNC_MISSING_CONFIG" }
    → If PRESENT: connect to Turso/LibSQL via libsql-client
    → Execute bounded sync operations
    → update_sync_meta_guarded()
    → Return SyncStatus { phase: Idle, last_error_code: None }
```

---

## Path Components

| Component | Owner | Status | Note |
|-----------|-------|--------|------|
| Local source | Option1DbService (SQLite) | PROVEN | P1.13d |
| Sync initiator | Option1SyncService::sync_now() | WIRED_BUT_UNPROVEN | env gate blocks execution |
| Env gate | sync_service.rs:41-47 | PROVEN (correctly blocks) | SYNC_MISSING_CONFIG |
| Remote target | Turso/LibSQL | UNKNOWN | no config to connect |
| Readback path | Not available | UNKNOWN | no connection |
| Coherence check | Not available | UNKNOWN | no remote state |

---

## Live Path Status

| Stage | Status | Evidence |
|-------|--------|----------|
| Local read (source) | PROVEN | P1.13d sealed |
| Env gate evaluation | PROVEN (returns SYNC_MISSING_CONFIG) | sync_service.rs:41-47 |
| Remote connection | **NOT_EXECUTED** | env absent |
| Remote write | **NOT_EXECUTED** | env absent |
| Remote readback | **NOT_EXECUTED** | env absent |
| Coherence verification | **NOT_EXECUTED** | env absent |

---

## Blocker

**TURSO_DATABASE_URL absent** — Cannot establish remote connection.
**TURSO_AUTH_TOKEN absent** — Cannot authenticate to remote.

**Classification**: BLOCKED_ENV — Sync path correctly gates on absent config. No code defect.
