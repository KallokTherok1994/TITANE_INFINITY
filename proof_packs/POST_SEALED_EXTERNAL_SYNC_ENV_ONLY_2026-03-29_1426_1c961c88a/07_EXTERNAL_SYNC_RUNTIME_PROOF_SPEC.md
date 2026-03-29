# P1.14d — EXTERNAL SYNC RUNTIME PROOF SPEC

**See canonical**: docs/governance/EXTERNAL_SYNC_RUNTIME_PROOF_SPEC.md

## P1.14d Additions vs P1.14c

P1.14d explicitly adds OPTION1_SYNC_ENABLED as third required env var (was implicitly required by scheduler but not formally checked in prior cycles' env classification).

## Updated Required Config

| Variable | Required | Why |
|----------|----------|-----|
| TURSO_DATABASE_URL | YES | sync_service.rs env gate |
| TURSO_AUTH_TOKEN | YES | sync_service.rs env gate |
| OPTION1_SYNC_ENABLED=true | YES | sync_scheduler.rs toggle |

All three must be non-empty/true for LANE B to proceed.

## Current Status

**BLOCKED_ENV** — All three absent at 2026-03-29T14:26.
