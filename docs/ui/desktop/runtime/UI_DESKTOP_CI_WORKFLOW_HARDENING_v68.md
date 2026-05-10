# UI_DESKTOP_CI_WORKFLOW_HARDENING_v68

## mission
Harden static CI workflow so remote execution reflects the local gate truth from v67/v68.

## scope
- .github/workflows/titane-static-gates.yml
- scripts/verify/enforce-online-first.sh

## actions
1. Added explicit critical baseline gates to CI:
   - `pnpm run check`
   - `pnpm run lint`
2. Hardened backend strict verifier invocation to mission-required artifact:
   - `TITANE_PROOF_ARTIFACT=artifacts/backend-proof-depth/v63-tier1-real-ipc-completion.jsonl pnpm run verify:backend-proof-depth:strict`
3. Removed `continue-on-error` from sealed gate and replaced with explicit blocking-if-present conditional:
   - If sealed artifact exists => run blocking verifier
   - If absent => explicit skip message
4. Made online-first check regex CI-portable in script:
   - pattern changed from `online[-\s]?first.*govern` to `online(-|[[:space:]])?first.*govern`
5. Updated workflow summary section to include explicit check/lint items.

## evidence
- Critical static gates now explicitly listed in workflow:
  1. check
  2. lint
  3. verify:ui-surface-registry
  4. generate:ui-surface-docs
  5. generate:ui-desktop-manifest
  6. verify:ui-desktop-coverage
  7. verify:tauri-only
  8. verify:online-first
  9. guard:ipc-contract
  10. verify:backend-proof-depth:strict (with TITANE_PROOF_ARTIFACT=v63)
  11. verify:ui-desktop-main-menu-reconciliation:sealed (blocking when artifact present)
  12. bash scripts/autoheal/detect_recurrence.sh
  13. bash scripts/verify/verify_instructions.sh
- WDIO runtime suite remains excluded from CI (no desktop runner assumption introduced).

## risks
- Even with workflow hardening, remote run can still fail if repository-wide governance scripts evolve independently.
- Path-filtered trigger may skip runs when changes are outside configured paths.

## verdict
PASS

## next step
Run full local mission gates, commit/push v68 hardening, then validate fresh remote run status.

## rollback note
`git restore -- .github/workflows/titane-static-gates.yml scripts/verify/enforce-online-first.sh`
