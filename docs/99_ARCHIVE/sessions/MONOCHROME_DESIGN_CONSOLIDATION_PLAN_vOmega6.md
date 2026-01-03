# TITANE∞ Monochrome Design Consolidation Plan vΩ.6

## Current Findings
- `src/themes/ThemeProvider.tsx` still returns children directly and never touches DOM attributes, so the UI cannot switch between dark/light monochrome palettes or honor OS preferences.
- `src/design-system/titane-fusion.css` and `src/design-system/titane-v∞.css` both define dark-only `:root` variables; they diverged over time (different spacing, animation tokens) and still mention removed gem palettes, which complicates keeping one source of truth.
- `src/styles/exp-fusion.css`, `src/styles/chat-messages.css`, and the monitoring CSS modules (`src/components/monitoring/**.css`) hardcode legacy `--rubis`/`--saphir`/`--emeraude` variables and neon gradients, so they cannot inherit the monochrome palette.
- TypeScript components (e.g., `src/features/cognitive/NexusGraph.tsx`, `src/features/chat/ChatInput.tsx`, `src/features/progression/TalentTree.tsx`) import `colors.rubis|saphir|emeraude` directly instead of semantic roles, preventing a simple palette swap.
- Documentation such as `THEME_METAL_QUICK_REFERENCE.md` and `MIGRATION_THEME_METAL_v17.4.0.md` already describe the metal tokens, but the runtime implementation does not enforce them, and there is no light-mode mapping for surfaces/text states.

## Objectives
1. Ship a single monochrome token source (dark+light) that propagates to CSS custom properties and React components.
2. Remove the remaining gem-themed variables/classes, replacing them with semantic metal tokens (intent/info/success/danger).
3. Guarantee that every CSS/TS consumer reads from the same semantic map so the light/dark toggle is instant and consistent.
4. Update docs/tests to reflect the consolidated design system.

## Phase A — Canonical Tokens & CSS Variables
1. Extend `src/themes/tokens.ts` with `monochromeDark` and `monochromeLight` objects (backgrounds, text, border, semantic intents, glows). Export a `buildCssVariables(theme)` helper that flattens tokens to CSS custom properties.
2. Create `src/design-system/monochrome.css` that defines `:root[data-theme="dark"]` and `:root[data-theme="light"]` variables generated from the helper. Remove duplicated definitions from `titane-fusion.css` and turn that file into component-level utilities that consume the new variables.
3. Delete `titane-v∞.css` or reduce it to `@import './monochrome.css';` so there is only one palette definition. Update `src/main.tsx` (or the top-level layout) to import the new CSS entrypoint once.

## Phase B — Real Theme Provider & Mode Control
1. Replace the stub `ThemeProvider` with a context that:
   - Reads preferred mode from localStorage or `window.matchMedia('(prefers-color-scheme: dark)')`.
   - Applies `data-theme="dark|light"` on `document.documentElement` and syncs CSS variables via `buildCssVariables`.
   - Exposes `useTheme()` hook for UI toggles.
2. Introduce a `ThemeModeSwitch` component (settings drawer) that lets the user choose `system | dark | light`.
3. Guard server-side rendering/tauri hydration by gating DOM writes inside `useLayoutEffect` and providing a fallback class (`preinit-theme-dark`).

## Phase C — Semantic Token Refactor in TypeScript
1. Add a semantic map in `src/themes/tokens.ts` (e.g., `semantic.intent = { action, info, success, warning, danger }`, `semantic.surface = { base, raised, glass }`).
2. Update files that currently call `colors.rubis|saphir|emeraude` to use the new semantic keys:
   - Cognitive visualizations: `src/features/cognitive/NexusGraph.tsx`, `MemoryTimeline.tsx`, `HarmoniaPatterns.tsx`, `HeliosVisualization.tsx`.
   - Chat UI: `src/features/chat/ChatInput.tsx`, `ChatMessage.tsx`, `ChatContextPanel.tsx`.
   - Progression features: `src/features/progression/XPProgressBar.tsx`, `TalentTree.tsx`, `components/experience/CompactXPBar.tsx`.
   - Monitoring badges (`src/components/monitoring/SystemStatusCard.tsx`).
3. Remove the exposed `colors.rubis|saphir|emeraude|diamant` objects after all usages migrate; keep `metalPalette` + `semantic` exports only.

## Phase D — CSS Module Cleanup
1. Replace legacy CSS variables inside:
   - `src/styles/chat-messages.css` (use `--color-info`, `--color-danger`, etc.).
   - `src/styles/exp-fusion.css` (swap bright gradients for monochrome linear blends, convert `--rubis`/`--saphir` to `--primary`/`--accent`).
   - Monitoring styles: `SystemStatusCard.css`, `MonitoringHeader.css`, `ErrorsCard.css`, `CognitiveModuleCard.css`, `LogsCard.css`.
2. Add a shared `:root` block (or import) that defines `--color-info`, `--color-success`, etc., mapping to the new semantic tokens so CSS files do not re-declare raw hex values.
3. While touching these files, normalize spacing tokens (`var(--space-sm)` etc.) so they match the design-system definitions; `exp-fusion.css` still uses bespoke spacing.

## Phase E — Light Mode, Accessibility & QA Hooks
1. Define the light-surface palette (backgrounds, borders, text) inside `monochromeLight`. Target WCAG 2.1 AA: ensure `--text-primary-light` vs `--bg-card-light` contrast ≥ 4.5 by sampling hex pairs.
2. Add storybook/Playwright visual checks for both themes (if Storybook disabled, add a lightweight `ThemePreview` page under `/src/stories/ThemePreview.stories.tsx`).
3. Update documentation (`THEME_METAL_GUIDE_UTILISATION.md`, `THEME_METAL_QUICK_REFERENCE.md`) with the new light palette table and the removal of gem tokens.
4. Add a vitest snapshot/unit test that ensures `buildCssVariables(monochromeDark)` + `buildCssVariables(monochromeLight)` expose the same semantic keys; this guards against regressions when tokens evolve.

## Phase F — Rollout & Verification
1. Run `pnpm run lint` + `pnpm run build` to ensure the CSS imports still tree-shake with Vite/Tauri and no unused variable warnings remain.
2. Manually test the theme switcher across:
   - Chat surface (message gradients, composer focus ring).
   - Monitoring dashboard (badges/glows now monochrome).
   - XP/exp-fusion overlays (ensure HUD glows use metal palette in both modes).
3. Capture screenshots for both modes and attach them to `GO_ALL_STATUS.md` or the release doc specified in SUPER PROMPT #6 to confirm monochrome compliance.

Delivering the above phases removes the last gem-themed traces, gives TITANE∞ a true dual-mode monochrome system, and keeps CSS/TS consumers aligned on a single semantic palette.
