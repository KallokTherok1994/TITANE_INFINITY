# P1.14c — COHERENCE MAP

## Coherence Classification

| Dimension | Status | Reason |
|-----------|--------|--------|
| Local state | PROVEN | P1.13d — SQLite local DB verified |
| External state | **UNKNOWN** | No remote connection possible |
| Local-to-external consistency | **NOT_ASSESSED** | Cannot compare without remote access |
| Acceptable lag rule | N/A | Not reached |
| Proof strategy | **BLOCKED_ENV** | Cannot execute until env available |

---

## Expected Consistency Rule (when env present)

When TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are both present:
- Local SQLite is the authoritative write target
- External Turso/LibSQL is the sync replica
- Consistency: local → remote, best-effort, last-write-wins per session
- Acceptable lag: up to OPTION1_SYNC_INTERVAL_MS (default 120000ms)
- Proof: sync_now() returns SyncStatus.phase == Idle AND no last_error_code

---

## Coherence Proof Strategy (deferred to P1.14d)

```
Step 1: Write bounded test entry to local SQLite
Step 2: Call sync_now(session_id)
Step 3: Verify SyncStatus.phase == Idle
Step 4: Query remote Turso/LibSQL for same entry
Step 5: Compare local vs remote — classify as COHERENT or MISMATCH
```

**Current status**: BLOCKED_ENV — cannot execute steps 2-5.

---

## COHERENCE_STATUS = NOT_ASSESSED_BLOCKED_ENV
