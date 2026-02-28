# Phase P4 — UI & Cockpit
<!-- APPEND-ONLY -->

## Objectives

- Verify UI zero-silence (ErrorBoundary, visible errors)
- Verify IPC contract `{ ok, content, error }`
- Verify stable `data-testid` selectors for E2E

## Checklist

- [ ] `bash checks/check_G3_UI_NO_NETWORK_DIRECT.sh` — PASS
- [ ] IPC contract verified: all commands return `{ ok, content, error }`
- [ ] ErrorBoundary present in root component
- [ ] `data-testid` selectors present on all interactive elements
- [ ] `registry/ui-events.jsonl` updated for UI changes

## Evidence

> Paste UI audit outputs, E2E screenshots, IPC contract diffs.

## UI changes registry

See `registry/ui-events.jsonl` — append-only, one entry per UI change.
