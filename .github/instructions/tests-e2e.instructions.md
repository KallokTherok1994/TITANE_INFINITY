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

## DONT

- Skip wrapper/guard markers.
- Use hardcoded dev URLs without env override.

## Preuves attendues

- Logs with wrapper/guard markers and export files.

## Gates specifiques

- Stop-the-line if any required export is missing.

## Rollback

- git restore -- e2e scripts/e2e wdio*.conf*
