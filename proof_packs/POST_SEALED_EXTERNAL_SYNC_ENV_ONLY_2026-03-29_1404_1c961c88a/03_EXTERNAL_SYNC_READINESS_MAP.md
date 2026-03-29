# P1.14c — EXTERNAL SYNC READINESS MAP

## Required Environment Variables

| Variable | Required | Purpose | P1.14b Status | P1.14c Status |
|----------|----------|---------|--------------|--------------|
| TURSO_DATABASE_URL | YES | Turso/LibSQL remote URL | **ABSENT** | **ABSENT** |
| TURSO_AUTH_TOKEN | YES | Turso authentication token | **ABSENT** | **ABSENT** |
| OPTION1_SYNC_ENABLED | YES | Enable sync scheduler | **ABSENT** | **ABSENT** |
| OPTION1_SYNC_INTERVAL_MS | NO | Sync interval override | ABSENT | ABSENT |
| LIBSQL_* | NO | LibSQL fallback config | ABSENT | ABSENT |
| DATABASE_* | NO | Generic DB fallback | ABSENT | ABSENT |

---

## Code Verification

### sync_service.rs (guard at lines 41-47)
```rust
let has_url = std::env::var("TURSO_DATABASE_URL").ok().filter(|v| !v.is_empty());
let has_token = std::env::var("TURSO_AUTH_TOKEN").ok().filter(|v| !v.is_empty());

if has_url.is_none() || has_token.is_none() {
    let err = DbError::new(
        "SYNC_MISSING_CONFIG",
        "TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is missing",
    );
```

### sync_scheduler.rs (toggle at lines 12-16)
```rust
enabled: std::env::var("OPTION1_SYNC_ENABLED")
    .ok()
    .map(|v| v == "true" || v == "1")
    .unwrap_or(false),
```

---

## Blocker Classification

| Field | Value |
|-------|-------|
| BLOCKER_TYPE | ENV_MISSING |
| BLOCKER_SEVERITY | ABSOLUTE |
| BLOCKER_SCOPE | EXTERNAL_SYNC_ONLY |
| LOCAL_IMPACT | None — local operations unaffected |
| CODE_DEFECT | None — code correctly handles SYNC_MISSING_CONFIG |
| CHANGE_SINCE_P1.14b | None — same env state |

---

## Delta from P1.14b

**No change.** Env vars remain absent. No new config appeared. BLOCKED_ENV condition persists.

---

## Rerun Contract

To unblock external sync runtime proof (P1.14d):

```bash
export TURSO_DATABASE_URL="libsql://your-database.turso.io"
export TURSO_AUTH_TOKEN="your-auth-token"
export OPTION1_SYNC_ENABLED="true"
```

Then re-run as P1.14d using LANE B.
