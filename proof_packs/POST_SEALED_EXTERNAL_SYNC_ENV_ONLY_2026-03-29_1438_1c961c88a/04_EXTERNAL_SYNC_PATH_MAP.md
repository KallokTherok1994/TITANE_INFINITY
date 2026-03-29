# P1.15 — EXTERNAL SYNC PATH MAP

Unchanged from P1.14d. Three independent env gates block execution before any remote connection attempt.

```
sync_scheduler.rs → OPTION1_SYNC_ENABLED absent → scheduler disabled
sync_service.rs   → TURSO_DATABASE_URL absent    → SYNC_MISSING_CONFIG
                  → TURSO_AUTH_TOKEN absent       → SYNC_MISSING_CONFIG
```

**Path status**: WIRED_BUT_BLOCKED — no code defect.

See P1.14d/04_EXTERNAL_SYNC_PATH_MAP.md for full path decomposition.
