# EXTERNAL SYNC READINESS MAP

## Required Environment Variables

| Variable | Required | Purpose | Status |
|----------|----------|---------|--------|
| TURSO_DATABASE_URL | YES | Turso/LibSQL remote database URL | **ABSENT** |
| TURSO_AUTH_TOKEN | YES | Turso authentication token | **ABSENT** |
| OPTION1_SYNC_ENABLED | YES | Enable sync scheduler | **ABSENT** |
| OPTION1_SYNC_INTERVAL_MS | NO | Sync interval (default: 120000) | ABSENT (default used) |

## Code Verification

### sync_service.rs (lines 41-47)

```rust
let has_url = std::env::var("TURSO_DATABASE_URL").ok().filter(|v| !v.is_empty());
let has_token = std::env::var("TURSO_AUTH_TOKEN").ok().filter(|v| !v.is_empty());

if has_url.is_none() || has_token.is_none() {
    let err = DbError::new(
        "SYNC_MISSING_CONFIG",
        "TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is missing",
    );
```

### sync_scheduler.rs (lines 12-16)

```rust
enabled: std::env::var("OPTION1_SYNC_ENABLED")
    .ok()
    .map(|v| v == "true" || v == "1")
    .unwrap_or(false),
```

## Blocker Classification

**BLOCKER_TYPE**: ENV_MISSING
**BLOCKER_SEVERITY**: ABSOLUTE (cannot proceed without config)
**BLOCKER_SCOPE**: EXTERNAL_SYNC_ONLY (local operations unaffected)

## Rerun Contract

To unblock external sync runtime proof:

```bash
export TURSO_DATABASE_URL="libsql://your-database.turso.io"
export TURSO_AUTH_TOKEN="your-auth-token"
export OPTION1_SYNC_ENABLED="true"
```

Then re-run P1.14b.