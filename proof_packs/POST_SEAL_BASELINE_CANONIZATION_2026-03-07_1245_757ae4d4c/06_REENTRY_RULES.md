# 06_REENTRY_RULES

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `operational reentry policy`

C) RISK: `P1`

D) PLAN (<=7):
1. Define entry condition for new cycle.
2. Define mandatory baseline citation.
3. Define drift-trigger reopen rules.
4. Define forbidden starts.

E) PROOFS:

Operational rules:
1. A new iteration may start only with an explicit new scope or proven drift.
2. Starting baseline must cite commit `757ae4d4c` and this canonization pack.
3. Every new cycle must cite three chain anchors:
   - doctrine resolution pack
   - hygiene rerun pack
   - final seal pack
4. Reopen triggers are only:
   - tracked drift observed
   - untracked nonproof observed
   - CI non-success observed
   - new high-authority doctrine contradiction
5. Any change that touches product/config/CI/runtime/tests requires a new proof pack bootstrap before edits.
6. Forbidden without new bootstrap:
   - heavy test campaigns
   - CI/doctrine reinterpretation
   - seal requalification claims.

F) ROLLBACK:
- Rules file only.
