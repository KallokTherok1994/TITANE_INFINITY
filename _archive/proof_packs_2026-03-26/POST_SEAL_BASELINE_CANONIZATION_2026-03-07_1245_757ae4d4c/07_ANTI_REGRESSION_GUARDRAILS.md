# 07_ANTI_REGRESSION_GUARDRAILS

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `process anti-regression guardrails`

C) RISK: `P1`

D) PLAN (<=7):
1. Encode explicit anti-regression statements.
2. Tie each guardrail to sealed evidence.

E) PROOFS:

Guardrails:
1. Do not reopen a `SEALED` verdict without proven drift.
2. Do not treat `proof_packs` untracked tolerance as permission for any other untracked drift.
3. Do not launch heavy audits/build/E2E without new scoped need.
4. Do not re-debate `KEEP_UNTRACKED` unless a new higher-authority contradiction exists.
5. Do not treat sealed baseline as mere historical note; it is the active canonical reference.
6. Always cite canonical commit `757ae4d4c` when initiating a new cycle.
7. Preserve proof-chain continuity: doctrine -> hygiene -> final seal -> canonization.

F) ROLLBACK:
- Guardrails documentation only.
