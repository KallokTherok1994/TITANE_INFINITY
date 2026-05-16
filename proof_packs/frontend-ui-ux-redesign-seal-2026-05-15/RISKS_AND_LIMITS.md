# Risks and Limits — Frontend UI/UX Redesign Seal

## Local-only proof limitations

1. **No visual regression testing** — no screenshot diffing tool was run. Visual QA is human-only at this point. The 8 UI screenshots in `artifacts/ui-visual/screenshots/v78/` are pre-redesign artifacts excluded from commit.

2. **No e2e desktop WebDriver suite** — `e2e:desktop` requires a built Tauri binary + WebDriver setup. These tests were not run. Known as a local infrastructure limitation.

3. **No Android/mobile build** — Android-specific tests and builds were not run.

4. **No remote CI validation** — this is a local seal only. CI/CD pipeline validation is a separate step.

5. **Build warnings (pre-existing)** — Vite build produces chunk size warnings and dynamic import warnings. These are pre-existing and not introduced by the redesign. See `TEST_RESULTS.md` for details.

## Files intentionally excluded from commit

- `artifacts/backend-proof-depth/` (5 files) — backend IPC proof files, unrelated to UI
- `artifacts/ui-visual/screenshots/v78/` (8 files) — unverified desktop screenshots
- `artifacts/ui-visual/v80-desktop-test-gap-results.jsonl` — test gap artifact
- `memory/memory_core_state.json` — runtime state, not source
- `scripts/autoheal/autoheal_rules.jsonl` — runtime autoheal state

## Acceptable exceptions (not fixed)

- Opacity-modified gray utilities (`gray-500/20`, `gray-500/50`, `gray-500/60`) — used as transparent overlays only, do not affect text/background contrast
- `bg-gray-200 dark:bg-titanium-*` in VoiceControlPanel — explicit light/dark mode pair
- `DS_COLORS.diamant` in HyperDepth engine — out of redesign scope (visual canvas engine)
- `rubis/saphir` in DesignSystemPage — intentional theme demo

## Human review points

1. **Light mode visual QA** — the light mode token overrides have not been visually tested in the application. Manual QA is recommended.
2. **DesignSystemPage** — the rubis/saphir theme selectors in this page may need updating if the design system palette is officially deprecated.
3. **HyperDepth engine** — `src/core/hyperdepth/HYPERDEPTH_ENGINE.ts` uses diamant colors from a shared constant. If the HyperDepth surface is visible to users, those colors should also be migrated.
