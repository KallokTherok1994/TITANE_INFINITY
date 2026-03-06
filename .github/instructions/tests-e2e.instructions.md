---
applyTo: 'e2e/**, scripts/e2e/**, wdio*.conf*'
---

# Tests E2E Instructions

## Invariants rappeles

- Ring impacte: Ring 4 (E2E harness).
- Determinisme, selectors stables, exports requis.
- Wrapper tauri-driver obligatoire + memory guard.

## DO

- Keep retries bounded and logged.
- Export page_classification, chat_dom_map, AR20, OFFLINE5, navigation, stability.
- Use reports/ for all proofs.
- For every E2E fix, follow the kernel AutoFix/AutoHeal canonical capture rule with:
  - `signature`: failing test name + artifact marker (log/export/error marker)
  - `verification`: rerun E2E command + explicit pass markers
  - `prevention`: gate/test change that prevents silent recurrence
- Run `bash scripts/autoheal/detect_recurrence.sh` before DONE/SEALED.
- Run `bash scripts/verify_instructions.sh` before DONE/SEALED.

## DONT

- Skip wrapper/guard markers.
- Use hardcoded dev URLs without env override.
- Apply flaky band-aids (random sleeps/timeouts) instead of deterministic fixes.

## Preuves attendues

- Logs with wrapper/guard markers and export files.

## Gates specifiques

- Stop-the-line if any required export is missing.
- Missing required exports => `FAIL` + mandatory AutoFix/AutoHeal entry describing prevention.
- Gate recurrence obligatoire: `G_AH_RECURRENCE_GUARD_PASS`.

## Rollback

- git restore -- e2e scripts/e2e wdio*.conf*
