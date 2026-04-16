# Local AGENTS - src

## Authority

Ring 4 UI/module local discipline.

## Rules

- Visible error feedback is mandatory (ErrorBoundary on every new component).
- Stable `data-testid` selectors for E2E.
- No uncontrolled direct external network calls from UI.
- Every new UI surface: add entry to `registry/ui-events.jsonl` and update `UI_SURFACE_MAP.md` (Rule 15).
- Every new feature requires tests: unit + E2E (Rule 16).
- Auto anti-regression: run detect_recurrence.sh after every fix (Rule 10).

## Chain-of-Thought Validation

1. Confirm Ring4 boundary — no inverse imports into Ring0/Ring1.
2. Confirm IPC calls use `secureInvoke()` from `src/lib/security.ts` — never raw `invoke()`.
3. Add `data-testid` to new interactive elements.
4. Create or update tests alongside changes.
5. Update `UI_SURFACE_MAP.md` if new surface added.

## Integration Patterns

- New IPC call: use `secureInvoke()`, handle `response.ok` (never try/catch reliance).
- New component: wrap with ErrorBoundary, add `data-testid`, register in `registry/ui-events.jsonl`.
- New page: add route, add E2E navigation test.

## Proofs

- Relevant UI tests or E2E logs.
- If UI behavior changed, include registry evidence.

## Not in scope

- Global status doctrine and production build policy (kernel-owned, Rule 11).
