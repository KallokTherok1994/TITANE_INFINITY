# 03 — DISCOVERY

## Build/Dev Scripts (package.json)

```json
"dev": "tauri dev",
"build": "vite build",
"preview": "echo '🔒 TAURI-ONLY MODE' && exit 1",
"tauri": "^0.15.0"
```

NOTE: `dev` goes through Tauri (not raw vite dev). `build` uses `vite build` directly.

---

## vite.config.ts — Key Findings

File: `vite.config.ts`

**Imports:**
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import viteCompression from 'vite-plugin-compression';
import { injectManifest } from 'workbox-build';
import { visualizer } from 'rollup-plugin-visualizer';
import type { Plugin, PluginOption, ResolvedConfig } from 'vite';
```

**Custom plugins:**
- `workboxPlugin()` — uses `configResolved` + `closeBundle` hooks (stable Rollup/Rolldown Plugin API)
- `mainEntryMapPlugin()` — uses `configResolved` + `closeBundle` hooks (stable)

**Plugins array:** `react()`, `tsconfigPaths()`, `visualizer()`, `viteCompression()`, workboxPlugin, mainEntryMapPlugin

**Build options:**
- `base: './'` for builds (Tauri file:// compat)
- `assetsInclude: ['**/*.sh', ...]`
- `server.proxy` — Ollama proxy on `/api/ollama`

**rollupOptions (CRITICAL — rolldown compat check needed):**
```ts
rollupOptions: {
  input: { app: resolve(ROOT_DIR, 'index.html'), main: resolve(ROOT_DIR, 'src/main.tsx') },
  external: ['better-sqlite3', 'sqlite3', 'bindings', 'file-uri-to-path'],
  treeshake: {
    moduleSideEffects: false,        // ← rollup-specific option
    propertyReadSideEffects: false,  // ← rollup-specific option
    tryCatchDeoptimization: false,   // ← rollup-specific option
  },
  onwarn: (warning, warn) => { ... },  // filter EMPTY_BUNDLE + EVAL from onnxruntime
  output: {
    manualChunks: id => { ... },  // deterministic chunk splitting
  }
}
```

**⚠️ ROLLDOWN CONFIG RISK:** `treeshake.moduleSideEffects`, `propertyReadSideEffects`, `tryCatchDeoptimization` are rollup-specific. Rolldown's treeshake API may differ. These options may be silently ignored or throw on vite@8.

---

## vitest.config.ts

```ts
// Imports from vite (uses defineConfig from vitest/config)
// Workspace-based config with multiple projects
```

---

## vitest.workspace.ts

```ts
// Defines multiple vitest projects:
// - unit, integration, browser, storybook-tests
```

---

## .storybook/main.ts

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};
export default config;
```

Framework: `@storybook/react-vite` — uses vite as builder.

---

## Tauri vite references

- `src-tauri/` has no vite config files (vite is frontend-only)
- `@tauri-apps/cli@2.10.0` orchestrates the vite build via `tauri dev` / `tauri build`
- No explicit vite version constraint from Tauri CLI found
