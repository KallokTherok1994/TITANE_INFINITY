# 05 — BLOCKER CLASSIFICATION

## Blocker 1: vitest@4.0.18 — TEST_CHAIN_BLOCK

| Field | Value |
|-------|-------|
| Package | vitest@4.0.18 + @vitest/* suite |
| Type | TEST_CHAIN_BLOCK |
| Evidence | `npm info vitest@4.0.18 dependencies` → `vite: '^6.0.0 \|\| ^7.0.0'` |
| Supports vite@8? | ❌ NO — vite@8 outside dep range |
| Severity | HARD — installing vite@8 alongside vitest@4.0.18 would cause version conflict; vitest would resolve its own vite@7 internally |
| Workaround | YES — upgrade vitest + all @vitest/* to 4.1.0 (peer: `^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0-0`) |
| Packages affected | vitest, @vitest/browser, @vitest/coverage-v8, @vitest/ui, @vitest/browser-playwright (all 4.0.18 → 4.1.0) |

---

## Blocker 2: @vitejs/plugin-react@5.1.4 — PLUGIN_CHAIN_BLOCKED

| Field | Value |
|-------|-------|
| Package | @vitejs/plugin-react@5.1.4 |
| Type | PLUGIN_CHAIN_BLOCKED |
| Evidence | `npm info @vitejs/plugin-react@5.1.4 peerDependencies` → `vite: '^4.2.0 \|\| ^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0'` (no ^8) |
| Supports vite@8? | ❌ NO — peer range ends at ^7.0.0 |
| Severity | HARD — peer warning/error on vite@8 install |
| Workaround | YES — two options: (a) upgrade to @vitejs/plugin-react@5.2.0 (peer: `^4.2.0 \|\| ... \|\| ^8.0.0`), or (b) upgrade to @vitejs/plugin-react@6.0.1 (requires `^8.0.0`) |
| Recommendation | 5.2.0 for minimal delta; 6.0.1 for full vite@8 alignment (uses @rolldown/plugin-babel) |

---

## Blocker 3: rollupOptions.treeshake — CONFIG_MODE_BLOCK

| Field | Value |
|-------|-------|
| Package | vite.config.ts internal config |
| Type | CONFIG_MODE_BLOCK |
| Evidence | `grep -n "rollupOptions" vite.config.ts` → line 276: custom treeshake options |
| Issue | `treeshake: { moduleSideEffects: false, propertyReadSideEffects: false, tryCatchDeoptimization: false }` are rollup-specific sub-options |
| Supports vite@8/rolldown? | UNKNOWN — rolldown is API-compatible for most options but treeshake sub-options may differ |
| Severity | SOFT — likely silently ignored or accepted, but must be validated; unlikely to fail the build |
| Workaround | NEEDS_CONFIG — either remove treeshake object (use rolldown defaults) or test if rolldown accepts these options |

---

## Non-Blockers (Confirmed Clear)

| Package | Why Clear |
|---------|-----------|
| @storybook/builder-vite@10.3.1 | peer: `^8.0.0` included |
| @storybook/react-vite@10.3.1 | peer: `^8.0.0` included |
| storybook@10.3.1 | no vite peer dep |
| vite-tsconfig-paths@6.1.1 | peer: `*` |
| rollup-plugin-visualizer@6.0.5 | rolldown `1.x \|\| ^1.0.0-rc` peer |
| vite-plugin-compression@0.5.1 | peer: `>=2.0.0` |
| workbox-build | no vite dep |
| @tauri-apps/cli@2.10.0 | no vite version constraint |
| ESLint 10 | CLASSIFIED SEPARATELY — DO NOT TOUCH |
