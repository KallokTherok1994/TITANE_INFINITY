# CHAT ONLINE MATRIX

- generated_at_utc: 2026-03-05T13:03:00Z

## Features

- composer: multiline, paste, clear
- send: enter + button
- streaming: start/stop (if available)
- retry/regenerate (if available)
- conversation management (if available)
- message actions (if available)
- settings provider/model
- attachments (if available)

## Online Capabilities

- provider/model selection
- streaming token flow (if available)
- structured output/json mode (if available)
- bounded retries + backoff
- fallback local on provider down

## States

- idle, typing, sending, streaming, completed
- provider_error_visible, rate_limited, timeout, network_error
- recover_after_error
- resume_after_navigation

## Error Code Families

- `PROVIDER_*` (down/auth/rate-limit)
- `IPC_*` (bridge/allowlist/schema)
- `VALIDATION_*` (payload/input)

## Assertions Mapping (critical)

- provider status visibility: `TopNav` polling via `chat_check_providers` (UI + IPC)
- no-silence send path: `e2e/desktop/ui-ultra-smoke.e2e.js`
- error path fallback/error visibility: `e2e/desktop/ui-ultra-full.e2e.js` (`[ERROR_PATH]` scenario)
- online external provider readiness: `scripts/verify/verify_chat_online.sh`

## Current Campaign Coverage

- Unit chat core: PASS x3
- Provider health external: FAIL x3 (missing external keys)
- Online smoke/full desktop external: BLOCKED until `ONLINE_READY` is PASS
