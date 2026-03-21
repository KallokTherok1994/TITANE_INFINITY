# v28.13.0 Governance — Pattern Break

EXEC_MODE: BACKGROUND / PROOF-DRIVEN
SCOPE_RING: governance (Ring 4 docs only)
RISK: LOW — no product code touched
PLAN: FIX-1 docs/90_release/v28.12.0.md (catch-up), FIX-2 docs/90_release/v28.13.0.md (same-cycle, pattern broken), bump 28.12.0→28.13.0, build, seal
PROOFS: tsc PASS, vitest 3399/3399, cargo 4463/4463, build exit 0, freshness PASS
ROLLBACK: git revert HEAD
PATTERN_BREAK: docs/90_release recurring debt closed after 8 cycles
