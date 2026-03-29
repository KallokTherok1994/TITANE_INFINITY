# P1.14c — LOCAL BASELINE MAP

## Status

**LOCAL_LTM_SEALED_FOR_LOCAL_SCOPE** — Not reopened. Treated as established baseline.

---

## Invariants (not reopening)

| Invariant | Lock | Status |
|-----------|------|--------|
| Local persistence runtime proven | P1.13d | SEALED |
| LTM consumption proven (Rust) | P1.13d | SEALED |
| Recall bridge proven | POST_SEALED_RECALL_BRIDGE_FIX | PROVEN |
| Local event replay proven | POST_SEALED_EVENT_REPLAY | PROVEN |
| Reducer-family replay proven | POST_SEALED_MULTI_REDUCER | PROVEN |
| LTM persistence (write/read) | POST_SEALED_LTM_PERSISTENCE | PROVEN |

---

## Local LTM Seal Baseline Status

**LOCAL_LTM_SEAL_BASELINE_STATUS = SEALED — not reopened in P1.14c**

The local operations chain (persist → store → recall → consume) is proven end-to-end at the Rust level.

External sync is a separate subsystem blocked by ENV, not a local baseline regression.

---

## Boundary Rule

Local proof does not constitute external sync proof.

External sync is only proven when:
1. TURSO_DATABASE_URL is present and non-empty
2. TURSO_AUTH_TOKEN is present and non-empty
3. A live external write is executed and verified
4. A live readback or equivalent confirmation is obtained
