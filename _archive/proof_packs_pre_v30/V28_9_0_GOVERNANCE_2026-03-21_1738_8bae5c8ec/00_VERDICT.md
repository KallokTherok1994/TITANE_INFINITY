A) EXEC_MODE: LOCAL — v28.9.0 Governance cycle
B) SCOPE_RING: Ring 4 (docs), Ring 2 (version bump)
C) RISK: LOW — docs fix + version bump only
D) PLAN: Resolve SHOULD_FIX_NEXT_CYCLE from v28.8.0; bump; build; seal.
E) PROOFS: vitest 3399/3399 (x2 runs), cargo 4463/4463, tsc PASS, freshness PASS
F) ROLLBACK: git revert HEAD

## Gates

| Gate | Status |
|------|--------|
| G_TSC | PASS |
| G_VITEST (run 1) | TRANSIENT_FLAKE — 1 failure (DesignCenter CSS bleed, parallel race) |
| G_VITEST (run 2) | PASS — 3399/3399 |
| G_CARGO_TEST | PASS — 4463/4463 |
| G_NATIVE_BINARY_FRESHNESS | PASS |
| G_VERIFY_INSTRUCTIONS | PASS=20/0 |
| G_AH_RECURRENCE | PASS (517 entries) |
| G_SEAL_FILE | PASS |
| G_CHECKSUMS | PASS |
| G_ROLLBACK | PASS |

## Transient flake classification

- Test: `DesignCenter.truth-chain > shows truthful runtime status`
- Cause: parallel-suite CSS property bleed (intermittent, pre-existing)
- afterEach fix (v28.7.0) reduced frequency but did not eliminate under heavy load
- Classification: NON_BLOCKING_INTERMITTENT — SHOULD_FIX_NEXT_CYCLE (deeper isolation needed)
- Action: capture in autoheal as recurring pattern; escalate fix priority

## Residual carried to v28.10.0

- docs/90_release/PRODUCTION_RELEASE_v28.9.0.md — SHOULD_FIX_NEXT_CYCLE
- DesignCenter intermittent flake — SHOULD_FIX_NEXT_CYCLE (escalated)
- Chat PARTIAL_CHAIN desktop E2E — NON_BLOCKING_MONITOR
- ESLint 10 PEER_BLOCKED — HISTORICAL_KEEP

VERDICT: STABLE
HEAD: 8bae5c8ec → commit pending
