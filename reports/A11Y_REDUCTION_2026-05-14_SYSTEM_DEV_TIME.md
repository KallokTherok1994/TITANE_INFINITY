# A11Y Reduction - System / Dev / Time - 2026-05-14

Verdict: PASS

Scope:
- `src/App.tsx`
- `src/pages/DevPage.tsx`
- `src/pages/TimePage.tsx`
- `src/__tests__/pages/DevPage.test.tsx`
- `src/__tests__/pages/TimePage.test.tsx`

Symptoms closed:
- `admin-system` still reported one blocking `color-contrast` violation.
- `dev-overview` still reported two blocking violations: shared `color-contrast` plus `scrollable-region-focusable` on `main.dev-main`.
- `time` still reported one blocking `color-contrast` violation composed of footer and low-contrast helper labels.

Applied fix:
- Raised contrast in the global shell footer `TITANE∞ V… · Living Pulse`.
- Made `main.dev-main` keyboard-focusable with `tabIndex={0}` and a region label.
- Raised contrast on TIME tab descriptions and helper text in the `now` cards.
- Added focused Vitest guards on `DevPage` and `TimePage`.

Executable proof:
- `runTests` targeted slice: `<summary passed=36 failed=0 />`
- Targeted Axe diagnostic:
  - `ROUTE admin-system blocking=0`
  - `ROUTE dev-overview blocking=0`
  - `ROUTE time blocking=0`
- `pnpm exec playwright test e2e/a11y/wcag-aa-core.spec.ts --reporter=line`:
  - `[a11y:admin-system] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:dev-overview] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:time] blocking=0 (c=0 s=0 m=0 mn=0)`
  - `[a11y:memory] blocking=2 (c=1 s=1 m=0 mn=0)`
  - `[a11y:governance-center] blocking=1 (c=0 s=1 m=0 mn=0)`
  - `[a11y:aggregate] blocking=3 baseline=30`
  - `12 passed (54.0s)`

Residual repo state:
- Remaining blocking a11y debt is now concentrated on `memory=2` and `governance-center=1`. This batch stayed intentionally scoped to the shell/footer + DEV/TIME slice that could be proven locally.

Rollback:
- `git restore -- src/App.tsx src/pages/DevPage.tsx src/pages/TimePage.tsx src/__tests__/pages/DevPage.test.tsx src/__tests__/pages/TimePage.test.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/A11Y_REDUCTION_2026-05-14_SYSTEM_DEV_TIME.md proof_packs/A11Y_REDUCTION_2026-05-14_SYSTEM_DEV_TIME`