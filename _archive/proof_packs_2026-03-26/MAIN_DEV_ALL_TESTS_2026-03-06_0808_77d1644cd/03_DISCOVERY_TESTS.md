# Discovery Tests

## cat package.json
```json
{
  "name": "titane-infinity",
  "version": "27.2.0",
  "description": "TITANE∞ v27.2.0 - TypeScript Strict Mode (0 errors)",
  "type": "module",
  "license": "SEE LICENSE.md",
  "packageManager": "pnpm@10.30.2+sha512.36cdc707e7b7940a988c9c1ecf88d084f8514b5c3f085f53a2e244c2921d3b2545bc20dd4ebe1fc245feec463bb298aecea7a63ed1f7680b877dc6379d8d0cb4",
  "scripts": {
    "preinstall": "node scripts/install/enforce-package-manager.cjs",
    "dev": "tauri dev",
    "dev:tauri": "node scripts/launch/dev_tauri_monitor.mjs",
    "dev:tauri:raw": "bash scripts/launch/deploy_full_local_dev.sh",
    "dev:tauri:no-ollama": "bash scripts/launch/deploy_full_local_dev.sh --no-ollama",
    "ollama:start": "ollama serve",
    "ollama:status": "curl -s http://127.0.0.1:11434/api/tags | jq . 2>/dev/null || echo 'Ollama not running'",
    "ollama:pull": "ollama pull llama3.2:latest",
    "ollama:bundle": "bash scripts/prepare-ollama-bundle.sh",
    "build": "vite build",
    "postbuild": "bash scripts/post-build.sh",
    "build:prod-safe": "NPM_CONFIG_IGNORE_SCRIPTS=1 vite build",
    "build:prod-safe:verify": "node scripts/guards/guard-prod-safe-build.mjs",
    "guard:ollama-proxy": "bash scripts/guard/guard-ollama-proxy.sh",
    "guard:ipc-only-tests": "bash scripts/guard/guard-ipc-only-tests.sh",
    "guard:dev-bridge": "node scripts/guard/guard-dev-bridge.mjs",
    "guard:ipc-contract": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run tests/contract/tauri-ipc-contract.test.ts",
    "build:tauri:e2e": "pnpm run guard:ollama-proxy && bash scripts/e2e/require-e2e-build-authorization.sh && vite build && tauri build --config src-tauri/tauri.conf.json",
    "build:production": "pnpm run lint && pnpm run format:check && pnpm run ollama:bundle && vite build && tauri build && bash scripts/post-build.sh",
    "preview": "echo '🔒 TAURI-ONLY MODE' && exit 1",
    "start": "echo '🔒 TAURI-ONLY MODE: Use pnpm run dev instead' && exit 1",
    "lint": "eslint \"src/**/*.{ts,tsx,js,jsx}\"",
    "lint:fix": "eslint \"src/**/*.{ts,tsx,js,jsx}\" --fix",
    "lint:staged": "lint-staged",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "tsc --noEmit",
    "verify": "pnpm run lint && pnpm run format:check && pnpm run check && pnpm run test:all && pnpm run verify:tauri-only && pnpm run verify:online-first && pnpm run verify:invariants-governed && pnpm run verify:network-guard && pnpm run guard:ipc-only-tests && pnpm run verify:seal-post-certification && pnpm run verify:instructions && pnpm run verify:docs:mermaid && pnpm run verify:tauri-configs",
    "verify:final100": "pnpm run check && pnpm run lint && pnpm run format:check && pnpm run verify:tauri-only",
    "verify:prod-boot": "node scripts/gates/vite-base-relative-gate.cjs",
    "verify:tauri-only": "bash scripts/verify/enforce-tauri-only.sh",
    "verify:online-first": "bash scripts/verify/enforce-online-first.sh",
    "verify:invariants-governed": "bash scripts/verify/enforce-invariants-governed.sh",
    "verify:network-guard": "bash scripts/guards/guard-network-policy.sh",
    "verify:command-whitelist-sync": "bash scripts/verify/verify-command-whitelist-sync.sh",
    "verify:seal-post-certification": "bash scripts/verify/verify-seal-post-certification.sh",
    "verify:instructions": "bash scripts/verify/verify-copilot-instructions.sh",
    "render:docs:mermaid": "bash scripts/verify/mermaid-render-sync.sh",
    "verify:docs:mermaid": "bash scripts/verify/verify-mermaid-diagrams.sh",
    "verify:docs:mermaid:change": "bash scripts/verify/mermaid-change-request-guard.sh",
    "verify:docs:mermaid:diff": "bash scripts/verify/mermaid-diff-intel.sh",
    "verify:docs:mermaid:status": "bash scripts/verify/mermaid-status-report.sh --check",
    "op:mermaid": "pnpm run verify:docs:mermaid:change && pnpm run render:docs:mermaid && pnpm run verify:docs:mermaid && bash scripts/verify/mermaid-hash-registry.sh --check && bash scripts/verify/verify-mermaid-drift.sh --strict --allowlist docs/diagrams/DRIFT_ALLOWLIST.txt && bash scripts/verify/mermaid-no-self-hash-guard.sh",
    "op:mermaid:pack": "bash scripts/verify/mermaid-proof-pack.sh",
    "verify:tauri-configs": "bash scripts/verify/validate-tauri-configs.sh",
    "verify:remediation-permissions": "node scripts/gates/remediation-permissions-widening-gate.js",
    "verify:autopr-v2": "node scripts/gates/autopr-v2-policy-gate.js",
    "verify:staged-patch-v2": "bash scripts/verify/staged-patch-v2-workflow.sh",
    "verify:proof-requirements-v2": "bash scripts/verify/proof-requirements-v2.sh",
    "verify:lab-runner-v2": "bash scripts/verify/lab-runner-v2.sh",
    "verify:scorecard-ci-gate-v2": "bash scripts/verify/scorecard-ci-gate-v2.sh",
    "verify:tauri-bundle-type": "bash scripts/verify/verify-tauri-bundle-type-warning.sh",
    "test": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run",
    "test:watch": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest --watch",
    "test:coverage": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run --coverage && pnpm run test:coverage:check",
    "test:coverage:unit": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run -c vitest.unit.config.ts --coverage",
    "test:coverage:integration": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run -c vitest.integration.config.ts --coverage",
    "test:coverage:check": "bash scripts/verify/verify-coverage.sh",
    "test:coverage:report": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run --coverage && echo 'Open coverage/index.html in browser'",
    "e2e:desktop:ensure": "bash scripts/e2e/ensure-webkit-webdriver.sh",
    "e2e:desktop:run": "node scripts/e2e/run-desktop-suite.js",
    "e2e:desktop:proof:online-chat": "bash scripts/e2e/run-online-chat-proof-ui.sh",
    "e2e:desktop": "pnpm run guard:ollama-proxy && bash scripts/e2e/require-e2e-build-authorization.sh && pnpm run e2e:desktop:ensure && pnpm run e2e:desktop:run",
    "test:e2e": "playwright test e2e",
    "test:e2e:playwright": "playwright test e2e",
    "test:e2e:vitest": "bash -c 'if [[ \"${TITANE_E2E_TAURI:-}\" != \"1\" ]]; then echo \"SKIP: Vitest E2E (src/tests/e2e) nécessite un contexte Tauri réel. Relance avec TITANE_E2E_TAURI=1\"; exit 0; fi; cross-env RUN_E2E_TESTS=1 NODE_OPTIONS=\"--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs\" vitest run src/tests/e2e/titane_e2e.test.ts'",
    "test:browser": "vitest --config vitest.browser.config.ts --run",
    "test:browser:ui": "vitest --config vitest.browser.config.ts --ui",
    "test:browser:watch": "vitest --config vitest.browser.config.ts",
    "test:dev-bridge:contract": "node scripts/dev/dev-bridge-contract-test.mjs",
    "test:100": "pnpm run test && pnpm run test:browser",
    "test:100:full": "pnpm run test && cross-env RUN_E2E_TESTS=1 pnpm run test:e2e:vitest && pnpm run test:browser",
    "test:rust": "mkdir -p dist && cd src-tauri && cargo test --lib",
    "test:tauri": "pnpm run test:rust",
    "test:architecture": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/architecture",
    "test:compliance": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/compliance",
    "test:omega": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/*omega*.test.ts",
    "test:all": "cross-env NODE_OPTIONS='--max-old-space-size=8192' pnpm run test && pnpm run test:rust && pnpm run test:architecture && pnpm run test:compliance",
    "test:all:full": "pnpm run test:all && pnpm run test:e2e:playwright",
    "audit": "pnpm audit && cd src-tauri && cargo audit",
    "audit:master": "./scripts/audit/00-master-audit.sh",
    "audit:security": "./scripts/audit/01-security-audit.sh",
    "audit:architecture": "./scripts/audit/02-architecture-audit.sh",
    "audit:performance": "./scripts/audit/03-performance-measure.sh",
    "audit:coverage": "./scripts/audit/04-test-coverage.sh",
    "audit:deployment": "./scripts/audit/05-deployment-audit.sh",
    "audit:auto-fix": "./scripts/audit/06-auto-fix.sh",
    "audit:quality-gates": "./scripts/audit/07-quality-gates.sh",
    "clean": "rm -rf node_modules target dist",
    "clean:vite": "rm -rf node_modules/.vite dist/.vite-cache",
    "clean:all": "rm -rf node_modules/.vite dist node_modules target",
    "titane": "./titane.sh",
    "titane:clean": "./titane.sh clean",
    "titane:repair": "./titane.sh repair",
    "titane:fix": "./titane.sh fix",
    "titane:build": "./titane.sh build",
    "titane:deploy": "./titane.sh deploy",
    "titane:full": "./titane.sh full",
    "titane:health": "./titane.sh health",
    "titane:dev": "node scripts/dev/dev-bridge.mjs",
    "gate:dist-assets": "node scripts/gate-dist-assets.mjs",
    "gate:appimage-index": "node scripts/gate-appimage-index.mjs",
    "gate:prod-boot": "bash scripts/gate-prod-boot.sh",
    "gate:all": "pnpm run gate:dist-assets && pnpm run gate:appimage-index",
    "stopline:rebuild-proof": "bash scripts/stopline_rebuild_proof.sh",
    "stopline:latest": "bash scripts/stopline_latest_report.sh",
    "reviewer:normalize": "node scripts/reviewer_gate_normalize.js",
    "auto-heal": "./scripts/maintenance/auto-heal.sh",
    "auto-fix": "pnpm run lint -- --fix && pnpm run format",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "docs": "typedoc",
    "docs:serve": "echo '🔒 TAURI-ONLY MODE' && exit 1",
    "prepare": "husky",
    "copilot-xs:validate": "node .github/copilot-xs/scripts/validate.js",
    "copilot-xs:precommit": "node .github/copilot-xs/scripts/precommit.js",
    "copilot-xs:status": "node .github/copilot-xs/scripts/agent-status.js",
    "copilot-xs:security-scan": "node .github/copilot-xs/scripts/security-scan.js",
    "copilot-xs:test": "pnpm run copilot-xs:validate && pnpm run test:all",
    "cline:install": "bash .clinerules/install-hooks.sh",
    "cline:test-hooks": "bash -c 'echo Testing hooks... && .clinerules/hooks/TaskStart < tests/fixtures/hook-test-input.json'",
    "cline:logs": "tail -f .clinerules/logs/operations.log",
    "cline:verify": "bash -c 'for hook in TaskStart PreToolUse PostToolUse UserPromptSubmit; do echo \"Testing $hook...\"; test -x .clinerules/hooks/$hook && echo \"✅ $hook\" || echo \"❌ $hook\"; done'",
    "registry:log": "node scripts/registry/log-event.js",
    "registry:snapshot": "node scripts/registry/rebuild-snapshot.js",
    "registry:dashboard": "node scripts/registry/render-dashboard.js",
    "registry:cycle:start": "node scripts/registry/start-cycle.js",
    "registry:cycle:close": "node scripts/registry/close-cycle.js",
    "verify:registry:sync": "node scripts/verify/registry-sync.js",
    "verify:registry:integrity": "node scripts/verify/registry-integrity.js",
    "verify:registry:quality": "node scripts/verify/registry-quality.js",
    "verify:registry": "pnpm -s verify:registry:sync && pnpm -s verify:registry:integrity && pnpm -s verify:registry:quality",
    "run:x3:tests": "bash scripts/lib/run_x3_profile.sh tests",
    "run:x3:build": "bash scripts/lib/run_x3_profile.sh build",
    "run:x3:network": "bash scripts/lib/run_x3_profile.sh network"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.90.21",
    "@tauri-apps/api": "^2.10.1",
    "@tauri-apps/plugin-dialog": "^2.6.0",
    "@tauri-apps/plugin-fs": "^2.4.5",
    "@tauri-apps/plugin-http": "^2.5.7",
    "@tauri-apps/plugin-shell": "^2.3.5",
    "@types/three": "^0.182.0",
    "@xenova/transformers": "^2.17.2",
    "better-sqlite3": "^12.6.2",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "dompurify": "^3.3.1",
    "eventemitter3": "^5.0.4",
    "framer-motion": "^12.34.3",
    "i18next": "^25.8.13",
    "i18next-browser-languagedetector": "^8.2.1",
    "lucide-react": "^0.563.0",
    "react-chrono": "^3.3.3",
    "react-d3-tree": "^3.6.6",
    "react-i18next": "^16.5.4",
    "react-is": "^19.2.4",
    "react-markdown": "^10.1.0",
    "react-router": "^7.13.1",
    "react-router-dom": "^7.13.1",
    "recharts": "3.6.0",
    "remark-gfm": "^4.0.1",
    "sonner": "^2.0.7",
    "three": "^0.182.0",
    "web-vitals": "^5.1.0",
    "zod": "^4.3.6",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.11.1",
    "@axe-core/react": "^4.11.1",
    "@chromatic-com/storybook": "^5.0.1",
    "@eslint/eslintrc": "^3.3.4",
    "@eslint/js": "^9.39.3",
    "@playwright/test": "^1.58.2",
    "@sentry/react": "^10.40.0",
    "@storybook/addon-a11y": "^10.2.12",
    "@storybook/addon-docs": "^10.2.12",
    "@storybook/addon-onboarding": "^10.2.12",
    "@storybook/addon-vitest": "^10.2.12",
    "@storybook/react-vite": "^10.2.12",
    "@tailwindcss/postcss": "^4.2.1",
    "@tauri-apps/cli": "2.10.0",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/better-sqlite3": "^7.6.13",
    "@types/node": "^25.3.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@types/react-router-dom": "^5.3.3",
    "@types/react-window": "^1.8.8",
    "@types/uuid": "^10.0.0",
    "@typescript-eslint/eslint-plugin": "^8.56.1",
    "@typescript-eslint/parser": "^8.56.1",
    "@vitejs/plugin-react": "^5.1.4",
    "@vitest/browser": "4.0.18",
    "@vitest/browser-playwright": "4.0.18",
    "@vitest/coverage-v8": "4.0.18",
    "@vitest/ui": "4.0.18",
    "@wdio/cli": "^9.24.0",
    "@wdio/local-runner": "^9.24.0",
    "@wdio/mocha-framework": "^9.24.0",
    "@wdio/spec-reporter": "^9.24.0",
    "autoprefixer": "^10.4.24",
    "axe-core": "^4.11.1",
    "baseline-browser-mapping": "^2.10.0",
    "cross-env": "^10.1.0",
    "eslint": "^9.39.3",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.26",
    "eslint-plugin-storybook": "^10.2.12",
    "happy-dom": "^20.7.0",
    "husky": "^9.1.7",
    "identity-obj-proxy": "^3.0.0",
    "jsdom": "^28.1.0",
    "lightningcss": "^1.31.1",
    "lint-staged": "^16.2.7",
    "mocha": "^11.7.5",
    "playwright": "^1.58.2",
    "postcss": "^8.5.6",
    "prettier": "^3.8.1",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-window": "^2.2.7",
    "rollup-plugin-visualizer": "^6.0.5",
    "storybook": "^10.2.12",
    "tailwindcss": "^4.2.1",
    "typescript": "^5.9.3",
    "uuid": "^13.0.0",
    "vite": "^7.3.1",
    "vite-plugin-compression": "^0.5.1",
    "vite-tsconfig-paths": "^6.1.1",
    "vitest": "4.0.18",
    "webdriverio": "^9.24.0",
    "workbox-build": "^7.4.0",
    "tauri": "^0.15.0"
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "better-sqlite3",
      "esbuild",
      "optipng-bin",
      "pngquant-bin",
      "protobufjs",
      "sharp",
      "zopflipng-bin"
    ],
    "overrides": {
      "mdast-util-to-hast": "^13.2.1",
      "got@<11.8.5": ">=11.8.5",
      "sharp@<0.30.5": ">=0.30.5",
      "semver-regex@<3.1.3": ">=3.1.3",
      "semver-regex@<3.1.4": ">=3.1.4",
      "sharp@<0.32.6": ">=0.32.6",
      "trim-newlines@<3.0.1": ">=3.0.1",
      "nth-check@<2.0.1": ">=2.0.1",
      "minimist@>=1.0.0 <1.2.6": ">=1.2.6",
      "tough-cookie@<4.1.3": ">=4.1.3",
      "ws@>=8.0.0 <8.17.1": ">=8.17.1",
      "semver@>=7.0.0 <7.5.2": ">=7.5.2",
      "http-cache-semantics@<4.1.1": ">=4.1.1",
      "cross-spawn@<6.0.6": ">=6.0.6",
      "cross-spawn@>=7.0.0 <7.0.5": ">=7.0.5",
      "lodash@<4.17.21": ">=4.17.21",
      "lodash@>=4.0.0 <4.17.21": ">=4.17.21",
      "tar-fs@>=3.0.0 <3.1.1": ">=3.1.1",
      "tmp@<=0.2.3": ">=0.2.4",
      "form-data@<2.5.4": ">=2.5.4",
      "tar-fs@>=3.0.0 <3.0.9": ">=3.0.9",
      "tar-fs@>=3.0.0 <3.0.7": ">=3.0.7",
      "qs@<6.14.1": ">=6.14.1",
      "lodash@>=4.0.0 <=4.17.22": ">=4.17.23",
      "diff@>=6.0.0 <8.0.3": ">=8.0.3",
      "source-map@0.8.0-beta.0": ">=0.7.4",
      "sourcemap-codec@1.4.8": ">=1.4.8",
      "whatwg-encoding@<1.1.0": ">=1.0.5"
    },
    "ignoredBuiltDependencies": []
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css,scss}": [
      "prettier --write"
    ]
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}

```

## find .github/workflows -type f -maxdepth 3 -print || true
```
find: attention : vous avez spécifié l'option globale -maxdepth après l'argument -type mais la position des options globales n'est pas interchangeable, c-à-d que -maxdepth affecte les tests spécifiés avant lui ainsi que ceux spécifiés après lui. Veuillez spécifier les options globales avant les autres arguments.
.github/workflows/global-distribution-monitor.yml
.github/workflows/capability-qualification.yml
.github/workflows/docs-deploy.yml
.github/workflows/cosmic-consciousness-synchronization.yml
.github/workflows/constitution-audit.yml
.github/workflows/universal-omniscience.yml
.github/workflows/rust-docker.yml
.github/workflows/performance.yml
.github/workflows/archive/README.md
.github/workflows/archive/ci-cd.yml
.github/workflows/archive/titane_ci.yml
.github/workflows/archive/ci.yml
.github/workflows/archive/release.yml
.github/workflows/codeql.yml
.github/workflows/changelog.yml
.github/workflows/secret-scan-gitleaks.yml
.github/workflows/deploy-v27-production.yml
.github/workflows/p3-stable-build.yml
.github/workflows/mermaid.yml
.github/workflows/release-certification-final.yml
.github/workflows/perfection-maintenance.yml
.github/workflows/consciousness-matrix.yml
.github/workflows/p6-capability-qualification.yml
.github/workflows/omniscient-programming-interface.yml
.github/workflows/release-deployment.yml
.github/workflows/ultimate-transcendence-synthesis.yml
.github/workflows/stable-build.yml
.github/workflows/multiversal-orchestrator.yml
.github/workflows/release-unified.yml
.github/workflows/source-reality-fusion.yml
.github/workflows/ai-system-optimization.yml
.github/workflows/quantum-evolution.yml
.github/workflows/p0-surface-guard.yml
.github/workflows/production-monitoring.yml
.github/workflows/mermaid-verify.yml
.github/workflows/gitguardian.yml
.github/workflows/infinite-dimensional-transcendence.yml
.github/workflows/final-state-beyond-all-states.yml
.github/workflows/reality-architect-mastery.yml
.github/workflows/registry-guard.yml
.github/workflows/p0-1-secrets-guard.yml
.github/workflows/p4-constitution-audit.yml
.github/workflows/p2-contract-guard.yml
.github/workflows/p3-build-guard.yml
.github/workflows/ci-unified.yml
.github/workflows/dependabot-auto-review.yml
.github/workflows/p5-runtime-governance.yml
```

## rg -n "pnpm .*test|pnpm .*e2e|playwright|wdio|vitest|cargo test" .github/workflows package.json scripts
```
package.json:25:    "guard:ipc-contract": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run tests/contract/tauri-ipc-contract.test.ts",
package.json:26:    "build:tauri:e2e": "pnpm run guard:ollama-proxy && bash scripts/e2e/require-e2e-build-authorization.sh && vite build && tauri build --config src-tauri/tauri.conf.json",
package.json:36:    "verify": "pnpm run lint && pnpm run format:check && pnpm run check && pnpm run test:all && pnpm run verify:tauri-only && pnpm run verify:online-first && pnpm run verify:invariants-governed && pnpm run verify:network-guard && pnpm run guard:ipc-only-tests && pnpm run verify:seal-post-certification && pnpm run verify:instructions && pnpm run verify:docs:mermaid && pnpm run verify:tauri-configs",
package.json:61:    "test": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run",
package.json:62:    "test:watch": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest --watch",
package.json:63:    "test:coverage": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run --coverage && pnpm run test:coverage:check",
package.json:64:    "test:coverage:unit": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run -c vitest.unit.config.ts --coverage",
package.json:65:    "test:coverage:integration": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run -c vitest.integration.config.ts --coverage",
package.json:67:    "test:coverage:report": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run --coverage && echo 'Open coverage/index.html in browser'",
package.json:71:    "e2e:desktop": "pnpm run guard:ollama-proxy && bash scripts/e2e/require-e2e-build-authorization.sh && pnpm run e2e:desktop:ensure && pnpm run e2e:desktop:run",
package.json:72:    "test:e2e": "playwright test e2e",
package.json:73:    "test:e2e:playwright": "playwright test e2e",
package.json:74:    "test:e2e:vitest": "bash -c 'if [[ \"${TITANE_E2E_TAURI:-}\" != \"1\" ]]; then echo \"SKIP: Vitest E2E (src/tests/e2e) nécessite un contexte Tauri réel. Relance avec TITANE_E2E_TAURI=1\"; exit 0; fi; cross-env RUN_E2E_TESTS=1 NODE_OPTIONS=\"--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs\" vitest run src/tests/e2e/titane_e2e.test.ts'",
package.json:75:    "test:browser": "vitest --config vitest.browser.config.ts --run",
package.json:76:    "test:browser:ui": "vitest --config vitest.browser.config.ts --ui",
package.json:77:    "test:browser:watch": "vitest --config vitest.browser.config.ts",
package.json:79:    "test:100": "pnpm run test && pnpm run test:browser",
package.json:80:    "test:100:full": "pnpm run test && cross-env RUN_E2E_TESTS=1 pnpm run test:e2e:vitest && pnpm run test:browser",
package.json:81:    "test:rust": "mkdir -p dist && cd src-tauri && cargo test --lib",
package.json:82:    "test:tauri": "pnpm run test:rust",
package.json:83:    "test:architecture": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/architecture",
package.json:84:    "test:compliance": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/compliance",
package.json:85:    "test:omega": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/*omega*.test.ts",
package.json:86:    "test:all": "cross-env NODE_OPTIONS='--max-old-space-size=8192' pnpm run test && pnpm run test:rust && pnpm run test:architecture && pnpm run test:compliance",
package.json:87:    "test:all:full": "pnpm run test:all && pnpm run test:e2e:playwright",
package.json:127:    "copilot-xs:test": "pnpm run copilot-xs:validate && pnpm run test:all",
package.json:179:    "@axe-core/playwright": "^4.11.1",
package.json:184:    "@playwright/test": "^1.58.2",
package.json:189:    "@storybook/addon-vitest": "^10.2.12",
package.json:207:    "@vitest/browser": "4.0.18",
package.json:208:    "@vitest/browser-playwright": "4.0.18",
package.json:209:    "@vitest/coverage-v8": "4.0.18",
package.json:210:    "@vitest/ui": "4.0.18",
package.json:211:    "@wdio/cli": "^9.24.0",
package.json:212:    "@wdio/local-runner": "^9.24.0",
package.json:213:    "@wdio/mocha-framework": "^9.24.0",
package.json:214:    "@wdio/spec-reporter": "^9.24.0",
package.json:232:    "playwright": "^1.58.2",
package.json:246:    "vitest": "4.0.18",
.github/workflows/ci-unified.yml:120:        run: pnpm run guard:ipc-only-tests
.github/workflows/ci-unified.yml:163:        run: pnpm run test -- --run
.github/workflows/ci-unified.yml:169:        run: pnpm run test:coverage
.github/workflows/ci-unified.yml:286:        run: cargo test --verbose
.github/workflows/ci-unified.yml:334:        run: pnpm exec playwright install --with-deps chromium
.github/workflows/ci-unified.yml:337:        run: pnpm run test:e2e
.github/workflows/ci-unified.yml:344:          name: playwright-report-${{ github.run_id }}
.github/workflows/ci-unified.yml:345:          path: playwright-report/
.github/workflows/registry-guard.yml:21:      - 'vitest*.config.ts'
.github/workflows/registry-guard.yml:22:      - 'playwright.config.ts'
.github/workflows/registry-guard.yml:23:      - 'wdio.conf.js'
.github/workflows/registry-guard.yml:39:      - 'vitest*.config.ts'
.github/workflows/registry-guard.yml:40:      - 'playwright.config.ts'
.github/workflows/registry-guard.yml:41:      - 'wdio.conf.js'
.github/workflows/release-deployment.yml:65:          if pnpm test -- --run tests/phase*/gate-*.test.ts tests/release/gate-release.test.ts; then
.github/workflows/rust-docker.yml:79:        run: cargo test --verbose
.github/workflows/capability-qualification.yml:158:          pnpm test -- --run tests/contract/tauri.contract.test.ts
.github/workflows/archive/titane_ci.yml:56:        run: pnpm run test -- --run
.github/workflows/archive/titane_ci.yml:130:        run: cargo test
.github/workflows/archive/ci-cd.yml:56:        run: pnpm run test -- --run
.github/workflows/archive/ci-cd.yml:84:        run: cd src-tauri && cargo test
.github/workflows/archive/ci-cd.yml:110:        run: pnpm exec playwright install --with-deps
.github/workflows/archive/ci-cd.yml:113:        run: pnpm run test:e2e
.github/workflows/archive/ci-cd.yml:119:          name: playwright-report
.github/workflows/archive/ci-cd.yml:120:          path: playwright-report/
scripts/merge-dev-to-main.sh:142:        print_info "Running pnpm tests..."
scripts/merge-dev-to-main.sh:143:        if pnpm test; then
scripts/merge-dev-to-main.sh:156:        print_warning "ppnpm not found, skipping tests"
.github/workflows/archive/ci.yml:32:        run: pnpm run test:coverage
.github/workflows/archive/ci.yml:63:        run: cargo test --verbose
.github/workflows/archive/ci.yml:88:        run: pnpm exec playwright install --with-deps
.github/workflows/archive/ci.yml:91:        run: pnpm run test:e2e
.github/workflows/archive/ci.yml:97:          name: playwright-report
.github/workflows/archive/ci.yml:98:          path: playwright-report/
.github/workflows/archive/ci.yml:152:        run: pnpm run test -- --run
scripts/install/install-e2e.sh:2:pnpm install -D @playwright/test playwright
scripts/install/install-e2e.sh:4:	corepack pnpm exec playwright install
scripts/install/install-e2e.sh:6:	pnpm exec playwright install
scripts/setup-dev.sh:25:    corepack pnpm exec playwright install
scripts/setup-dev.sh:27:    pnpm exec playwright install
scripts/setup-dev.sh:38:pnpm test
scripts/deployment/certified-deploy.sh:126:    log_verbose "Executing: pnpm test -- --run tests/phase*/gate-*.test.ts tests/release/gate-release.test.ts"
scripts/deployment/certified-deploy.sh:135:    if ./.tools/node/current/bin/pnpm test -- --run tests/phase*/gate-*.test.ts tests/release/gate-release.test.ts >> "$LOG_FILE" 2>&1; then
scripts/deployment/tauri-full-deploy.sh:447:    run_cmd "cargo test" "Rust tests" || warning "Rust tests failed"
scripts/test-wrapper.sh:30:# Some tasks call: `pnpm test -- --run`.
scripts/test-wrapper.sh:31:# But we already invoke `vitest run`, so the extra `--run` flag can be treated as invalid
scripts/test-wrapper.sh:42:npx cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run "${VITEST_ARGS[@]}" 2>&1 | tee "$TEMP_OUTPUT"
scripts/lib/run_x3_profile.sh:22:    CMD=(timeout "$timeout_sec" pnpm run test:architecture)
scripts/lib/run_x3_profile.sh:28:    CMD=(timeout "$timeout_sec" pnpm run build:tauri:e2e)
scripts/registry/log-event.js:17: *     --suiteId=vitest-core \
scripts/registry/log-event.js:18: *     --command="pnpm test" \
scripts/registry/log-event.js:74:    /\b(pnpm|vitest|cargo|tauri|workflow|gate|suite)\b/i.test(d) ||
scripts/e2e/p10_6_enhanced_debug.sh:117:  pnpm exec wdio run wdio.desktop.conf.cjs
scripts/e2e/run-stable-e2e.sh:80:if pnpm exec playwright test "$@"; then
scripts/e2e/run-online-chat-proof-ui.sh:13:SPEC_PATH="e2e/desktop/online-chat-proof-ui.wdio.test.js"
scripts/e2e/run-online-chat-proof-ui.sh:15:WDIO_LOG="$OUT_DIR/wdio-online-chat-proof-ui.log"
scripts/e2e/run-online-chat-proof-ui.sh:56:pnpm exec wdio run wdio.desktop.conf.cjs --spec "$SPEC_PATH" 2>&1 | tee "$WDIO_LOG"
scripts/e2e/ensure-webkit-webdriver.sh:22:  "$HOME/.cache/ms-playwright/webkit-2248/minibrowser-gtk/WebKitWebDriver"
scripts/e2e/ensure-webkit-webdriver.sh:23:  "$HOME/.cache/ms-playwright/webkit-2248/minibrowser-gtk/bin/WebKitWebDriver"
scripts/e2e/ensure-webkit-webdriver.sh:26:for pw_driver in "$HOME"/.cache/ms-playwright/webkit-*/minibrowser-gtk/WebKitWebDriver; do
scripts/e2e/ensure-webkit-webdriver.sh:32:for pw_driver in "$HOME"/.cache/ms-playwright/webkit-*/minibrowser-gtk/bin/WebKitWebDriver; do
scripts/init-copilot-xs.sh:142:- Gate: run `pnpm run test:all` (or repo verify) before merge
scripts/init-copilot-xs.sh:424:  pnpm pkg set scripts.copilot-xs:test="pnpm run copilot-xs:validate && pnpm run test:all" >/dev/null
scripts/init-copilot-xs.sh:430:    pnpm install --save-dev @modelcontextprotocol/server-filesystem@latest \
scripts/init-copilot-xs.sh:460:    "test": "pnpm run copilot-xs:test"
scripts/e2e/run_e2e_tauri.sh:46:  timeout "$MAX_TIMEOUT_SECONDS" pnpm run e2e:desktop >> "$LOG_FILE" 2>&1
scripts/test-all.sh:9:pnpm test -- --coverage --silent
scripts/test-all.sh:13:cargo test --quiet
scripts/test-all.sh:25:pnpm run test:e2e
scripts/test-all.sh:34:pnpm run test:a11y
scripts/e2e/run-desktop-suite.js:14:const WDIO_LOG = path.join(REPORTS, 'wdio.log');
scripts/e2e/run-desktop-suite.js:17:const WDIO_CONFIG = path.resolve(ROOT, 'wdio.desktop.conf.cjs');
scripts/e2e/run-desktop-suite.js:77:  const cacheRoot = path.join(os.homedir(), '.cache', 'ms-playwright');
scripts/e2e/run-desktop-suite.js:133:const wdioArgs = ['exec', 'wdio', 'run', WDIO_CONFIG];
scripts/e2e/run-desktop-suite.js:135:  wdioArgs.push('--spec', WDIO_SPEC);
scripts/e2e/run-desktop-suite.js:138:await appendDiag(`wdio command: pnpm ${wdioArgs.join(' ')}`);
scripts/e2e/run-desktop-suite.js:139:const wdio = spawnLogged('pnpm', wdioArgs, WDIO_LOG);
scripts/e2e/run-desktop-suite.js:142:  for (const child of [wdio, tauriDriver]) {
scripts/e2e/run-desktop-suite.js:152:wdio.on('exit', async code => {
scripts/e2e/run-desktop-suite.js:156:    await appendDiag(`wdio_log=${WDIO_LOG}`);
scripts/e2e/run-ui-chat-360-autofix.cjs:186:  const wdioArgs = [
scripts/e2e/run-ui-chat-360-autofix.cjs:188:    'wdio',
scripts/e2e/run-ui-chat-360-autofix.cjs:190:    'wdio.desktop.conf.cjs',
scripts/e2e/run-ui-chat-360-autofix.cjs:192:    'e2e/desktop/ui-chat-360-autofix.wdio.test.cjs',
scripts/e2e/run-ui-chat-360-autofix.cjs:195:  const wdio = spawn('pnpm', wdioArgs, {
scripts/e2e/run-ui-chat-360-autofix.cjs:209:  wdio.on('close', code => {
scripts/run_all.sh:14:bash "$SCRIPT_DIR/lib/run_x3.sh" "$PACK_DIR/06_TESTS_X3.log" pnpm run test:rust
scripts/run_all.sh:15:bash "$SCRIPT_DIR/lib/run_x3.sh" "$PACK_DIR/06_TESTS_X3.log" pnpm run test -- src/hooks/__tests__/useTitaneDb.test.ts
scripts/run_all.sh:18:if pnpm run test:e2e -- --list >/dev/null 2>&1; then
scripts/run_all.sh:19:	bash "$SCRIPT_DIR/lib/run_x3.sh" "$PACK_DIR/08_E2E_X3.log" pnpm run test:e2e
scripts/auto-all.sh:168:    pnpm test -- --run || {
scripts/auto-all.sh:175:    cargo test || {
scripts/advanced-diagnostic.sh:502:    echo -e "${CYAN}⚡ OPTIMIZATION:${NC} Use 'pnpm run boot:test' for quick health checks" | tee -a "${DIAGNOSTIC_LOG}"
scripts/run-e2e-tests.sh:38:if ! pm_exec playwright --version &>/dev/null; then
scripts/run-e2e-tests.sh:40:  pm install -D @playwright/test
scripts/run-e2e-tests.sh:41:  pm_exec playwright install
scripts/run-e2e-tests.sh:43:  PLAYWRIGHT_VERSION=$(pm_exec playwright --version)
scripts/run-e2e-tests.sh:62:    pm_exec playwright test e2e/critical --reporter=list
scripts/run-e2e-tests.sh:66:    pm_exec playwright test e2e/smoke.test.ts --reporter=list
scripts/run-e2e-tests.sh:70:    pm_exec playwright test e2e/critical/app-launch.spec.ts --reporter=list
scripts/run-e2e-tests.sh:74:    pm_exec playwright test e2e/critical/chat-interaction.spec.ts --reporter=list
scripts/run-e2e-tests.sh:78:    pm_exec playwright test e2e/critical/visual-engine.spec.ts --reporter=list
scripts/run-e2e-tests.sh:82:    pm_exec playwright test e2e/critical/system-resilience.spec.ts --reporter=list
scripts/run-e2e-tests.sh:86:    pm_exec playwright test --ui
scripts/run-e2e-tests.sh:90:    pm_exec playwright test --debug
scripts/run-e2e-tests.sh:105:echo "║   📊 Report: playwright-report/index.html                         ║"
scripts/auto/weekly-diagnostic.sh:63:TEST_OUTPUT=$(cd src-tauri && cargo test --lib 2>&1 || true && cd ..)
scripts/stopline_latest_report.sh:6:#   pnpm run stopline:latest
scripts/stopline_latest_report.sh:7:#   cat "$(pnpm run -s stopline:latest)/STATUS.md"
scripts/verify_backend.sh:85:if cargo test 2>&1 | tee test.log | tail -20; then
scripts/test_perfection_chat_ia.sh:107:  echo -e "  ${YELLOW}ℹ️  Pour exécuter: pnpm run test:e2e tests/e2e/chat-race-conditions.spec.ts${NC}"
scripts/test_perfection_chat_ia.sh:141:echo "  pnpm run test:e2e tests/e2e/chat-race-conditions.spec.ts"
scripts/audit/04-test-coverage.sh:45:    pnpm test -- --coverage --json --outputFile="$REPORT_DIR/test-results.json" > "$REPORT_DIR/test-output.txt" 2>&1 || {
scripts/audit/04-test-coverage.sh:67:    cargo test 2>&1 | tee "../$REPORT_DIR/rust-test-output.txt" || {
scripts/audit/04-test-coverage.sh:302:      - run: pnpm test -- --coverage
scripts/audit/04-test-coverage.sh:315:      - run: cd src-tauri && cargo test --verbose
scripts/validate-production.sh:29:pnpm test -- --coverage --silent && check "Frontend tests" || check "Frontend tests"
scripts/validate-production.sh:30:cd src-tauri && cargo test --quiet && cd .. && check "Backend tests" || check "Backend tests"
scripts/run-vitest.mjs:18:  { label: 'unit', config: 'vitest.unit.config.ts' },
scripts/run-vitest.mjs:19:  { label: 'integration', config: 'vitest.integration.config.ts' },
scripts/run-vitest.mjs:23:  const result = spawnSync('vitest', ['run', '--config', suite.config, ...args], {
scripts/cleanup/post-deploy-dependencies.sh:37:pnpm update @tauri-apps/cli@latest 2>&1 | grep -E "(updated|^>)" || echo "   (already latest)"
scripts/cleanup/post-deploy-dependencies.sh:38:pnpm update @tauri-apps/tauri@latest 2>&1 | grep -E "(updated|^>)" || echo "   (already latest)"
scripts/cleanup/post-deploy-dependencies.sh:42:pnpm update @playwright/test@latest 2>&1 | grep -E "(updated|^>)" || echo "   (already latest)"
scripts/cleanup/post-deploy-dependencies.sh:93:echo "   pnpm run test && pnpm run test:rust"
scripts/certification/lib_cert.sh:267:  elif echo "$failure_output" | grep -q "E2E\|wdio"; then
scripts/audit/07-quality-gates.sh:137:    if timeout "$TEST_TIMEOUT" pnpm vitest run --reporter=basic 2>&1 | tail -5 | grep -q "passed"; then
scripts/validate-boot.sh:14:timeout 30s pnpm run dev > /tmp/boot-test.log 2>&1 &
scripts/maintenance/safe-run.sh:161:    run_cmd ./.tools/node/current/bin/pnpm test -- --run
scripts/maintenance/safe-run.sh:162:    run_cmd ./.tools/node/current/bin/pnpm run test:tauri
scripts/maintenance/safe-run.sh:169:    run_cmd ./.tools/node/current/bin/pnpm run copilot-xs:test
scripts/maintenance/safe-run.sh:204:    run_cmd rm -rf node_modules/.cache .vite-cache playwright-report test-results coverage
scripts/maintenance/safe-run.sh:228:    run_cmd ./.tools/node/current/bin/pnpm test -- --run tests/contract/tauri.contract.test.ts
scripts/maintenance/safe-run.sh:232:    run_cmd ./.tools/node/current/bin/pnpm test -- --run tests/phase3/gate-p3.test.ts
scripts/maintenance/safe-run.sh:236:    run_cmd ./.tools/node/current/bin/pnpm test -- --run tests/phase4/gate-p4.test.ts
scripts/maintenance/actions.yml:46:    command: './.tools/node/current/bin/pnpm test -- --run && ./.tools/node/current/bin/pnpm run test:tauri'
scripts/maintenance/actions.yml:60:    command: './.tools/node/current/bin/pnpm run copilot-xs:test'
scripts/maintenance/actions.yml:162:    command: 'rm -rf node_modules/.cache .vite-cache playwright-report test-results coverage'
scripts/maintenance/actions.yml:212:    command: './.tools/node/current/bin/pnpm test -- --run tests/contract/tauri.contract.test.ts'
scripts/maintenance/actions.yml:226:    command: './.tools/node/current/bin/pnpm test -- --run tests/phase3/gate-p3.test.ts'
scripts/maintenance/actions.yml:240:    command: './.tools/node/current/bin/pnpm test -- --run tests/phase4/gate-p4.test.ts'
scripts/test-100-percent-suite.sh:28:if pnpm run test:rust; then
scripts/test-100-percent-suite.sh:29:  RUST_PASSED=$(pnpm run test:rust 2>&1 | grep -oP 'test result: ok.*' | head -1 || echo "✅ All Rust tests passed")
scripts/test-100-percent-suite.sh:48:echo "   Run separately with: pnpm run test:e2e:playwright"
scripts/maintenance/typescript_cleanup_v19.2.1.sh:87:if pnpm test -- chat-ia-diagnostic.test.ts > /tmp/test_result.log 2>&1; then
scripts/maintenance/automation-suite.sh:120:  if cargo test --all > "$LOG_DIR/cargo-tests.log" 2>&1; then
scripts/maintenance/automation-suite.sh:126:  if pnpm run test > "$LOG_DIR/jest-tests.log" 2>&1; then
scripts/maintenance/health-check-enhanced.sh:259:    # Check vitest configuration
scripts/maintenance/health-check-enhanced.sh:260:    if [[ -f "vitest.config.ts" ]]; then
scripts/maintenance/health-check-enhanced.sh:261:        check_pass "vitest.config.ts exists"
scripts/maintenance/health-check-enhanced.sh:263:        check_fail "vitest.config.ts missing"
scripts/maintenance/health-check-enhanced.sh:266:    # Check playwright configuration
scripts/maintenance/health-check-enhanced.sh:267:    if [[ -f "playwright.config.ts" ]]; then
scripts/maintenance/health-check-enhanced.sh:268:        check_pass "playwright.config.ts exists"
scripts/maintenance/health-check-enhanced.sh:270:        check_fail "playwright.config.ts missing"
scripts/maintenance/proactive-monitor.sh:86:        "vitest.config.ts"
scripts/test/test_security_hardening_v19.3.sh:25:echo "✅ Test 2/5: Tests Unitaires (cargo test security::)"
scripts/test/test_security_hardening_v19.3.sh:26:cargo test --lib security:: --quiet 2>&1 | grep -E "test result:|passed"
scripts/certification/run-p10-desktop-cert.sh:180:        npx playwright --version || echo "playwright: not found"
scripts/certification/run-p10-desktop-cert.sh:181:        npx wdio --version || echo "wdio: not found"
scripts/certification/run-p10-desktop-cert.sh:396:        if pnpm run test > "${run_file}" 2>&1; then
scripts/certification/run-p10-desktop-cert.sh:450:        if pnpm run test:coverage:integration > "${run_file}" 2>&1; then
scripts/certification/run-p10-desktop-cert.sh:525:        if pnpm run e2e:desktop:run >> "${run_file}" 2>&1; then
scripts/gates/f2-rc-gates-x3.sh:122:    run_gate "G_RC_SCHEMA_CONTRACT_REQUIRED" "$F2_SCHEMA_TIMEOUT_SEC" pnpm -s exec vitest run tests/contract/tauri-ipc-contract.test.ts || fail=$((fail+1))
scripts/test/run_copilot_xs_test_logged.sh:19:  echo "Command: pnpm run copilot-xs:test"
scripts/test/run_copilot_xs_test_logged.sh:27:  nohup bash -lc "cd '$ROOT_DIR' && pnpm run copilot-xs:test" >>"$LOG_FILE" 2>&1 &
scripts/test/run_copilot_xs_test_logged.sh:38:  stdbuf -oL -eL pnpm run copilot-xs:test 2>&1 | tee -a "$LOG_FILE"
scripts/test/run_copilot_xs_test_logged.sh:40:  pnpm run copilot-xs:test 2>&1 | tee -a "$LOG_FILE"
scripts/certification/p3-runner.sh:56:# Vérifier playwright binaries
scripts/certification/p3-runner.sh:57:if [[ ! -d "node_modules/@playwright/test" ]]; then
scripts/certification/p3-runner.sh:110:pnpm exec playwright test e2e/chat-provider-decision-certification.spec.ts \
scripts/certification/p3-runner.sh:127:if [[ -d "playwright-report" ]]; then
scripts/certification/p3-runner.sh:128:  cp -r playwright-report "$EVIDENCE_DIR/" 2>/dev/null || true
scripts/certification/p3-runner.sh:212:- playwright-report/ (HTML report)
scripts/test/verify_dialog_plugin.sh:143:    echo "   2. pnpm run dev (test mode dev)"
scripts/gates/ui-single-topnav-gate.js:9:const TEST_CMD = 'pnpm -s vitest run src/__tests__/ui/ui-navigation.test.ts';
scripts/test/validate_extensions.sh:103:    "ms-playwright.playwright"
scripts/test/run_tests.sh:24:cargo test --manifest-path src-tauri/Cargo.toml --lib 2>&1 | tee /tmp/titane_test_results.txt
scripts/progress-tracker.sh:58:# Test coverage (simulated - would need actual pnpm test run)
scripts/test/test-bootstrap-api-keys.sh:27:pnpm run dev:tauri > /tmp/titane-bootstrap-test.log 2>&1 &
scripts/validate-super-prompts-v21.1.sh:127:    if cargo test --lib "$test" --quiet 2>/dev/null; then
scripts/autoheal/autoheal_rules.jsonl:2:{"id":"AH-2026-03-04-0002","date":"2026-03-04","scope":["e2e-desktop","wdio","tauri-wrapper"],"symptom":"SMOKE_UI échoue en runtime AppImage avec éléments non interactifs et absence de réponse assistant/erreur visible (no-silence)","root_cause":"Variabilité d'interaction WRY/WebKit sur éléments top-nav/chat + comportement no-silence non déterministe sur runtime packagé offline","fix":"Durcissement du driver WDIO (fallback ready, navigation par route directe, click/setValue JS fallback, no-silence multi-signaux) et assouplissement des assertions de root page via route active","prevention_test":"bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh && TITANE_E2E=1 WDIO_SPEC=./e2e/desktop/ui-ultra-smoke.e2e.js node scripts/e2e/run-desktop-suite.js","commands":["TITANE_E2E=1 TITANE_MEMORY_DIR=/tmp/titane-ultra/memory TITANE_LOG_DIR=/tmp/titane-ultra/logs TITANE_E2E_ARTIFACTS_DIR=proof_packs/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke WDIO_SPEC=./e2e/desktop/ui-ultra-smoke.e2e.js node scripts/e2e/run-desktop-suite.js","bash scripts/qa/run_x3.sh proof_packs/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8 05_E2E_RUNS_X3.log smoke_ui \"...\"","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh"],"files_changed":["e2e/desktop/ui-driver.wdio.js","e2e/desktop/ui-ultra-smoke.e2e.js","e2e/desktop/ui-ultra-full.e2e.js","scripts/autoheal/autoheal_rules.jsonl"],"rollback":"git restore -- e2e/desktop/ui-driver.wdio.js e2e/desktop/ui-ultra-smoke.e2e.js e2e/desktop/ui-ultra-full.e2e.js scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:3:{"id":"AH-2026-03-04-0003","date":"2026-03-04","scope":["e2e-desktop","wdio","no-silence"],"symptom":"Le scénario smoke desktop échoue avec `No-silence contract failed` en runtime Tauri packagé","root_cause":"Le runtime AppImage ne produit pas systématiquement de réponse assistant ni d'erreur visible malgré l'envoi utilisateur, avec interactions WebDriver intermittentes","fix":"Fallbacks déterministes dans `ui-driver.wdio.js` (ready/nav/click/setValue/no-silence multi-signaux) + fallback route active dans suites smoke/full","signature":"UI Desktop Ultra Smoke (WDIO/Tauri) + marker `No-silence contract failed` dans artifacts/smoke/wdio.log","verification":"TITANE_E2E=1 TITANE_MEMORY_DIR=/tmp/titane-ultra/memory TITANE_LOG_DIR=/tmp/titane-ultra/logs TITANE_E2E_ARTIFACTS_DIR=proof_packs/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke WDIO_SPEC=./e2e/desktop/ui-ultra-smoke.e2e.js node scripts/e2e/run-desktop-suite.js","prevention":"bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh (garde anti-récurrence + conformité instructions)","prevention_test":"bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh","commands":["TITANE_E2E=1 TITANE_MEMORY_DIR=/tmp/titane-ultra/memory TITANE_LOG_DIR=/tmp/titane-ultra/logs TITANE_E2E_ARTIFACTS_DIR=proof_packs/UI_E2E_ULTRA_2026-03-04_1809_2555e61a8/artifacts/smoke WDIO_SPEC=./e2e/desktop/ui-ultra-smoke.e2e.js node scripts/e2e/run-desktop-suite.js","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh"],"files_changed":["e2e/desktop/ui-driver.wdio.js","e2e/desktop/ui-ultra-smoke.e2e.js","e2e/desktop/ui-ultra-full.e2e.js","scripts/autoheal/autoheal_rules.jsonl"],"rollback":"git restore -- e2e/desktop/ui-driver.wdio.js e2e/desktop/ui-ultra-smoke.e2e.js e2e/desktop/ui-ultra-full.e2e.js scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:8:{"id":"AH-2026-03-05-0004b","date":"2026-03-05","scope":["e2e-desktop","wdio","ui-driver"],"symptom":"Le smoke ULTRA enchaîne des échecs intermittents: onglet non interactable, no-silence chat (envoi non accusé), puis checkbox admin non interactable","root_cause":"Le driver WDIO ne gérait pas assez les états WRY/WebKit (onglet déjà actif, setter React pour input contrôlé, checkbox non clickable malgré visible)","fix":"Durcissement de `e2e/desktop/ui-driver.wdio.js`: skip tab déjà sélectionné + click résilient, saisie fallback React-compatible (native value setter + InputEvent), attente explicite d'activation `chat-send`, déclenchement d'envoi robuste, clic résilient pour checkboxes","prevention_test":"bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh && (WDIO_SPEC=./e2e/desktop/ui-ultra-smoke.e2e.js pnpm -s e2e:desktop:run) x3","commands":["TITANE_E2E_ARTIFACTS_DIR=proof_packs/UI_E2E_ULTRA_1772668572_fixall/logs WDIO_SPEC=./e2e/desktop/ui-ultra-smoke.e2e.js pnpm -s e2e:desktop:run","BASE=proof_packs/UI_E2E_ULTRA_x3_1772668667 ; for i in 1 2 3; do TITANE_E2E_ARTIFACTS_DIR=$BASE/run${i}/logs WDIO_SPEC=./e2e/desktop/ui-ultra-smoke.e2e.js pnpm -s e2e:desktop:run; done","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh"],"files_changed":["e2e/desktop/ui-driver.wdio.js","scripts/autoheal/autoheal_rules.jsonl"],"rollback":"git restore -- e2e/desktop/ui-driver.wdio.js scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:9:{"id":"AH-2026-03-05-0005","date":"2026-03-05","scope":["prod-build","prod-deploy","deployment-latest"],"symptom":"Le chemin `./titane.sh build stable` génère des bundles `27.0.5`, en décalage avec la version canonique `27.2.0` des fichiers de release","root_cause":"`runtime/stable/tauri.conf.json` reste versionné en `27.0.5` alors que la release canonique suit `src-tauri/tauri.conf.json` + `package.json` en `27.2.0`","fix":"Build PROD aligné via `pnpm exec tauri build --config src-tauri/tauri.conf.json`, puis publication contrôlée des artefacts `27.2.0` vers `deployment/latest` avec régénération `SHA256SUMS_v27.2.0.txt`, `SIZES_v27.2.0.txt`, mise à jour des miroirs (`SHA256SUMS.txt`, `SIZES.txt`, `CHECKSUMS.sha256`) et synchronisation `MANIFEST.json`","prevention_test":"node -e \"const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8')).version;const t=JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json','utf8')).version;const m=JSON.parse(fs.readFileSync('deployment/latest/MANIFEST.json','utf8')).version;if(!(p===t&&p===m)) process.exit(1)\" && test -f deployment/latest/SHA256SUMS_v27.2.0.txt && test -f deployment/latest/SIZES_v27.2.0.txt && bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh","commands":["pnpm exec tauri build --config src-tauri/tauri.conf.json","sha256sum deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage deployment/latest/TITANE-Infinity_27.2.0_amd64.deb deployment/latest/TITANE-Infinity-27.2.0-1.x86_64.rpm | sort > deployment/latest/SHA256SUMS_v27.2.0.txt","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh"],"files_changed":["deployment/latest/CHECKSUMS.sha256","deployment/latest/MANIFEST.json","deployment/latest/SHA256SUMS.txt","deployment/latest/SHA256SUMS_v27.2.0.txt","deployment/latest/SIZES.txt","deployment/latest/SIZES_v27.2.0.txt","scripts/autoheal/autoheal_rules.jsonl"],"rollback":"git restore -- deployment/latest/CHECKSUMS.sha256 deployment/latest/MANIFEST.json deployment/latest/SHA256SUMS.txt deployment/latest/SHA256SUMS_v27.2.0.txt deployment/latest/SIZES.txt deployment/latest/SIZES_v27.2.0.txt scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:17:{"id":"AH-2026-03-05-0013","date":"2026-03-05","scope":["ci","deploy-workflow","native-deps"],"symptom":"Le launch PROD échoue pendant `pnpm install` avec `pngquant failed to build`","root_cause":"Le runner CI ne dispose pas de `libpng-dev`, requis pour compiler `pngquant-bin` quand le prebuild n'est pas utilisable","fix":"Ajout de l'installation `libpng-dev` dans le job de tests (avant `pnpm install`) et dans les dépendances système du job de build/publish","prevention_test":"bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh && gh workflow view .github/workflows/deploy-v27-production.yml --ref seal/vΩ5-20260303-98262da88 --yaml | rg -n libpng-dev","commands":["gh run view 22697844863 --repo KallokTherok1994/TITANE_INFINITY --log-failed","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh","gh workflow view .github/workflows/deploy-v27-production.yml --ref seal/vΩ5-20260303-98262da88 --yaml"],"files_changed":[".github/workflows/deploy-v27-production.yml","scripts/autoheal/autoheal_rules.jsonl"],"rollback":"git restore -- .github/workflows/deploy-v27-production.yml scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:19:{"id":"AH-2026-03-05-0015","date":"2026-03-05","scope":["ci","format-gate","verify-final100"],"symptom":"Le launch PROD reste bloqué/échoue dans `verify:final100` sur la phase `prettier --check .`","root_cause":"Artifact de bootstrap `.seal_bootstrap_capture.md` inclus dans la vérification Prettier + drift de format sur plusieurs fichiers source","fix":"Ajout de `.seal_bootstrap_capture.md` à `.prettierignore` et reformatage ciblé des fichiers signalés par Prettier pour rétablir `format:check`","prevention_test":"pnpm run verify:final100 && bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh","commands":["pnpm prettier --write .github/instructions/tests-e2e.instructions.md scripts/qa/check_autofix_autoheal_registry.mjs scripts/qa/discover_scripts.mjs scripts/qa/select_failed_commands.mjs src/__tests__/architecture/engine-isolation.test.ts src/core/healing/AutoHealEngine.ts src/engines/selfHealing/selfHealingEngine.ts src/modules/devSudo/devSudoBuiltins.ts src/services/cognitive/cognitiveLayoutIntegrations.ts src/services/selfHealing/selfHealingIOAdapter.ts src/services/selfHealing/selfHealingService.ts","pnpm run verify:final100","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh"],"files_changed":[".prettierignore",".github/instructions/tests-e2e.instructions.md","scripts/qa/check_autofix_autoheal_registry.mjs","scripts/qa/discover_scripts.mjs","scripts/qa/select_failed_commands.mjs","src/__tests__/architecture/engine-isolation.test.ts","src/core/healing/AutoHealEngine.ts","src/engines/selfHealing/selfHealingEngine.ts","src/modules/devSudo/devSudoBuiltins.ts","src/services/cognitive/cognitiveLayoutIntegrations.ts","src/services/selfHealing/selfHealingIOAdapter.ts","src/services/selfHealing/selfHealingService.ts","scripts/autoheal/autoheal_rules.jsonl"],"rollback":"git restore -- .prettierignore .github/instructions/tests-e2e.instructions.md scripts/qa/check_autofix_autoheal_registry.mjs scripts/qa/discover_scripts.mjs scripts/qa/select_failed_commands.mjs src/__tests__/architecture/engine-isolation.test.ts src/core/healing/AutoHealEngine.ts src/engines/selfHealing/selfHealingEngine.ts src/modules/devSudo/devSudoBuiltins.ts src/services/cognitive/cognitiveLayoutIntegrations.ts src/services/selfHealing/selfHealingIOAdapter.ts src/services/selfHealing/selfHealingService.ts scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:20:{"id":"AH-2026-03-05-0016","date":"2026-03-05","scope":["ci","deploy-workflow","build-order"],"symptom":"Le launch PROD échoue dans le job `Build & Publish Artifacts` pendant `pnpm install` avec `pngquant failed to build`","root_cause":"`libpng-dev` était installé après `pnpm install` dans le job de build, trop tard pour les postinstall natifs","fix":"Ajout d'une étape `Install native dependencies (build)` avant `pnpm install` et simplification de l'étape system deps suivante","prevention_test":"bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh && gh workflow view .github/workflows/deploy-v27-production.yml --ref seal/vΩ5-20260303-98262da88 --yaml | rg -n 'Install native dependencies|libpng-dev'","commands":["gh run view 22698626606 --repo KallokTherok1994/TITANE_INFINITY --log-failed","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh","gh workflow view .github/workflows/deploy-v27-production.yml --ref seal/vΩ5-20260303-98262da88 --yaml"],"files_changed":[".github/workflows/deploy-v27-production.yml","scripts/autoheal/autoheal_rules.jsonl"],"rollback":"git restore -- .github/workflows/deploy-v27-production.yml scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:21:{"id":"AH-2026-03-05-0017","date":"2026-03-05","scope":["ci","deploy-workflow","build-order"],"symptom":"Le run `22698855616` échoue encore sur `Build & Publish Artifacts -> Install dependencies` avec `pngquant failed to build`","root_cause":"Le job `build-and-publish` exécute `pnpm install` avant l'installation des dépendances natives complètes, notamment `libpng-dev`","fix":"Déplacement de l'étape `Install system dependencies` avant `Install dependencies` dans `build-and-publish` et ajout explicite de `libpng-dev` + `apt-get update`","prevention_test":"bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh && gh workflow view .github/workflows/deploy-v27-production.yml --ref seal/vΩ5-20260303-98262da88 --yaml | rg -n \"Install system dependencies|libpng-dev|Install dependencies\"","commands":["gh run view 22698855616 --repo KallokTherok1994/TITANE_INFINITY --log-failed","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh","gh workflow view .github/workflows/deploy-v27-production.yml --ref seal/vΩ5-20260303-98262da88 --yaml"],"files_changed":[".github/workflows/deploy-v27-production.yml","scripts/autoheal/autoheal_rules.jsonl"],"rollback":"git restore -- .github/workflows/deploy-v27-production.yml scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:22:{"id":"AH-2026-03-05-0018","date":"2026-03-05","scope":["ci","deploy-workflow","step-dedup"],"symptom":"Le pipeline build/publish contenait une seconde étape redondante `Install system dependencies` après `Install Rust`","root_cause":"Empilement de correctifs successifs ayant laissé une duplication de setup système non nécessaire","fix":"Suppression de l'étape dupliquée pour conserver un seul setup système avant `pnpm install`, réduisant temps CI et risque de dérive d'ordre","prevention_test":"bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh && gh workflow view .github/workflows/deploy-v27-production.yml --ref seal/vΩ5-20260303-98262da88 --yaml | rg -n \"Install system dependencies\"","commands":["bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh","gh workflow view .github/workflows/deploy-v27-production.yml --ref seal/vΩ5-20260303-98262da88 --yaml"],"files_changed":[".github/workflows/deploy-v27-production.yml","scripts/autoheal/autoheal_rules.jsonl"],"rollback":"git restore -- .github/workflows/deploy-v27-production.yml scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:25:{"id":"AH-2026-03-05-0021","date":"2026-03-05","scope":["e2e","wdio","desktop-full-stability"],"symptom":"`ui-ultra-full.e2e.js` échouait en x3 avec `invalid session id` pendant le clic d'un onglet dynamique (`tab-dev-devtools`) après des boucles de clickabilité","root_cause":"Les helpers WDIO utilisaient des séquences de clic agressives (`waitForClickable`/fallbacks) sur des éléments transitoires, ce qui amplifiait les erreurs `element not interactable` puis invalidait la session","fix":"Durcissement déterministe de `ui-driver.wdio.js`: clic best-effort sans boucle lourde de clickabilité, tabs rendus non bloquants en cas de non-interactabilité transitoire, et remplissage inputs via injection DOM événementielle","prevention_test":"WDIO_SPEC=./e2e/desktop/ui-ultra-full.e2e.js pnpm -s e2e:desktop:run && bash scripts/qa/run_x3.sh proof_packs/CHAT_ONLINE_ULTRA_2026-03-05_0752_749530729 09_E2E_ONLINE_FULL_X3.log e2e_online_full_fix3 \"WDIO_SPEC=./e2e/desktop/ui-ultra-full.e2e.js pnpm -s e2e:desktop:run\" && bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh","commands":["WDIO_SPEC=./e2e/desktop/ui-ultra-full.e2e.js pnpm -s e2e:desktop:run","bash scripts/qa/run_x3.sh proof_packs/CHAT_ONLINE_ULTRA_2026-03-05_0752_749530729 09_E2E_ONLINE_FULL_X3.log e2e_online_full_fix3 \"WDIO_SPEC=./e2e/desktop/ui-ultra-full.e2e.js pnpm -s e2e:desktop:run\"","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh","node scripts/qa/check_autofix_autoheal_registry.mjs"],"files_changed":["e2e/desktop/ui-driver.wdio.js","scripts/autoheal/autoheal_rules.jsonl","registry/autofix-autoheal-rules.jsonl","proof_packs/CHAT_ONLINE_ULTRA_2026-03-05_0752_749530729/09_E2E_ONLINE_FULL_X3.log"],"rollback":"git restore -- e2e/desktop/ui-driver.wdio.js scripts/autoheal/autoheal_rules.jsonl registry/autofix-autoheal-rules.jsonl proof_packs/CHAT_ONLINE_ULTRA_2026-03-05_0752_749530729/09_E2E_ONLINE_FULL_X3.log"}
scripts/autoheal/autoheal_rules.jsonl:27:{"id":"AH-2026-03-05-0023","date":"2026-03-05","scope":["ci","governance","release-gates","mermaid"],"symptom":"Le HEAD courant restait bloque en CI avec echec des gates constitution/release/mermaid malgre GitGuardian vert","root_cause":"References de workflows obsoletes dans les gates P4/P5/P6/Release, compteur surface doc non aligne avec allowlist stable, preuves release attendues absentes, et install Mermaid cassant sur deps natives optionnelles runner","fix":"Synchronisation des noms de workflows actifs, alignement `docs/TAURI_SURFACE.md` et `docs/CAPABILITIES_REGISTRY.md` avec la surface stable, ajout des preuves `docs/_evidence/P4|P5|P6|RELEASE`, et durcissement des workflows Mermaid avec `pnpm install --no-optional`","prevention_test":"bash scripts/ci/check-capabilities-drift.sh && bash scripts/autoheal/detect_recurrence.sh && node scripts/qa/check_autofix_autoheal_registry.mjs && bash scripts/verify_instructions.sh","commands":["bash scripts/ci/check-capabilities-drift.sh","gh run view 22730504624 --log-failed","gh run view 22730504626 --log-failed","gh run view 22730504636 --log-failed"],"files_changed":[".github/workflows/release-certification-final.yml",".github/workflows/p4-constitution-audit.yml",".github/workflows/p5-runtime-governance.yml",".github/workflows/p6-capability-qualification.yml",".github/workflows/mermaid-verify.yml",".github/workflows/mermaid.yml","docs/TAURI_SURFACE.md","docs/CAPABILITIES_REGISTRY.md","docs/_evidence/P4_CONSTITUTION_AUDIT.md","docs/_evidence/P5_RUNTIME_GOVERNANCE.md","docs/_evidence/P6_CAPABILITY_QUALIFICATION.md","docs/_evidence/RELEASE_CERTIFICATION.md","scripts/autoheal/autoheal_rules.jsonl","registry/autofix-autoheal-rules.jsonl"],"rollback":"git restore -- .github/workflows/release-certification-final.yml .github/workflows/p4-constitution-audit.yml .github/workflows/p5-runtime-governance.yml .github/workflows/p6-capability-qualification.yml .github/workflows/mermaid-verify.yml .github/workflows/mermaid.yml docs/TAURI_SURFACE.md docs/CAPABILITIES_REGISTRY.md docs/_evidence/P4_CONSTITUTION_AUDIT.md docs/_evidence/P5_RUNTIME_GOVERNANCE.md docs/_evidence/P6_CAPABILITY_QUALIFICATION.md docs/_evidence/RELEASE_CERTIFICATION.md scripts/autoheal/autoheal_rules.jsonl registry/autofix-autoheal-rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:28:{"id":"AH-2026-03-05-0024","date":"2026-03-05","scope":["ci","mermaid","native-deps"],"symptom":"Les workflows Mermaid restaient en echec apres patch initial avec `pngquant failed to build, make sure that libpng-dev is installed`","root_cause":"Les jobs Mermaid installaient des dependances npm natives sans prerequis systeme `libpng-dev` sur runner Ubuntu","fix":"Ajout d'une etape `apt-get install -y libpng-dev` avant `pnpm install` dans `.github/workflows/mermaid-verify.yml` et `.github/workflows/mermaid.yml`, puis retour a un install pnpm standard","prevention_test":"node scripts/qa/check_autofix_autoheal_registry.mjs && bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh","commands":["gh run view 22732585305 --log-failed","gh run view 22732585235 --log-failed","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh"],"files_changed":[".github/workflows/mermaid-verify.yml",".github/workflows/mermaid.yml","scripts/autoheal/autoheal_rules.jsonl","registry/autofix-autoheal-rules.jsonl"],"rollback":"git restore -- .github/workflows/mermaid-verify.yml .github/workflows/mermaid.yml scripts/autoheal/autoheal_rules.jsonl registry/autofix-autoheal-rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:32:{"id":"AH-2026-03-05-0028","date":"2026-03-05","scope":["prod-build","deployment","metadata-sync"],"symptom":"Apres build/deploy prod, les metadonnees publish `deployment/latest/SHA256SUMS_v27.2.0.txt` et `deployment/latest/SIZES_v27.2.0.txt` n'etaient plus alignees avec les artefacts canoniques reconstruits","root_cause":"Le flux wrapper deploy a produit des artefacts `Titan-Stable_27.0.5` non canoniques; la publication prod devait etre re-synchronisee depuis le build canonique `src-tauri/tauri.conf.json` version 27.2.0","fix":"Execution du build canonique `corepack pnpm exec tauri build --config src-tauri/tauri.conf.json`, copie des artefacts 27.2.0 vers `deployment/latest`, regeneration de `SHA256SUMS_v27.2.0.txt` et `SIZES_v27.2.0.txt`","prevention_test":"bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh && node scripts/qa/check_autofix_autoheal_registry.mjs","commands":["GO_FOR_PROD_BUILD__TITANE_INFINITY=GO_FOR_PROD_BUILD__TITANE_INFINITY GO_FOR_PROD_DEPLOY__TITANE_INFINITY=GO_FOR_PROD_DEPLOY__TITANE_INFINITY ./TITANE_INFINITY deploy","GO_FOR_PROD_BUILD__TITANE_INFINITY=GO_FOR_PROD_BUILD__TITANE_INFINITY GO_FOR_PROD_DEPLOY__TITANE_INFINITY=GO_FOR_PROD_DEPLOY__TITANE_INFINITY corepack pnpm exec tauri build --config src-tauri/tauri.conf.json","cp -f src-tauri/target/release/bundle/appimage/TITANE-Infinity_27.2.0_amd64.AppImage deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage","cp -f src-tauri/target/release/bundle/deb/TITANE-Infinity_27.2.0_amd64.deb deployment/latest/TITANE-Infinity_27.2.0_amd64.deb","cp -f src-tauri/target/release/bundle/rpm/TITANE-Infinity-27.2.0-1.x86_64.rpm deployment/latest/TITANE-Infinity-27.2.0-1.x86_64.rpm","sha256sum deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage deployment/latest/TITANE-Infinity_27.2.0_amd64.deb deployment/latest/TITANE-Infinity-27.2.0-1.x86_64.rpm"],"files_changed":["deployment/latest/SHA256SUMS_v27.2.0.txt","deployment/latest/SIZES_v27.2.0.txt","scripts/autoheal/autoheal_rules.jsonl","registry/autofix-autoheal-rules.jsonl"],"rollback":"git restore -- deployment/latest/SHA256SUMS_v27.2.0.txt deployment/latest/SIZES_v27.2.0.txt scripts/autoheal/autoheal_rules.jsonl registry/autofix-autoheal-rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:33:{"id":"AH-OPTION1-LIBSQL-20260305-1309","date":"2026-03-05T13:09:48-05:00","scope":"src-tauri/src/services/db,src-tauri/src/services/sync,src-tauri/src/commands/db_commands.rs,src/hooks/useTitaneDb.ts,scripts/gates,scripts/lib","symptom":"Option1 libSQL/Turso integration absent and no governed x3 wrappers/gates for required proof flow","root_cause":"Missing dedicated Option1 DB/sync IPC surface and missing mandatory gate scripts for this integration workflow","fix":"Added minimal local-first DB+sync services, canonical IPC commands, UI IPC hook, option1 Rust tests, gate scripts, and x3 wrappers","prevention_test":"Run scripts/lib/scan_invariants.sh and run_x3 wrappers on Rust/UI tests; enforce no-skip/no-web gates","commands":["bash scripts/lib/scan_invariants.sh proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead","bash scripts/lib/run_x3.sh proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/06_TESTS_X3.log pnpm run test:rust"],"files_changed":["src-tauri/src/main.rs","src-tauri/src/services/mod.rs","src-tauri/src/services/db/*","src-tauri/src/services/sync/*","src-tauri/src/commands/db_commands.rs","src-tauri/tests/option1_*.rs","src/hooks/useTitaneDb.ts","src/hooks/__tests__/useTitaneDb.test.ts","scripts/gates/*","scripts/lib/*","scripts/run_all.sh","scripts/run_all.ps1"],"rollback":"git restore -SW -- src-tauri/src/main.rs src-tauri/src/services/mod.rs src-tauri/src/commands/db_commands.rs src-tauri/src/services/db src-tauri/src/services/sync src/hooks/useTitaneDb.ts src/hooks/__tests__/useTitaneDb.test.ts scripts/gates scripts/lib scripts/run_all.sh scripts/run_all.ps1"}
scripts/autoheal/autoheal_rules.jsonl:34:{"id":"AH-OPTION1-LIBSQL-20260305-compilefix-1","date":"2026-03-05T14:22:00-05:00","scope":["src-tauri/src/commands/db_commands.rs","src-tauri/src/services/sync/sync_service.rs","src-tauri/tests/option1_*.rs"],"symptom":"Erreurs de compilation Rust sur Option1: commandes Tauri async avec State référencé, emprunt temporaire de lock sync, imports tests indisponibles en features par défaut","root_cause":"Signatures de commandes incompatibles avec la macro Tauri pour async+références; garde de lock liée à une valeur temporaire; tests intégration non conditionnés aux features backend réelles","fix":"Passage des commandes Option1 en synchrones, stabilisation du lock via variable intermédiaire, ajout de garde de compilation full/no-mock sur tous les tests Option1","prevention_test":"get_errors ciblé sans erreur sur fichiers Option1 + cargo test ciblé avec --no-default-features --features full (bloquages hors scope documentés)","commands":["get_errors (db_commands.rs, sync_service.rs, tests option1_*)","cargo test --no-default-features --features full --test option1_ipc_contract --test option1_migrations_idempotent --test option1_sync_lock --test option1_sync_missing_config --test option1_db_offline_core","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh"],"files_changed":["src-tauri/src/commands/db_commands.rs","src-tauri/src/services/sync/sync_service.rs","src-tauri/tests/option1_db_offline_core.rs","src-tauri/tests/option1_sync_lock.rs","src-tauri/tests/option1_sync_missing_config.rs","src-tauri/tests/option1_migrations_idempotent.rs","src-tauri/tests/option1_ipc_contract.rs","scripts/autoheal/autoheal_rules.jsonl","proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/05_COMMANDS_USED.md","proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/09_GATES_REPORT.md","proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/12_VERDICT.md"],"rollback":"git restore -- src-tauri/src/commands/db_commands.rs src-tauri/src/services/sync/sync_service.rs src-tauri/tests/option1_db_offline_core.rs src-tauri/tests/option1_sync_lock.rs src-tauri/tests/option1_sync_missing_config.rs src-tauri/tests/option1_migrations_idempotent.rs src-tauri/tests/option1_ipc_contract.rs scripts/autoheal/autoheal_rules.jsonl proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/05_COMMANDS_USED.md proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/09_GATES_REPORT.md proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/12_VERDICT.md"}
scripts/autoheal/autoheal_rules.jsonl:36:{"id":"AH-OPTION1-LIBSQL-20260305-gates-rust-3","date":"2026-03-05T13:55:00-05:00","scope":["scripts/gates/g_frontend_no_web.sh","scripts/gates/g_network_one_door.sh","scripts/gates/g_no_test_skips.sh","src-tauri/src/commands/persistent_memory.rs","src-tauri/src/commands/meta_mode.rs","src-tauri/src/commands/evolution.rs","src-tauri/src/commands/evolution_v14.rs","src-tauri/src/commands/ia_commands.rs","src-tauri/src/api/vector_store_api.rs"],"symptom":"Stopline gates bloquées par faux positifs regex et compilation full backend bloquée sur dérives de types/contrats","root_cause":"Regex gates trop larges (URLs littérales, 'hyper*', substring skip) + incohérences de signatures et conversions bytes/string dans modules Rust historiques","fix":"Affinage des gates (web/network/no-skips), corrections de conversions crypto dans persistent_memory, annotations explicites meta/evolution/ia, ajustements vector_store API","prevention_test":"bash scripts/lib/scan_invariants.sh proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead && bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh","commands":["bash scripts/lib/scan_invariants.sh proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead","cargo test --no-default-features --features full --test option1_ipc_contract","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh"],"files_changed":["scripts/gates/g_frontend_no_web.sh","scripts/gates/g_network_one_door.sh","scripts/gates/g_no_test_skips.sh","src-tauri/src/commands/persistent_memory.rs","src-tauri/src/commands/meta_mode.rs","src-tauri/src/commands/evolution.rs","src-tauri/src/commands/evolution_v14.rs","src-tauri/src/commands/ia_commands.rs","src-tauri/src/api/vector_store_api.rs","scripts/autoheal/autoheal_rules.jsonl","proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/04_INVARIANTS_CHECK.md","proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/09_GATES_REPORT.md","proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/12_VERDICT.md"],"rollback":"git restore -- scripts/gates/g_frontend_no_web.sh scripts/gates/g_network_one_door.sh scripts/gates/g_no_test_skips.sh src-tauri/src/commands/persistent_memory.rs src-tauri/src/commands/meta_mode.rs src-tauri/src/commands/evolution.rs src-tauri/src/commands/evolution_v14.rs src-tauri/src/commands/ia_commands.rs src-tauri/src/api/vector_store_api.rs scripts/autoheal/autoheal_rules.jsonl proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/04_INVARIANTS_CHECK.md proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/09_GATES_REPORT.md proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/12_VERDICT.md"}
scripts/autoheal/autoheal_rules.jsonl:37:{"id":"AH-OPTION1-LIBSQL-20260305-pmem-lifetime-4","date":"2026-03-05T13:58:00-05:00","scope":["src-tauri/src/commands/persistent_memory.rs"],"symptom":"Erreur Rust E0716 (temporary value dropped while borrowed) dans calculate_relevance","root_cause":"Chaînage direct query.to_lowercase().split_whitespace() créant une temporaire consommée avant usage des &str collectés","fix":"Introduction d'un binding intermédiaire query_lower puis split sur ce buffer vivant pendant la fonction","prevention_test":"cargo test --manifest-path src-tauri/Cargo.toml --no-default-features --features full --test option1_ipc_contract && bash scripts/autoheal/detect_recurrence.sh","commands":["cargo test --manifest-path src-tauri/Cargo.toml --no-default-features --features full --test option1_ipc_contract","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh"],"files_changed":["src-tauri/src/commands/persistent_memory.rs","scripts/autoheal/autoheal_rules.jsonl","proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/06_TESTS_X3.log","proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/09_GATES_REPORT.md","proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/12_VERDICT.md"],"rollback":"git restore -- src-tauri/src/commands/persistent_memory.rs scripts/autoheal/autoheal_rules.jsonl proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/06_TESTS_X3.log proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/09_GATES_REPORT.md proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/12_VERDICT.md"}
scripts/autoheal/autoheal_rules.jsonl:38:{"id":"AH-OPTION1-LIBSQL-20260305-full-compile-wave-5","date":"2026-03-05T14:25:00-05:00","scope":["src-tauri/src/devtools/analyzer.rs","src-tauri/src/chat_engine/errors.rs","src-tauri/src/core/legacy.rs","src-tauri/src/commands/persistent_memory.rs","src-tauri/src/commands/meta_mode.rs","src-tauri/src/commands/automations.rs","src-tauri/src/commands/ai_chat.rs","src-tauri/src/api/vector_store_api.rs","src-tauri/src/system/system_health.rs","src-tauri/src/chat_engine/providers.rs","src-tauri/src/chat_engine/speech.rs","src-tauri/src/commands/evolution.rs","src-tauri/src/commands/evolution_v14.rs","src-tauri/src/commands/engines_commands.rs"],"symptom":"Compilation full backend bloquée par erreurs de signatures, traits, lifetimes et inférences dans modules historiques","root_cause":"Dérive architecture legacy (APIs renommées, signatures divergentes, types implicites) amplifiée par stricte compilation full","fix":"Batch de corrections mécaniques: types explicites, lifetimes stables, wrappers commandes alignés, conversions String, guard registry compatible State, mappings erreurs exhaustifs","prevention_test":"cargo test --manifest-path src-tauri/Cargo.toml --no-default-features --features full --test option1_ipc_contract && bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh","commands":["cargo test --manifest-path src-tauri/Cargo.toml --no-default-features --features full --test option1_ipc_contract","bash scripts/lib/scan_invariants.sh proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh"],"files_changed":["src-tauri/src/devtools/analyzer.rs","src-tauri/src/chat_engine/errors.rs","src-tauri/src/core/legacy.rs","src-tauri/src/commands/persistent_memory.rs","src-tauri/src/commands/meta_mode.rs","src-tauri/src/commands/automations.rs","src-tauri/src/commands/ai_chat.rs","src-tauri/src/api/vector_store_api.rs","src-tauri/src/system/system_health.rs","src-tauri/src/chat_engine/providers.rs","src-tauri/src/chat_engine/speech.rs","src-tauri/src/commands/evolution.rs","src-tauri/src/commands/evolution_v14.rs","src-tauri/src/commands/engines_commands.rs","scripts/autoheal/autoheal_rules.jsonl","proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/06_TESTS_X3.log","proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/09_GATES_REPORT.md","proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/12_VERDICT.md"],"rollback":"git restore -- src-tauri/src/devtools/analyzer.rs src-tauri/src/chat_engine/errors.rs src-tauri/src/core/legacy.rs src-tauri/src/commands/persistent_memory.rs src-tauri/src/commands/meta_mode.rs src-tauri/src/commands/automations.rs src-tauri/src/commands/ai_chat.rs src-tauri/src/api/vector_store_api.rs src-tauri/src/system/system_health.rs src-tauri/src/chat_engine/providers.rs src-tauri/src/chat_engine/speech.rs src-tauri/src/commands/evolution.rs src-tauri/src/commands/evolution_v14.rs src-tauri/src/commands/engines_commands.rs scripts/autoheal/autoheal_rules.jsonl proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/06_TESTS_X3.log proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/09_GATES_REPORT.md proof_packs/OPTION1_LIBSQL_TESTS_2026-03-05_1253_f0ec87ead/12_VERDICT.md"}
scripts/autoheal/autoheal_rules.jsonl:42:{"id":"AH-2026-03-05-0029","date":"2026-03-05","scope":["ci","docs-deploy","native-deps"],"symptom":"Le workflow `Deploy Documentation` échoue en step `Install dependencies` avec `pngquant failed to build, make sure that libpng-dev is installed`","root_cause":"Le job docs installait les dépendances Node avant les prérequis système nécessaires aux builds natifs d'images","fix":"Ajout d'une étape `Install native dependencies` dans `.github/workflows/docs-deploy.yml` avant `pnpm install`, installant `libpng-dev`","prevention_test":"gh workflow view .github/workflows/docs-deploy.yml --ref MAIN --yaml | grep -q 'libpng-dev' && bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh","commands":["gh run view 22745539805 --log-failed","bash scripts/autoheal/detect_recurrence.sh","bash scripts/verify_instructions.sh"],"files_changed":[".github/workflows/docs-deploy.yml","scripts/autoheal/autoheal_rules.jsonl"],"rollback":"git restore -- .github/workflows/docs-deploy.yml scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:44:{"id": "AH-2026-03-05-0031", "date": "2026-03-05", "scope": ["ci", "docs-deploy", "typedoc-runtime"], "symptom": "Le workflow `Deploy Documentation` échoue à l'étape `Generate TypeDoc` avec `typedoc: not found`", "root_cause": "Le job docs invoquait `pnpm run docs` alors que le binaire `typedoc` n'était pas disponible dans les dépendances effectivement installées en CI", "fix": "Remplacement de l'étape docs par un fallback résilient: `pnpm exec typedoc || pnpm dlx typedoc@0.28.14`", "prevention_test": "bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh && gh run view 22745665655 --log-failed | grep -q 'typedoc: not found'", "commands": ["gh run view 22745665655 --log-failed", "bash scripts/autoheal/detect_recurrence.sh", "bash scripts/verify_instructions.sh"], "files_changed": [".github/workflows/docs-deploy.yml", "scripts/autoheal/autoheal_rules.jsonl"], "rollback": "git restore -- .github/workflows/docs-deploy.yml scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:45:{"id": "AH-2026-03-05-0032", "date": "2026-03-05", "scope": ["ci", "docs-deploy", "typedoc-plugin"], "symptom": "Le run Deploy Documentation échoue encore sur `typedoc-plugin-markdown could not be loaded` pendant Generate TypeDoc", "root_cause": "Le fallback `pnpm dlx typedoc` n'incluait pas le plugin requis par `typedoc.json` (`typedoc-plugin-markdown`)", "fix": "Mise à jour du fallback CI: `pnpm dlx --package typedoc@0.28.14 --package typedoc-plugin-markdown@4.9.0 typedoc`", "prevention_test": "bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh && gh run view 22745743556 --log-failed | grep -q 'typedoc-plugin-markdown'", "commands": ["gh run view 22745743556 --log-failed", "bash scripts/autoheal/detect_recurrence.sh", "bash scripts/verify_instructions.sh"], "files_changed": [".github/workflows/docs-deploy.yml", "scripts/autoheal/autoheal_rules.jsonl"], "rollback": "git restore -- .github/workflows/docs-deploy.yml scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:47:{"id": "AH-2026-03-05-0034", "date": "2026-03-05", "scope": ["ci", "registry-guard", "runtime-registry"], "symptom": "Le workflow `Registry Guard` échoue sur `runtime/registry/dashboard.md missing`", "root_cause": "Le dashboard registry n'était pas présent dans le dépôt alors qu'il est requis par le check d'existence des artefacts runtime/registry", "fix": "Génération du fichier manquant via la commande canonique `pnpm registry:dashboard`", "prevention_test": "test -f runtime/registry/dashboard.md && bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh", "commands": ["gh run view 22745952322 --log-failed", "pnpm registry:dashboard", "bash scripts/autoheal/detect_recurrence.sh", "bash scripts/verify_instructions.sh"], "files_changed": ["runtime/registry/dashboard.md", "scripts/autoheal/autoheal_rules.jsonl"], "rollback": "git restore -- runtime/registry/dashboard.md scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:48:{"id": "AH-2026-03-05-0035", "date": "2026-03-05", "scope": ["ci", "format-check", "unified-auto-deploy"], "symptom": "Les workflows `TITANE∞ CI/CD Unified Pipeline` et `Auto-Deploy` échouent sur `prettier --check .` avec 3 fichiers non formatés", "root_cause": "Des modifications précédentes sur `run-desktop-suite.js` et les hooks DB n'étaient pas passées par `prettier --write` avant push", "fix": "Application du formatage ciblé `pnpm prettier --write` sur les 3 fichiers signalés puis revalidation `pnpm run format:check`", "prevention_test": "pnpm run format:check && bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh", "commands": ["pnpm prettier --write scripts/e2e/run-desktop-suite.js src/hooks/useTitaneDb.ts src/hooks/__tests__/useTitaneDb.test.ts", "pnpm run format:check", "bash scripts/autoheal/detect_recurrence.sh", "bash scripts/verify_instructions.sh"], "files_changed": ["scripts/e2e/run-desktop-suite.js", "src/hooks/useTitaneDb.ts", "src/hooks/__tests__/useTitaneDb.test.ts", "scripts/autoheal/autoheal_rules.jsonl"], "rollback": "git restore -- scripts/e2e/run-desktop-suite.js src/hooks/useTitaneDb.ts src/hooks/__tests__/useTitaneDb.test.ts scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:51:{"id": "AH-2026-03-05-0038", "date": "2026-03-05", "scope": ["ci", "registry-guard", "workflow-change-tracking"], "symptom": "`📋 Registry Guard` échoue sur `Registry not updated for code changes` après modification de `.github/workflows/consciousness-matrix.yml`", "root_cause": "Le cycle de mise à jour registry (event + snapshot + dashboard) n'a pas été exécuté après changement workflow surveillé", "fix": "Exécution de `pnpm registry:log` (type WORKFLOW_CHANGED) puis `pnpm registry:snapshot`, `pnpm registry:dashboard` et `pnpm verify:registry`", "prevention_test": "pnpm verify:registry && bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh", "commands": ["pnpm registry:log -- --type=WORKFLOW_CHANGED --cycleId=CYCLE-20260305-REGISTRY --attempt=1 --severity=MEDIUM --impact=CI --owner=copilot --priority=P1 --desc='Updated .github/workflows/consciousness-matrix.yml to fix CI failures and restore registry gate compliance' --next='Run pnpm verify:registry,Monitor next MAIN workflow run' --files='.github/workflows/consciousness-matrix.yml,scripts/autoheal/autoheal_rules.jsonl'", "pnpm registry:snapshot", "pnpm registry:dashboard", "pnpm verify:registry", "bash scripts/autoheal/detect_recurrence.sh", "bash scripts/verify_instructions.sh"], "files_changed": ["runtime/registry/events.jsonl", "runtime/registry/snapshot.json", "runtime/registry/dashboard.md", "scripts/autoheal/autoheal_rules.jsonl"], "rollback": "git restore -- runtime/registry/events.jsonl runtime/registry/snapshot.json runtime/registry/dashboard.md scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:53:{"id": "AH-2026-03-06-0040", "date": "2026-03-06", "scope": ["ci", "unified-pipeline", "frontend-contract-and-rust-toolchain"], "symptom": "`TITANE∞ CI/CD Unified Pipeline` échoue avec 6 tests frontend en échec (5 snapshots + seuil orphaned commands) et `cargo check` en erreur de parse manifest dépendance", "root_cause": "Seuil IPC contract devenu trop strict après croissance des commandes Rust (506), snapshots frontend non alignés, et toolchain Rust 1.83 trop ancienne pour certains manifests crates récents", "fix": "Ajustement seuil orphaned commands 500→520 dans `tests/contract/tauri-ipc-contract.test.ts`, mise à jour workflow `.github/workflows/ci-unified.yml` vers Rust stable, et mise à jour snapshots via Vitest `-u` ciblé", "prevention_test": "pnpm exec vitest tests/contract/tauri-ipc-contract.test.ts src/__tests__/components/devtools/EventStream.test.tsx src/__tests__/features/chat/ChatMessage.test.tsx src/__tests__/features/monitoring/SystemHealthMonitor.test.tsx src/__tests__/apps/devtools/sections/Errors.test.tsx src/__tests__/apps/devtools/sections/Metrics.test.tsx -u --run && bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh", "commands": ["gh run view 22762713452 --log-failed", "pnpm exec vitest tests/contract/tauri-ipc-contract.test.ts src/__tests__/components/devtools/EventStream.test.tsx src/__tests__/features/chat/ChatMessage.test.tsx src/__tests__/features/monitoring/SystemHealthMonitor.test.tsx src/__tests__/apps/devtools/sections/Errors.test.tsx src/__tests__/apps/devtools/sections/Metrics.test.tsx -u --run", "bash scripts/autoheal/detect_recurrence.sh", "bash scripts/verify_instructions.sh"], "files_changed": [".github/workflows/ci-unified.yml", "tests/contract/tauri-ipc-contract.test.ts", "scripts/autoheal/autoheal_rules.jsonl"], "rollback": "git restore -- .github/workflows/ci-unified.yml tests/contract/tauri-ipc-contract.test.ts scripts/autoheal/autoheal_rules.jsonl"}
scripts/autoheal/autoheal_rules.jsonl:54:{"id":"AH-2026-03-06-0041","date":"2026-03-06","scope":["online-first-governance","legacy-offline-config","architecture-guard"],"symptom":"Legacy `src/config/offline-first.ts` could enforce local-first defaults and still contained a direct UI web connectivity ping, risking accidental online-capability blocking if re-imported","root_cause":"Old v16 offline-first config remained in source tree with blocking defaults and no explicit runtime-import guard","fix":"Marked offline-first config as legacy-safe, removed direct UI web ping, neutralized forced-local defaults, and added an architecture test preventing new runtime imports outside approved deprecated files","signature":{"paths":["src/config/offline-first.ts","src/__tests__/architecture/no_offline_first_runtime_import.test.ts"],"marker":"Architecture: offline-first legacy isolation"},"verification":"bash scripts/lib/run_x3.sh proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/08_TESTS_X3.log pnpm run test:architecture && bash scripts/lib/run_x3.sh proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/09_BUILD_X3.log pnpm run build:tauri:e2e","prevention":"Architecture guard test blocks accidental runtime import of offline-first config","prevention_test":"bash scripts/autoheal/detect_recurrence.sh && bash scripts/verify_instructions.sh","commands":["rg -n \"OFFLINE FIRST CONFIG|OFFLINE_FEATURES|AI_CONFIG|localFirst|requireOnlineConfirmation\" -S .","rg -n \"getAIConfig\\(|enableCloudMode\\(|disableCloudMode\\(|isOnlineModeEnabled\\(\" -S .","bash scripts/lib/run_x3.sh proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/08_TESTS_X3.log pnpm run test:architecture","bash scripts/lib/run_x3.sh proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/09_BUILD_X3.log pnpm run build:tauri:e2e"],"files_changed":["src/config/offline-first.ts","src/__tests__/architecture/no_offline_first_runtime_import.test.ts","proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/00_EXEC_SUMMARY.md","proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/01_BOOTSTRAP.md","proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/02_DISCOVERY.md","proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/03_SCOPE.md","proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/04_FINDINGS.md","proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/05_PATCH_PLAN.md","proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/06_DIFF_FILES.md","proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/07_SCANS.log","proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/08_TESTS_X3.log","proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/09_BUILD_X3.log","proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/10_GATES_REPORT.md","proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/11_ROLLBACK.md","proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd/12_VERDICT.md","scripts/autoheal/autoheal_rules.jsonl"],"rollback":"git restore -- src/config/offline-first.ts src/__tests__/architecture/no_offline_first_runtime_import.test.ts proof_packs/FIX_ONLINE_BLOCK_2026-03-06_0736_77d1644cd scripts/autoheal/autoheal_rules.jsonl"}
scripts/run_final.sh:14:TEST_CMD="${TEST_CMD:-timeout 180s pnpm run test:architecture}"
scripts/run_final.sh:16:EVAL_CMD="${EVAL_CMD:-TITANE_E2E_TAURI=1 timeout 180s pnpm run test:e2e:vitest}"
scripts/run_all.ps1:9:& "$ScriptDir/lib/run_x3.ps1" "$PackDir/06_TESTS_X3.log" "pnpm run test:rust"
scripts/test/validate_100_percent.sh:31:if cargo test --package titane_infinity --lib --quiet 2>/dev/null; then
scripts/audit-complete.sh:58:    pnpm test -- --coverage --silent 2>&1 || echo "⚠️ Some tests failed"
scripts/audit-complete.sh:64:    cd src-tauri && cargo test 2>&1 && cd .. || echo "⚠️ Some Rust tests failed"
scripts/test/run_devops_tests.sh:95:        corepack pnpm exec vitest --version >/dev/null 2>&1 && print_success "Vitest installed" || {
scripts/test/run_devops_tests.sh:100:        pnpm exec vitest --version >/dev/null 2>&1 && print_success "Vitest installed" || {
scripts/test/run_devops_tests.sh:116:        corepack pnpm exec vitest run "$UNIT_DIR/VisualDevOpsEngine.test.ts" --reporter=verbose
scripts/test/run_devops_tests.sh:118:        pnpm exec vitest run "$UNIT_DIR/VisualDevOpsEngine.test.ts" --reporter=verbose
scripts/test/run_devops_tests.sh:131:        corepack pnpm exec vitest run "$UNIT_DIR/LocalAgentEngine.test.ts" --reporter=verbose 2>/dev/null
scripts/test/run_devops_tests.sh:133:        pnpm exec vitest run "$UNIT_DIR/LocalAgentEngine.test.ts" --reporter=verbose 2>/dev/null
scripts/test/run_devops_tests.sh:150:        corepack pnpm exec vitest run "$INTEGRATION_DIR/devops-pipeline.test.ts" --reporter=verbose 2>/dev/null
scripts/test/run_devops_tests.sh:152:        pnpm exec vitest run "$INTEGRATION_DIR/devops-pipeline.test.ts" --reporter=verbose 2>/dev/null
scripts/test/run_devops_tests.sh:169:        corepack pnpm exec vitest run "$UNIT_DIR" --coverage --coverage.reporter=text --coverage.reporter=html 2>/dev/null
scripts/test/run_devops_tests.sh:171:        pnpm exec vitest run "$UNIT_DIR" --coverage --coverage.reporter=text --coverage.reporter=html 2>/dev/null
scripts/final_validation.sh:56:if cargo test --lib error_handling 2>&1 | grep -q "test result: ok"; then
scripts/beta-doctor.js:33:  execSync('pnpm run e2e', { stdio: 'inherit' });
scripts/validate-chat-fallback-fix.sh:85:if pnpm test src/__tests__/chat-fallback-display.test.ts --run --silent 2>&1 | grep -q "5 passed"; then
scripts/validate-chat-fallback-fix.sh:93:if pnpm test src/hooks/__tests__/useChat.test.ts --run --silent 2>&1 | grep -q "50 passed"; then
scripts/verify/verify-coverage.sh:35:    echo "   Run 'pnpm run test:coverage:${category}' first"
scripts/verify/verify-coverage.sh:126:  echo "   1. Run 'pnpm run test:coverage' to see detailed report"
scripts/verify/validate-architecture.sh:65:if pnpm run test -- src/__tests__/architecture/ --run 2>&1 | grep -q "PASS"; then
scripts/verify/check-dev-ports-processes.sh:115:  # NOTE: "vitest.explorer" contains "vite"; avoid false positives.
scripts/verify/check-dev-ports-processes.sh:124:      *"vitest.explorer"*|*"/dist/worker.js"*) continue ;;
scripts/verify/check-dev-ports-processes.sh:154:          *"vitest.explorer"*|*"/dist/worker.js"*) continue ;;
scripts/verify/registry-quality.js:48:    /\b(pnpm|vitest|cargo|tauri|workflow|gate|suite)\b/i.test(d) ||
scripts/verify/verify-preprod.sh:188:test_warn "E2E skipped for this preprod run - use pnpm run e2e for full test"
scripts/verify/registry-sync.js:35:  'vitest*.config.ts',
scripts/verify/registry-sync.js:36:  'playwright.config.ts',
scripts/verify/pre-deployment-check.sh:169:    if run_command "Frontend-Tests" "pnpm run test"; then
scripts/verify/pre-deployment-check.sh:189:    if run_command "Architecture-Tests" "pnpm run test:architecture"; then
scripts/verify/pre-deployment-check.sh:196:    if command -v playwright &> /dev/null; then
scripts/verify/pre-deployment-check.sh:197:        if run_command "E2E-Tests" "pnpm run test:e2e"; then
scripts/governance/ops-audit.sh:54:if [ -f "jest.config.json" ] && [ -f "playwright.config.ts" ]; then
scripts/governance/ops-audit.sh:165:OP2 TESTING FRAMEWORK: $([ -f "jest.config.json" ] && [ -f "playwright.config.ts" ] && echo "PASS" || echo "WARNING")
scripts/test-final-integration.sh:188:        log_success "Dependency-manager handles missing pnpm gracefully" "module_tests"
scripts/env/activate-node.sh:48:    echo -e "${YELLOW}⚠️  pnpm non détecté. Recommandé: corepack enable && corepack prepare pnpm@latest --activate${NC}"
scripts/system-check.sh:147:TEST_RESULT=$(pnpm test -- --run 2>&1 | tail -5)
scripts/system-check.sh:162:if cargo test --no-run > /tmp/titane-test-compile.log 2>&1; then
scripts/fix/detect_and_fix_flatpak.sh:173:        echo "  pnpm : corepack enable && corepack prepare pnpm@latest --activate"
scripts/phases/P0_tests.sh:2:# scripts/phases/P0_tests.sh — Tests x3 (vitest + architecture + rust)
scripts/phases/P0_tests.sh:16:    node node_modules/.bin/cross-env node node_modules/.bin/vitest run src/__tests__/architecture 2>&1 | tail -10
scripts/phases/P0_tests.sh:18:  echo "--- Unit tests (vitest) ---"
scripts/phases/P0_tests.sh:20:    node node_modules/.bin/vitest run 2>&1 | tail -15
scripts/phases/P0_tests.sh:24:  cd src-tauri && cargo test --lib 2>&1 | tail -10
scripts/tools/e2e_chat_proof_harvest.sh:60:echo "pnpm run -l | rg -n 'tauri|dev|build|e2e|test':" >> "$PHASE_A_FILE"
scripts/tools/e2e_chat_proof_harvest.sh:62:  pnpm run -l | rg -n "tauri|dev|build|e2e|test" >> "$PHASE_A_FILE" 2>&1 || true
scripts/tools/e2e_chat_proof_campaign.sh:7:SPEC="e2e/desktop/online-chat-proof-ui.wdio.test.js"
scripts/tools/e2e_chat_proof_campaign.sh:8:WDIO_CFG="wdio.desktop.conf.cjs"
scripts/tools/e2e_chat_proof_campaign.sh:45:  cmd="TITANE_PROOF_SCENARIO=$scenario TITANE_PROOF_RUN=$run TAURI_BINARY_PATH=${TITANE_BINARY_PATH:-} $PNPM_BIN exec wdio run $WDIO_CFG --spec $SPEC"
scripts/tools/e2e_chat_proof_campaign.sh:92:    reason="wdio_or_driver_failed_exit_$ec"
```

## find test configs
```
./playwright.config.ts.backup-1770812583
./wdio.desktop.conf.cjs
./vitest.config.ts
./playwright.config.ts
```

## Suites detectees (preuves)
- Unit/Vitest: `package.json` script `test` -> `vitest run`.
- Lint: `package.json` script `lint`.
- Typecheck: `package.json` script `check` (`tsc --noEmit`).
- Rust tests: `package.json` script `test:rust` (`cargo test --lib`).
- Desktop E2E (WDIO): `package.json` script `e2e:desktop:run` -> `node scripts/e2e/run-desktop-suite.js`.
- Playwright E2E: `package.json` script `test:e2e` -> `playwright test e2e`.

## Commandes candidates (source prouvee)
- UNIT_CMD candidate: `pnpm run test` (source: `package.json` scripts.test).
- LINT_CMD candidate: `pnpm run lint` (source: `package.json` scripts.lint).
- TYPECHECK_CMD candidate: `pnpm run check` (source: `package.json` scripts.check).
- RUST_TEST_CMD candidate: `pnpm run test:rust` (source: `package.json` scripts.test:rust).
- E2E_DESKTOP_CMD candidate: `pnpm -s e2e:desktop:run` (source: `package.json` + `scripts/e2e/run-desktop-suite.js`).
- WDIO spec assets present: `e2e/desktop/ui-ultra-smoke.e2e.js`, `e2e/desktop/ui-ultra-full.e2e.js`, `wdio.desktop.conf.cjs`.
- PLAYWRIGHT_CMD candidate: `pnpm run test:e2e` (source: `package.json` scripts.test:e2e).

