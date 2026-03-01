# 04_COMMANDS_REAL.md — Commandes réelles (déduites de package.json)

**Generated:** 2026-02-28T16:13:09Z  
**Pack:** PREP_BG_2026-02-28_1613_a8b70c2

## Commandes de test (canoniques)

```bash
# Tests unitaires (vitest)
cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' \
  node_modules/.bin/vitest run

# Tests architecture (4-Ring)
cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' \
  node_modules/.bin/vitest run src/__tests__/architecture

# Tests compliance
cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' \
  node_modules/.bin/vitest run src/__tests__/compliance

# Tests Rust
mkdir -p dist && cd src-tauri && cargo test --lib

# Tests E2E (Playwright)
node_modules/.bin/playwright test e2e
# NOTE: E2E nécessite build Tauri + tauri-driver + contexte TITANE_E2E=1

# Tests all
cross-env NODE_OPTIONS='--max-old-space-size=8192' node_modules/.bin/vitest run \
  && cd src-tauri && cargo test --lib
```

## Commandes de build

```bash
# Build frontend uniquement (dev)
node_modules/.bin/vite build

# Build Tauri (PROD — nécessite token GO_FOR_PROD_BUILD__TITANE_INFINITY)
# tauri build

# Dev (non-prod)
# tauri dev  (requiert tauri CLI)
```

## Commandes de vérification

```bash
# Verify tauri-only
bash scripts/verify/enforce-tauri-only.sh

# Verify online-first
bash scripts/verify/enforce-online-first.sh

# Lint
node_modules/.bin/eslint "src/**/*.{ts,tsx,js,jsx}"

# Type check
node_modules/.bin/tsc --noEmit
```

## NOTE sur pnpm

pnpm absent du PATH. Remplacer `pnpm run <cmd>` par:

- `node node_modules/.bin/<tool> ...` (direct)
- ou `npx pnpm run <cmd>` (si npm >= 9)
