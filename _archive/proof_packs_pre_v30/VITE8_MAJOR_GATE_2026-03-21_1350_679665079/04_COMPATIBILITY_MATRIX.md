# 04 — COMPATIBILITY MATRIX

All data from `npm info` (read-only). No installs performed.

| Package | Installed | Latest | Vite 8 Compatible? | Peer Range for Vite | Blocker Type |
|---------|-----------|--------|---------------------|---------------------|--------------|
| vite | 7.3.1 | **8.0.1** | N/A (IS the target) | — | — |
| @vitejs/plugin-react | 5.1.4 | 6.0.1 | ❌ NO (5.1.4) | `^4.2.0 \|\| ^7.0.0` (no ^8) | PLUGIN_CHAIN_BLOCKED |
| @vitejs/plugin-react@5.2.0 | — | 5.2.0 | ✅ YES | `^4.2.0 \|\| ^8.0.0` | NO_BLOCKER_FOUND |
| @vitejs/plugin-react@6.0.1 | — | 6.0.1 | ✅ YES (requires ^8) | `^8.0.0` | NO_BLOCKER_FOUND |
| vitest | 4.0.18 | 4.1.0 | ❌ NO (dep: ^6.0.0 \|\| ^7.0.0) | dep: `^6.0.0 \|\| ^7.0.0` | TEST_CHAIN_BLOCK |
| vitest@4.1.0 | — | 4.1.0 | ✅ YES | peer: `^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0-0` | NO_BLOCKER_FOUND |
| @vitest/browser | 4.0.18 | 4.1.0 | ❌ Same version constraint as vitest | coupled to vitest | TEST_CHAIN_BLOCK |
| @vitest/coverage-v8 | 4.0.18 | 4.1.0 | ❌ Same | coupled to vitest | TEST_CHAIN_BLOCK |
| @vitest/ui | 4.0.18 | 4.1.0 | ❌ Same | coupled to vitest | TEST_CHAIN_BLOCK |
| @vitest/browser-playwright | 4.0.18 | 4.1.0 | ❌ Same | coupled to vitest | TEST_CHAIN_BLOCK |
| @storybook/builder-vite | 10.3.1 | 10.3.1 | ✅ YES | `^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0` | NO_BLOCKER_FOUND |
| @storybook/react-vite | 10.3.1 | 10.3.1 | ✅ YES | `^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0` | NO_BLOCKER_FOUND |
| @storybook/addon-vitest | 10.3.1 | 10.3.1 | ✅ YES (vitest ^4.0.0) | vitest `^3.0.0 \|\| ^4.0.0` | NO_BLOCKER_FOUND |
| storybook | 10.3.1 | 10.3.1 | ✅ YES (no vite peer) | — | NO_BLOCKER_FOUND |
| vite-tsconfig-paths | 6.1.1 | 6.1.1 | ✅ YES | `vite: '*'` | NO_BLOCKER_FOUND |
| rollup-plugin-visualizer | 6.0.5 | 6.0.5 | ✅ YES | `rolldown: '1.x \|\| ^1.0.0-rc'` | NO_BLOCKER_FOUND |
| vite-plugin-compression | 0.5.1 | 0.5.1 | ✅ YES | `vite: '>=2.0.0'` | NO_BLOCKER_FOUND |
| workbox-build | (indirect) | 7.4.0 | ✅ YES | no vite peer | NO_BLOCKER_FOUND |
| @tauri-apps/cli | 2.10.0 | 2.10.0 | ✅ YES | no vite version constraint | NO_BLOCKER_FOUND |

## vite@8 Engine Requirements

```
engines: { node: '^20.19.0 || >=22.12.0' }
Running: v20.20.0  →  SATISFIES ^20.19.0  ✅
```

## vite@8 Bundler Change

```
dependencies: { rolldown: '1.0.0-rc.10' }
```
vite@8 uses rolldown (not rollup) as default bundler. This is a SIGNIFICANT internal change:
- `build.rollupOptions` is re-implemented via rolldown compatibility shim
- Most options are supported, but some rollup-specific `treeshake.*` sub-options may differ
- `rollup-plugin-visualizer` already declares rolldown peer support ✅
