# GATE REPORT — A11Y CLEAN BATCH GATE EXPANSION

## Canonical gate command

```bash
TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_HOST=127.0.0.1 TITANE_E2E_PORT=4173 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --project=chromium
```

## Critical output

- `[a11y:sentinel] blocking=0 (c=0 s=0 m=0 mn=0)`
- `[a11y:watchdog] blocking=0 (c=0 s=0 m=0 mn=0)`
- `[a11y:selfheal] blocking=0 (c=0 s=0 m=0 mn=0)`
- `[a11y:adaptive] blocking=0 (c=0 s=0 m=0 mn=0)`
- `[a11y:hyper-center] blocking=0 (c=0 s=0 m=0 mn=0)`
- `[a11y:doc-center] blocking=0 (c=0 s=0 m=0 mn=0)`
- `[a11y:knowledge] blocking=0 (c=0 s=0 m=0 mn=0)`
- `[a11y:performance] blocking=0 (c=0 s=0 m=0 mn=0)`
- `[a11y:aggregate] blocking=0 baseline=30`
- `33 passed (1.6m)`

## Status

PASS
