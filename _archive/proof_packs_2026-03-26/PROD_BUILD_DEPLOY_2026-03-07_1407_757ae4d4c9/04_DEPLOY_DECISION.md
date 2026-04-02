# Deploy Decision

## Decision Rule

- Policy applied: stop-the-line on invariant violation or blocking gate failure.
- Build is mandatory precondition for deploy in this run.

## Execution Outcome

- Deploy command executed: `NO`.
- Reason: build gate returned `FAIL` (`raw/12_build_attempt3.exitcode = 1`).
- Artifact readiness post-failure:
- `APPIMAGE_IN_RUNTIME_STABLE_COUNT=0`
- `DEB_IN_RUNTIME_STABLE_COUNT=0`
- Evidence: `raw/22_prod_target_and_artifacts_state_clean.txt`.

## Status

- `BLOCKED`: deployment blocked by failed mandatory build gate.
