# 08_RECLASSIFICATION_MATRIX

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `final classification matrix`

C) RISK: `P1`

D) PLAN (<=7 etapes):
1. Evaluate each allowed final class.
2. Match against observed gate and workspace truth.
3. Select unique class.

E) PROOFS:

| Candidate | Conditions | Observed | Result |
|---|---|---|---|
| `QUALIFIED` | healthy system but ambiguity blocks STABLE | no active ambiguity (`untracked_nonproof=0`, doctrine resolved) | Not selected |
| `STABLE` | no tracked drift, no forbidden untracked, proof_untracked tolerated, light checks PASS | all conditions satisfied | Eligible |
| `SEALED_CANDIDATE` | STABLE + coherent final pack + no residual ambiguity + closure ready | satisfied (`HYGIENE_GATE=PASS`, full mandatory files present, doctrine already resolved) | Selected |
| `BLOCKED_WORKSPACE` | forbidden/ambiguous untracked remains | none found | Not selected |
| `BLOCKED_DRIFT` | tracked drift remains | none found | Not selected |

Selected classification: `SEALED_CANDIDATE`

F) ROLLBACK:
- Matrix decision only; no mutation.
