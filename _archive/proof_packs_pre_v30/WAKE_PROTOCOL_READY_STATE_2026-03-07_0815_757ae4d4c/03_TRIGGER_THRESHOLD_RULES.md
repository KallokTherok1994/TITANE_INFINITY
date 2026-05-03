# 03_TRIGGER_THRESHOLD_RULES

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `trigger admissibility thresholds`

C) RISK: `P1`

D) PLAN (<=7):
1. Define minimal admissibility threshold for `EXPLICIT_NEW_SCOPE`.
2. Define minimal admissibility threshold for `PROVEN_DRIFT`.
3. Define minimal admissibility threshold for `CRITICAL_EXTERNAL_FAILURE`.
4. Separate sufficient proof from insufficient proof.
5. Provide acceptable/non-acceptable examples.

E) PROOFS:
- Authorized triggers source:
  - `raw/authorized_wake_paths_validated.txt`
  - `raw/sentinel_triggers_reference.md`
- Current standby context:
  - `raw/current_standby_signals.txt`

Threshold table:

| Trigger | Minimal required proof | Insufficient proof | Acceptable examples | Non-acceptable examples |
|---|---|---|---|---|
| `EXPLICIT_NEW_SCOPE` | Explicit request, genuinely new objective, identifiable scope, and no collision with previously closed cycle zones | Vague request, implicit intent, or scope not bounded | "Open a new cycle to implement X in module Y with explicit boundaries" | "Maybe we should revisit stuff", "let's improve globally" |
| `PROVEN_DRIFT` | Measurable gap against `757ae4d4c`, concrete artifact (diff/log/failure/state contradiction), and real impact | Feeling, guess, cosmetic concern, no measurable evidence | Tracked diff on governed surface, failing deterministic gate tied to baseline, contradictory state snapshot | "Looks odd", hypothetical risk without evidence |
| `CRITICAL_EXTERNAL_FAILURE` | Serious observable external failure, dated/localizable evidence, and incompatibility with canonical state | Transient noise, undocumented claim, weak warning without impact | CI red on canonical workflow, external system contradiction with reproducible evidence | Single flaky line without reproducibility |

F) ROLLBACK:
- Rules document only, no trigger activation.
