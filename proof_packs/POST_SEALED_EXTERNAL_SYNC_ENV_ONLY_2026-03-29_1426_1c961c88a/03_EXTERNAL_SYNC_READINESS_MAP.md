# P1.14d — EXTERNAL SYNC READINESS MAP

## Required Environment Variables

| Variable | Required | P1.14b | P1.14c | **P1.14d** |
|----------|----------|--------|--------|-----------|
| TURSO_DATABASE_URL | YES | ABSENT | ABSENT | **ABSENT** |
| TURSO_AUTH_TOKEN | YES | ABSENT | ABSENT | **ABSENT** |
| OPTION1_SYNC_ENABLED | YES | ABSENT | ABSENT | **ABSENT** |
| OPTION1_SYNC_INTERVAL_MS | NO | ABSENT | ABSENT | ABSENT (default 120000ms) |
| LIBSQL_* | NO | ABSENT | ABSENT | ABSENT |
| DATABASE_* | NO | ABSENT | ABSENT | ABSENT |

## P1.14d-Specific: OPTION1_SYNC_ENABLED check

P1.14d adds OPTION1_SYNC_ENABLED as an explicit third required check (was implicit in prior cycles).

Code evidence:
```rust
// sync_scheduler.rs lines 12-16
enabled: std::env::var("OPTION1_SYNC_ENABLED")
    .ok()
    .map(|v| v == "true" || v == "1")
    .unwrap_or(false),
```

**Result**: OPTION1_SYNC_ENABLED not set → scheduler defaults to `enabled = false`. External sync would not run even if TURSO vars were present.

This is a **third independent blocker** in addition to URL and TOKEN absence.

## Blocker Classification

| Blocker | Severity | Code path |
|---------|----------|-----------|
| TURSO_DATABASE_URL absent | ABSOLUTE | sync_service.rs:41-43 → SYNC_MISSING_CONFIG |
| TURSO_AUTH_TOKEN absent | ABSOLUTE | sync_service.rs:44-47 → SYNC_MISSING_CONFIG |
| OPTION1_SYNC_ENABLED absent | ABSOLUTE | sync_scheduler.rs:12-16 → enabled=false |

**BLOCKER_TYPE**: ENV_MISSING × 3
**CHANGE_SINCE_P1.14c**: None — same env state

## Rerun Contract

To unblock live external sync proof:

```bash
export TURSO_DATABASE_URL="libsql://your-database.turso.io"
export TURSO_AUTH_TOKEN="your-auth-token"
export OPTION1_SYNC_ENABLED="true"
# Re-enter as P1.15 (or P1.14e) with LANE B
```
