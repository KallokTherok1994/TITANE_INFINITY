# P1.14d — LOCAL BASELINE MAP

## Status: SEALED — NOT REOPENED

**LOCAL_LTM_SEALED_FOR_LOCAL_SCOPE** — established by P1.13d. Invariants below are not subject to re-examination in this cycle.

| Invariant | Lock | Status |
|-----------|------|--------|
| Local persistence runtime | P1.13d | SEALED |
| LTM consumption (Rust) | P1.13d | SEALED |
| Recall bridge | POST_SEALED_RECALL_BRIDGE_FIX | PROVEN |
| Local event replay | POST_SEALED_EVENT_REPLAY | PROVEN |
| Reducer-family replay | POST_SEALED_MULTI_REDUCER | PROVEN |
| LTM persistence (write/read) | POST_SEALED_LTM_PERSISTENCE | PROVEN |

## Boundary Rule (unchanged from P1.14c)

Local proof ≠ external sync proof.

External sync is only proven when:
1. TURSO_DATABASE_URL present and non-empty
2. TURSO_AUTH_TOKEN present and non-empty
3. OPTION1_SYNC_ENABLED=true present and effective
4. Live external write executed and verified
5. Live readback or equivalent confirmation obtained

**Current state**: conditions 1–5 not met. BLOCKED_ENV.
