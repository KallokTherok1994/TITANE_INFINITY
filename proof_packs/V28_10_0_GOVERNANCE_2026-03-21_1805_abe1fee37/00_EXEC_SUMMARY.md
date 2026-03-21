# v28.10.0 Governance + DesignCenter Root Fix

EXEC_MODE: BACKGROUND / PROOF-DRIVEN
SCOPE_RING: Ring 4 (test infrastructure) + governance
RISK: LOW — test setup only, no product runtime touched
PLAN: FIX-1 DesignCenter flake root fix, FIX-2 docs/90_release/v28.9.0, bump, build, seal
PROOFS: vitest x3 (3399/3399), tsc PASS, cargo 4463/4463, build exit 0, freshness PASS
ROLLBACK: git revert HEAD
