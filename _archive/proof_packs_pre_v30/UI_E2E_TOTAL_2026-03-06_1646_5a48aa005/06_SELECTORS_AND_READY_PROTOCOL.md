# 06 Selectors and Ready Protocol

## Readiness markers

- `data-testid="app-ready"` with `data-state=ready`
- `data-testid="ipc-ready"` with `data-state=ready|fallback`
- `data-testid="chat-ready"` with `data-state=ready`

## Core selectors used in suites

- Navigation: `data-testid="nav-top-main"` + page nav ids
- Chat: `chat-input`, `chat-send`, `chat-message-user`, `chat-message-assistant`, `chat-error`
- Tabs: `tab-*` selectors from page objects

## Stability strategy

- Wait-until based readiness and route activation checks.
- Bounded interaction fallbacks in WDIO helper layer.
- Post-fix full-suite persistence check anchored on prior user context visibility.

