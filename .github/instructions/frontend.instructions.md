---
applyTo: 'src/**'
---

# Frontend Instructions

## Invariants rappeles

- Ring impacte: Ring 4 (UI/Modules).
- Zero silence: user always sees success or error.
- Local-first, no implicit network.

## DO

- Use ErrorBoundary and visible errors.
- Add stable data-testid for E2E selectors.
- Keep UI changes minimal and register them.

## DONT

- Add fetch/HTTP without explicit approval and gates.
- Hide errors or swallow exceptions.

## Preuves attendues

- E2E logs + screenshots, registry/ui-events.jsonl entry if UI changed.

## Gates specifiques

- test:e2e or equivalent for UI/IPC changes.
- verify:registry when UI registry changes.

## Rollback

- git restore -- src registry/ui-events.jsonl
