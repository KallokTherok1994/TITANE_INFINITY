# 09 E2E BLOCKED

## Preflight

- `pnpm run e2e:desktop:ensure`: PASS
- `WebKitWebDriver` detected at `/usr/bin/WebKitWebDriver`

## Hard block

- `scripts/e2e/require-e2e-build-authorization.sh`: FAIL
- Missing file: `runtime/ALLOW_E2E_TAURI_BUILD.ok`

## Interpretation

Desktop E2E is not absent because of host capability. It is blocked by repository governance on purpose. Without the authorization file, no truthful desktop E2E certification can be claimed.

## E2E verdict

- E2E desktop x3: BLOCKED
- E2E evidence quality: sufficient to block
