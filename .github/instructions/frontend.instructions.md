---
applyTo: 'src/**'
---

# Frontend Instructions

## Invariants rappeles

- Ring impacte: Ring 4 (UI/Modules) and Ring 3 (Orchestration/Stores/Hooks).
- Zero silence: user always sees success or error.
- Local-first (marqueur de compatibilité), doctrine active: online-first gouverné avec fallback local obligatoire.

## DO

- Use ErrorBoundary and visible errors.
- Add stable data-testid for E2E selectors.
- Keep UI changes minimal and register them.
- Update `UI_SURFACE_MAP.md` for every new page or component (Rule 15).
- Update `docs/CARTOGRAPHY_COMPLETE.md` for structural UI changes (Rule 15).
- Create unit (Vitest) + E2E test with `data-testid` for every new UI surface (Rule 16).
- Add `registry/ui-events.jsonl` entry for every UI change.

## DONT

- Add fetch/HTTP without explicit approval and gates.
- Hide errors or swallow exceptions.
- Ship a new UI surface without E2E test and `UI_SURFACE_MAP.md` update.

## Preuves attendues

- E2E logs + screenshots, `registry/ui-events.jsonl` entry if UI changed.
- `UI_SURFACE_MAP.md` updated with new testid and page references.

## Gates specifiques

- test:e2e or equivalent for UI/IPC changes.
- verify:registry when UI registry changes.
- Missing `UI_SURFACE_MAP.md` update for new UI surface ⇒ BLOCKED (Rule 15).
- Missing E2E test for new UI surface ⇒ BLOCKED (Rule 16).

## Rollback

- git restore -- src registry/ui-events.jsonl
