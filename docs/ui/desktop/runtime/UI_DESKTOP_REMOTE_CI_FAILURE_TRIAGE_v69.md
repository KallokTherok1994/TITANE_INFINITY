# UI_DESKTOP_REMOTE_CI_FAILURE_TRIAGE_v69

Date: 2026-05-10
Mode: DURABLE

## mission
Repair the concrete failing family from run 25640326339 with minimal scope and proof-first validation.

## scope
- Targeted failure family: `verify:online-first`
- File patched: `scripts/verify/enforce-online-first.sh`
- No workflow contract weakening, no unrelated gate changes.

## root cause
The gate script sourced the portable shim `_rg` but called `rg` directly in checks. On CI environments without native ripgrep, this produced false negatives and a hard failure.

## fix
- Replaced all direct `rg` invocations with `_rg`.
- Replaced non-portable shorthand regex fragments with POSIX-safe patterns.
- Preserved the same governance intent and fail conditions.

## evidence
Local mandatory gate chain rerun after patch:
- G1 `pnpm run check` PASS
- G2 `pnpm run lint` PASS
- G3 `pnpm run verify:ui-surface-registry` PASS
- G4 `pnpm run generate:ui-surface-docs` PASS
- G5 `pnpm run generate:ui-desktop-manifest` PASS
- G6 `pnpm run verify:ui-desktop-coverage` PASS
- G7 `pnpm run verify:tauri-only` PASS
- G8 `pnpm run verify:online-first` PASS (0 failures, 0 warnings)
- G9 `pnpm run guard:ipc-contract` PASS
- G10 `TITANE_PROOF_ARTIFACT=... pnpm run verify:backend-proof-depth:strict` PASS
- G11 `pnpm run verify:ui-desktop-main-menu-reconciliation:sealed` PASS
- G12 `bash scripts/autoheal/detect_recurrence.sh` PASS
- G13 `bash scripts/verify_instructions.sh` PASS

## risks
- Remote run is still required for authoritative closure.
- Existing unrelated dirty files remain outside this fix scope (`src-tauri/Cargo.lock`, `src-tauri/data/ui_theme.json`).

## verdict
DONE

## next step
Push targeted repair commit and inspect the new `titane-static-gates.yml` run for the current HEAD before final certification.

## rollback note
`git restore -- scripts/verify/enforce-online-first.sh`
