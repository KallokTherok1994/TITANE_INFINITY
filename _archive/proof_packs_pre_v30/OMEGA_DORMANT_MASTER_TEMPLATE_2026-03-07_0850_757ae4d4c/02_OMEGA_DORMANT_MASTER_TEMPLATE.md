# 02_OMEGA_DORMANT_MASTER_TEMPLATE

Template status: `DORMANT`

Activation condition:
- Use only if a real signal is observed and reaches proof threshold.

Non-activation condition:
- If no real qualified signal exists, remain idle and do nothing.

## 0) Mission

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `future trigger evaluation`

C) RISK: `P1`

D) PLAN (<=7):
1. Capture signal.
2. Validate threshold.
3. Classify single primary trigger.
4. Decide minimal scope.
5. Select allowed path.
6. Emit final decision.

E) PROOFS (expected):
- signal artifact, threshold proof, classification proof, scope proof.

F) ROLLBACK:
- no mutation before acceptance; rollback to activation pack only.

Mission rules:
- Protect baseline `757ae4d4c`.
- Respect reference states:
  - `STANDBY_CONFIRMED`
  - `WAKE_PROTOCOL_READY`
  - `GOVERNED_IDLE_CONFIRMED`
  - `RETURN_TO_GOVERNED_IDLE_CONFIRMED`
- Never activate by inertia.

## 1) Hard Stopline

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `pre-qualification safety`

C) RISK: `P1`

D) PLAN (<=7):
1. Forbid all mutation before qualification.
2. Allow only read/capture/classify/decide.

E) PROOFS (expected):
- bootstrap captures and raw signal evidence.

F) ROLLBACK:
- no technical mutation before trigger acceptance.

Absolute forbiddens:
- no product/config/CI/runtime/tests mutation before qualification.
- no broad audits/build/E2E/CI heavy actions before threshold reached.
- no doctrinal reopening without new high-authority contradiction.
- no composite activation.

## 2) Mandatory Output Shape (each phase)

A) EXEC_MODE
B) SCOPE_RING
C) RISK
D) PLAN (<=7)
E) PROOFS
F) ROLLBACK

## 3) Mandatory Bootstrap (only when activated)

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `activation bootstrap`

C) RISK: `P1`

D) PLAN (<=7):
1. Create `proof_packs/OMEGA_TRIGGER_EVALUATION_<YYYY-MM-DD>_<HHMM>_<shortSHA>/`.
2. Capture git bootstrap facts.
3. Verify baseline `757ae4d4c`.
4. Capture exact raw signal.
5. Reference prior idle/wake/trigger verdicts.

E) PROOFS (required files):
- `00_EXEC_SUMMARY.md`
- `01_BOOTSTRAP.md`
- `02_BASELINE_REFERENCE.md`
- `03_SIGNAL_CAPTURE.md`
- `04_THRESHOLD_VALIDATION.md`
- `05_TRIGGER_CLASSIFICATION.md`
- `06_MINIMAL_SCOPE_DECISION.md`
- `07_ALLOWED_PATH.md`
- `08_RESIDUAL_RISKS.md`
- `09_FINAL_ACTIVATION_DECISION.md`
- `VERDICT.md`
- `ROLLBACK.md`

F) ROLLBACK:
- if bootstrap incomplete => `BLOCKED`.

## 4) Signal Capture

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `raw signal capture`

C) RISK: `P1`

D) PLAN (<=7):
1. Record source.
2. Record timestamp.
3. Record touched surface.
4. Record raw artifact.
5. Avoid interpretation.

E) PROOFS:
- `SIGNAL_RAW_CAPTURED = YES`.

F) ROLLBACK:
- no patch/no cycle opening.

## 5) Threshold Validation

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `admissibility check`

C) RISK: `P1`

D) PLAN (<=7):
1. Evaluate `EXPLICIT_NEW_SCOPE` criteria.
2. Evaluate `PROVEN_DRIFT` criteria.
3. Evaluate `CRITICAL_EXTERNAL_FAILURE` criteria.
4. Decide threshold reached or not.

E) PROOFS:
- `THRESHOLD_REACHED = YES/NO`
- `WHY`
- `MISSING_PROOF` when NO.

F) ROLLBACK:
- if NO => `TRIGGER_REJECTED`, immediate return to governed idle.

## 6) Trigger Classification

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `single primary class`

C) RISK: `P1`

D) PLAN (<=7):
1. Choose exactly one class.
2. Reject if ambiguous.

E) PROOFS:
- class justification + source artifacts.

F) ROLLBACK:
- ambiguous => `BLOCKED_TRIGGER_AMBIGUOUS`.

Allowed classes:
- `EXPLICIT_NEW_SCOPE_ACCEPTED`
- `PROVEN_DRIFT_ACCEPTED`
- `CRITICAL_EXTERNAL_FAILURE_ACCEPTED`
- `TRIGGER_REJECTED`
- `BLOCKED_TRIGGER_AMBIGUOUS`

## 7) Minimal Scope Decision

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `scope minimization`

C) RISK: `P1`

D) PLAN (<=7):
1. Define smallest allowed ring/surface.
2. Define max scope and required gates.
3. Define rollback type.

E) PROOFS:
- `MINIMAL_SCOPE_APPROVED` or explicit rejection reason.

F) ROLLBACK:
- no composite scope, no scope inflation.

## 8) Allowed Path Selection

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `authorized activation path`

C) RISK: `P1`

D) PLAN (<=7):
1. Map class to one path.
2. Publish first step and constraints.

E) PROOFS:
- `ALLOWED_PATH_SELECTED`.

F) ROLLBACK:
- rejected class => immediate idle return.

Path map:
- `EXPLICIT_NEW_SCOPE_ACCEPTED` -> bounded new cycle.
- `PROVEN_DRIFT_ACCEPTED` -> bounded micro diagnostic/fix cycle.
- `CRITICAL_EXTERNAL_FAILURE_ACCEPTED` -> bounded targeted external diagnostic.
- `TRIGGER_REJECTED` -> governed idle reentry.

## 9) Residual Risks

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `post-decision risk framing`

C) RISK: `P1`

D) PLAN (<=7):
1. List only useful activation risks.
2. Attach mitigation.

E) PROOFS:
- scope width, proof sufficiency, collision, false positive, drift risks.

F) ROLLBACK:
- no speculative backlog.

## 10) Final Activation Decision

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `single final verdict`

C) RISK: `P1`

D) PLAN (<=7):
1. Emit one unique verdict.
2. Publish next action <=30 min.

E) PROOFS:
- top 3 decisive artifacts.

F) ROLLBACK:
- no acceptance without threshold.

Allowed final verdicts:
1. `TRIGGER_REJECTED`
2. `EXPLICIT_NEW_SCOPE_ACCEPTED`
3. `PROVEN_DRIFT_ACCEPTED`
4. `CRITICAL_EXTERNAL_FAILURE_ACCEPTED`
5. `BLOCKED_TRIGGER_AMBIGUOUS`

Default safety rule:
- In doubt, reject and return to idle.

## 11) Final Mandatory Files (future run)

- `09_FINAL_ACTIVATION_DECISION.md` must contain:
  - `VERDICT_UNIQUE`
  - `SIGNAL_TYPE`
  - `THRESHOLD_REACHED`
  - `TOP 3 PROOFS`
  - `MINIMAL_SCOPE_APPROVED` or rejection reason
  - `ALLOWED_PATH_SELECTED`
  - `FIRST STEP <=30 min`
- `VERDICT.md`
- `ROLLBACK.md`

## 12) Golden Rule

- Never seek reasons to wake TITANE∞.
- Only prove a legitimate right to wake.

## 13) Dormant Usage Directive

- Do not execute now.
- Keep as single master wake template.
- Use only upon real/new/dated/proven signal.
- Otherwise remain in governed idle and do nothing.
