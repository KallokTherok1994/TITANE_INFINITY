# RISK_REGISTER — LOCK_E0_DESKTOP_ADVANCED_E2E_2026-05-06

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|-----------|
| R1 | WDIO spec flaky on headless re-run | LOW | MEDIUM | Uses only structural assertions (body.isExisting, file reads); no timing-sensitive UI interactions |
| R2 | STALE_RELEASE_BINARY policy changes make E0 run require rebuild | MEDIUM | LOW | E0 run command documented with TITANE_ENFORCE_BINARY_FRESHNESS=0; rebuild restores freshness |
| R3 | autoheal_rules.jsonl line count below 1672 on regression | LOW | LOW | C16 check guards minimum count; unique entry IDs prevent duplicates |
| R4 | Desktop binary path changes in future builds | LOW | LOW | Policy resolution handles multiple candidates; E0 spec uses structural assertions only |
| R5 | Lane SKIPPED_WITH_EXPLICIT_BLOCKER mis-classified as FAIL in future matrix | LOW | MEDIUM | Matrix JSON explicitly records 'SKIPPED_WITH_EXPLICIT_BLOCKER' per lane |
| R6 | D4 SelfImprovementLabContract.ts modified without updating C16/C17/C18 | LOW | HIGH | Validator C17/C18 guard those specific strings |
