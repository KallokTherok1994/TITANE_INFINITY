# Local AGENTS - e2e

## Authority

E2E harness local discipline.

## Rules

- Wrapper usage is mandatory (tauri-driver wrapper + memory guard).
- Required export artifacts must be present (page_classification, chat_dom_map, AR20, OFFLINE5, navigation, stability).
- Avoid flaky timing hacks; keep deterministic waits.
- Auto anti-regression: for every E2E fix, append AutoHeal entry and run `detect_recurrence.sh` (Rule 10).
- Every user-facing feature requires E2E tests (Rule 16).
- Cover both primary and secondary user flows when a fix touches fullscreen, mobile layout, launcher/runtime truth, or backend/frontend synchronization; do not stop at the happy path.
- When runtime truth is part of the bug, assert the visible provider/mode/reason selectors explicitly so the harness cannot pass on a stale or mocked state.

## Chain-of-Thought Validation

1. Confirm wrapper/guard markers are present in logs.
2. Confirm all required exports are generated.
3. Use stable `data-testid` selectors — no fragile CSS paths.
4. Bound retries and log them explicitly.
5. Confirm the tested surface is the canonical live surface, not a compatibility alias.

## Integration Patterns

- New E2E test: use page object pattern, export results to `reports/`, add to test suite.
- New capability test: create Q&A scenario in `e2e/scenarios/`, validate via harness.
- Fix for flaky test: identify root cause, apply deterministic fix, add AutoHeal entry.

## Proofs

- E2E logs with wrapper markers.
- Required export artifacts in `reports/`.

## Not in scope

- Non-E2E architecture policy.
