# 08_RESIDUAL_RISKS

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `activation residual risks`

C) RISK: `P1`

D) PLAN (<=7):

1. List only activation-related risks.
2. Attach evidence, impact, mitigation.
3. Keep safeguards aligned with non-activation default.

E) PROOFS:

- Current state proof:
  - `raw/trigger_signal_capture.txt`
  - `04_THRESHOLD_VALIDATION.md`

Residual risks:

| ID           | P-level | Evidence                                             | Impact                                     | Mitigation                                       |
| ------------ | ------- | ---------------------------------------------------- | ------------------------------------------ | ------------------------------------------------ |
| RISK-ACT-001 | P1      | No threshold reached in `04_THRESHOLD_VALIDATION.md` | False activation by over-interpretation    | Enforce `TRIGGER_REJECTED` default when in doubt |
| RISK-ACT-002 | P1      | No explicit scope signal                             | Opening cycle on ambiguous request         | Require explicit bounded scope before activation |
| RISK-ACT-003 | P1      | `PROVEN_DRIFT=FALSE` in raw capture                  | Unnecessary technical work                 | Require measurable divergence proof              |
| RISK-ACT-004 | P1      | `CRITICAL_EXTERNAL_FAILURE=FALSE` in raw capture     | Escalation on nonexistent external failure | Require dated/localizable external evidence      |
| RISK-ACT-005 | P1      | Dormant template context                             | Multi-trigger blending drift               | Single primary class rule, reject if ambiguous   |
| RISK-ACT-006 | P1      | No accepted trigger class                            | Slide into global audit                    | Keep `NO_ACTION` and idle return condition       |

F) ROLLBACK:

- Risk register document only.
