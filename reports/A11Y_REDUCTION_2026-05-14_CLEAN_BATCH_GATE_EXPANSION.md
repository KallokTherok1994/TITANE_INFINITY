# A11Y REDUCTION 2026-05-14 — CLEAN BATCH GATE EXPANSION

## Verdict

PASS

## Scope

- Gate-only tranche: extend canonical WCAG inventory from 23 to 31 routes.
- Added routes: `/sentinel`, `/watchdog`, `/selfheal`, `/adaptive`, `/hyper-center`, `/doc-center`, `/knowledge`, `/performance`.
- No UI source patch under `src/**`.

## Problem

Eight critical routes were already clean (`blocking=0`) but were still excluded from the canonical `wcag-aa-core` inventory, leaving governance coverage debt.

## Minimal Fix Applied

- Updated `e2e/a11y/wcag-aa-core.spec.ts`:
  - `SURFACES` list 23 -> 31
  - describe/inventory comments aligned to 31 routes
  - invariant assertion 23 -> 31
- Updated mapping docs:
  - `UI_SURFACE_MAP.md`
  - `docs/CARTOGRAPHY_COMPLETE.md`
- Appended governance traces:
  - `registry/ui-events.jsonl`
  - `scripts/autoheal/autoheal_rules.jsonl`

## Executable Proof

### Canonical WCAG gate (Chromium)

Command:

```bash
TITANE_E2E_USE_WEBSERVER=0 TITANE_E2E_HOST=127.0.0.1 TITANE_E2E_PORT=4173 pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --project=chromium
```

Key output lines:

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

## Rollback

```bash
git restore -- e2e/a11y/wcag-aa-core.spec.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14_CLEAN_BATCH_GATE_EXPANSION.md proof_packs/A11Y_REDUCTION_2026-05-14_CLEAN_BATCH_GATE_EXPANSION
```
