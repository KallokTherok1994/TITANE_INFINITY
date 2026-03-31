# PLAYWRIGHT_SELECTOR_POLICY

| critical surface | preferred locator | fallback locator | reason |
|---|---|---|---|
| Top navigation | getByRole('navigation') + data-testid nav-* | getByText on stable labels | role + explicit test ids are stable |
| Titane tabs | data-testid tab-* with role=tab | aria-controls mapping | tab semantics already present |
| Chat composer | getByRole('textbox') or explicit data-testid | placeholder text | avoid fragile input[type="text"] assumption |
| Send action | getByRole('button', {name:/send|envoyer/i}) | data-testid send-button | resilient against style/layout changes |
| Provider selector | getByLabel / data-testid select-chat-provider | role=combobox | explicit provider contract |

## Detected policy drift
- tests/e2e/chat.spec.ts currently uses brittle selectors: input[type="text"], .conversation-list, #search-input.
