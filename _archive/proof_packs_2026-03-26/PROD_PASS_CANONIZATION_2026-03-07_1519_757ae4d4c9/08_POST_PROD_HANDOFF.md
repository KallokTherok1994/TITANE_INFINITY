# 08_POST_PROD_HANDOFF

A) EXEC_MODE: LOCAL
B) SCOPE_RING: Post-prod operational handoff
C) RISK: P0
D) PLAN (<=7 steps):
1. State current canonical status.
2. State what to do now.
3. State what not to redo.
4. Define future problem recognition.
5. Define future prompt type.
E) PROOFS:
- Baseline declaration: `proof_packs/PROD_PASS_CANONIZATION_2026-03-07_1519_757ae4d4c9/07_PROD_CANON_DECLARATION.md`
- Source prod pass chain: `proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/`
F) ROLLBACK:
- N/A (handoff instruction only).

Current state:
- Production baseline is canonicalized at version `27.2.0` with `PROD_PASS`.

What to do now:
- Keep this baseline as authoritative reference.
- Operate in normal post-release monitoring mode.

What not to do now:
- Do not rebuild, redeploy, or reopen release scope without new proof conditions.
- Do not alter versioning or CI/runtime for this closed cycle.

How to recognize a real future issue:
- Proven drift from version/integrity invariants.
- Proven critical runtime failure in production context.
- Proven mismatch in deployed artifact/manifest parity.

Prompt type to use when needed:
- Use a new governed release-entry prompt with explicit scope, proof of drift/failure, and expected artifacts.
