# UI_DESKTOP_REMOTE_CI_FAILURE_TRIAGE_v69

Date: 2026-05-10
Mode: DURABLE
Run ID: 25640326339
Workflow: TITANE Static Gates v67 - UI Desktop Determinism

## Failure Classification
CI_ONLINE_FIRST_SCRIPT_BUG

## Failing Command
pnpm run verify:online-first

## Failing Log Excerpt
- WARN: verify:online-first not found in package.json
- FAIL: Online-first governed policy not documented in Copilot instructions
- ELIFECYCLE Command failed with exit code 1

## Local Reproduction Result
- Before fix context: remote failure reproduced from run log and step metadata for 25640326339.
- After fix on current HEAD: pnpm run verify:online-first -> PASS (0 failures, 0 warnings).

## Root Cause
The verifier loaded the portability shim in scripts/verify/_rg_compat.sh but still invoked rg directly in scripts/verify/enforce-online-first.sh. In CI environments where rg behavior differed, this yielded false negatives for checks 3 and 4 and aborted the gate.

## Whether v69 Caused It
No. The failure existed before v69 closure work and was the trigger condition for this mission.

## Minimal Repair Plan
1. Keep gate policy strict and unchanged.
2. Use _rg consistently in all online-first checks.
3. Normalize regex to POSIX-safe patterns for CI portability.
4. Re-run full static gate chain G1-G13.
5. Push minimal repair commit and verify new remote run.

## Repair Applied
- File updated: scripts/verify/enforce-online-first.sh
- Changes:
  - rg -> _rg in checks 1-4
  - local[-\s]?first\s+only -> local[-[:space:]]*first[[:space:]]+only
  - online(-|[[:space:]])?first.*govern -> online[-[:space:]]*first.*govern

## Post-Fix Local Gate Evidence
- G1 check: PASS
- G2 lint: PASS
- G3 verify:ui-surface-registry: PASS
- G4 generate:ui-surface-docs: PASS
- G5 generate:ui-desktop-manifest: PASS
- G6 verify:ui-desktop-coverage: PASS
- G7 verify:tauri-only: PASS
- G8 verify:online-first: PASS
- G9 guard:ipc-contract: PASS
- G10 verify:backend-proof-depth:strict: PASS
- G11 verify:ui-desktop-main-menu-reconciliation:sealed: PASS
- G12 detect_recurrence: PASS
- G13 verify_instructions: PASS

## Verdict
DONE

## Next Step
Track run for current HEAD and finalize release closure verdict based on remote CI completion state.

## Rollback Note
git restore -- scripts/verify/enforce-online-first.sh docs/ui/desktop/runtime/UI_DESKTOP_REMOTE_CI_FAILURE_TRIAGE_v69.md
