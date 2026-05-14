# AppShell and Command Palette Typing Hardening — 2026-05-14

Verdict: PASS

Scope:
- `src/utils/lazyWithRetry.ts`
- `src/App.tsx`
- `src/components/sections/ConversationSection.tsx`
- `src/pages/DevPage.tsx`
- `src/components/shadcn/command.tsx`

Symptoms closed:
- `pnpm run check` failed on lazy route loaders and a stale `reflection.evaluated` access.
- `pnpm run lint` failed on the invalid DOM attribute `cmdk-input-wrapper`.

Applied fix:
- Relax `lazyWithRetry` to accept the real component shapes returned by the lazy routes.
- Normalize the `AdminPage` loader to an explicit `{ default }` contract.
- Derive the `reflection` stage from the actual `CognitiveRuntimeTrace.reflection` fields.
- Remove the unnecessary `unknown` cast in `DevPage`.
- Replace `cmdk-input-wrapper` with `data-cmdk-input-wrapper` and keep the same Tailwind selectors.

Executable proof:
- `pnpm run check` → PASS.
- `pnpm run lint` → PASS.
- `TITANE_E2E_FULL=1 pnpm exec playwright test e2e/critical/command-palette.spec.ts --reporter=line` → `1 passed`.
- `pnpm exec playwright test e2e/critical/ui-prod-capture-v34_0_6.spec.ts --grep 'capture titane|capture admin-config|capture admin-governance|capture dev-diagnostics|capture dev-operations' --reporter=line` → `10 passed`.
- `TITANE_E2E_TAURI=1 pnpm run test:e2e:vitest` → `Test Files 2 passed`, `Tests 6 passed`.

Residual repo state:
- `pnpm run format:check` still reports broad pre-existing formatting drift across many unrelated files. This batch does not widen to a repo-wide Prettier rewrite.

Rollback:
- `git restore -- src/utils/lazyWithRetry.ts src/App.tsx src/components/sections/ConversationSection.tsx src/pages/DevPage.tsx src/components/shadcn/command.tsx UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/appshell-command-palette-typing-hardening-2026-05-14.md proof_packs/APPSHELL_COMMAND_PALETTE_TYPING_HARDENING_2026-05-14_v35_1_5`