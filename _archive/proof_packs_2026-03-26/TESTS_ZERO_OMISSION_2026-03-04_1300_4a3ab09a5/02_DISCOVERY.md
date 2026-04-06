]633;E;{   echo "# Discovery"\x3b   echo "- Timestamp UTC: $TS"\x3b   echo "- discovered_scripts.json: $PACK_DIR/discovered_scripts.json"\x3b   echo ""\x3b   echo "## Commandes"\x3b   echo "- node scripts/qa/discover_scripts.mjs > discovered_scripts.json"\x3b   echo "- rg -n \\"playwright|vitest|webdriver|webkit|wdio|webdriverio|tauri.*driver|cargo test|RUN_E2E_TESTS|TITANE_E2E_TAURI|SKIP:\\" package.json scripts tests src e2e src-tauri .github || true"\x3b   echo "- ls -la e2e tests src/__tests__ src/tests src-tauri scripts || true"\x3b   echo ""\x3b   echo "## Résultats (aperçu rg)"\x3b   echo '```text'\x3b   sed -n '1,120p' "$PACK_DIR/logs/discovery_rg.log"\x3b   echo '```'\x3b   echo ""\x3b   echo "## Résultats (aperçu ls)"\x3b   echo '```text'\x3b   sed -n '1,160p' "$PACK_DIR/logs/discovery_ls.log"\x3b   echo '```'\x3b } >> "$PACK_DIR/02_DISCOVERY.md";4a32d084-ebc3-40d0-a337-66c1b6517978]633;C# Discovery
- Timestamp UTC: 2026-03-04T18:03:33Z
- discovered_scripts.json: proof_packs/TESTS_ZERO_OMISSION_2026-03-04_1300_4a3ab09a5/discovered_scripts.json

## Commandes
- node scripts/qa/discover_scripts.mjs > discovered_scripts.json
- rg -n "playwright|vitest|webdriver|webkit|wdio|webdriverio|tauri.*driver|cargo test|RUN_E2E_TESTS|TITANE_E2E_TAURI|SKIP:" package.json scripts tests src e2e src-tauri .github || true
- ls -la e2e tests src/__tests__ src/tests src-tauri scripts || true

## Résultats (aperçu rg)
```text
package.json:25:    "guard:ipc-contract": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run tests/contract/tauri-ipc-contract.test.ts",
package.json:61:    "test": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run",
package.json:62:    "test:watch": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest --watch",
package.json:63:    "test:coverage": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run --coverage && pnpm run test:coverage:check",
package.json:64:    "test:coverage:unit": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run -c vitest.unit.config.ts --coverage",
package.json:65:    "test:coverage:integration": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run -c vitest.integration.config.ts --coverage",
package.json:67:    "test:coverage:report": "cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run --coverage && echo 'Open coverage/index.html in browser'",
package.json:68:    "e2e:desktop:ensure": "bash scripts/e2e/ensure-webkit-webdriver.sh",
package.json:72:    "test:e2e": "playwright test e2e",
package.json:73:    "test:e2e:playwright": "playwright test e2e",
package.json:74:    "test:e2e:vitest": "bash -c 'if [[ \"${TITANE_E2E_TAURI:-}\" != \"1\" ]]; then echo \"SKIP: Vitest E2E (src/tests/e2e) nécessite un contexte Tauri réel. Relance avec TITANE_E2E_TAURI=1\"; exit 0; fi; cross-env RUN_E2E_TESTS=1 NODE_OPTIONS=\"--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs\" vitest run src/tests/e2e/titane_e2e.test.ts'",
package.json:75:    "test:browser": "vitest --config vitest.browser.config.ts --run",
package.json:76:    "test:browser:ui": "vitest --config vitest.browser.config.ts --ui",
package.json:77:    "test:browser:watch": "vitest --config vitest.browser.config.ts",
package.json:80:    "test:100:full": "pnpm run test && cross-env RUN_E2E_TESTS=1 pnpm run test:e2e:vitest && pnpm run test:browser",
package.json:81:    "test:rust": "mkdir -p dist && cd src-tauri && cargo test --lib",
package.json:83:    "test:architecture": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/architecture",
package.json:84:    "test:compliance": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/compliance",
package.json:85:    "test:omega": "cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/*omega*.test.ts",
package.json:87:    "test:all:full": "pnpm run test:all && pnpm run test:e2e:playwright",
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
package.json:247:    "webdriverio": "^9.24.0",
e2e/runtime-validation/chat-ar20.spec.ts:19:import { test, expect } from '@playwright/test';
e2e/runtime-validation/chat-ar20.spec.ts:21:const TAURI_E2E_ENABLED = process.env.TITANE_E2E_TAURI === '1';
tests/contract/tauri.contract.test.ts:12:import { describe, it, expect } from 'vitest';
tests/contract/tauri-ipc-contract.test.ts:6:import { describe, it, expect } from 'vitest';
tests/verification/comprehensive.test.ts:154:      expect(fs.existsSync('playwright.config.ts')).toBe(true);
e2e/desktop/ui-chat-360-autofix.wdio.test.cjs:656: * Get console errors (tauri-driver doesn't support browser.getLogs)
tests/phase6/gate-p6.test.ts:14:import { describe, it, expect } from 'vitest';
.github/copilot-xs/cargo-audit-ignores.txt:5:# gtk-rs GTK3 bindings (transitive via wry/webkit2gtk)
.github/PULL_REQUEST_TEMPLATE.md:47:- [ ] Tests Rust passent (`cargo test`)
tests/integration/control_panel_integration.test.ts:6:import { describe, it, expect, test, beforeEach, vi } from 'vitest';
e2e/desktop/test-direct-wdio-connection.wdio.test.cjs:4: * Bypasses orchestrator; runs directly via wdio CLI
tests/integration/devops-pipeline.test.ts:7:import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
tests/integration/audit-system.test.ts:8:import { describe, it, expect, beforeAll } from 'vitest';
e2e/desktop/chat-ar20.wdio.test.js:18: * - tauri-driver + WebDriverIO infrastructure
e2e/desktop/chat-ar20.wdio.test.js:35:  framework: 'WebDriverIO + tauri-driver',
tests/integration/full-pipeline.test.ts:13:import { describe, it, expect, beforeEach, vi } from 'vitest';
.github/instructions/tests-e2e.instructions.md:2:applyTo: 'e2e/**, scripts/e2e/**, wdio*.conf*'
.github/instructions/tests-e2e.instructions.md:11:- Wrapper tauri-driver obligatoire + memory guard.
.github/instructions/tests-e2e.instructions.md:34:- git restore -- e2e scripts/e2e wdio*.conf*
tests/integration/deployment.test.ts:10:import { describe, it, expect, beforeAll } from 'vitest';
.github/instructions/titane.instructions.md:36:- E2E sans wrapper tauri-driver ou sans isolation memoire.
.github/instructions/titane.instructions.md:125:## E2E Constitution (Playwright + tauri-driver)
.github/instructions/titane.instructions.md:127:- `scripts/e2e/tauri-wrapper.sh` is mandatory; no direct tauri-driver call.
.github/instructions/titane.instructions.md:162:- `pnpm test:rust` (cargo test)
e2e/features/governance-center.spec.ts:8:import { test, expect } from '@playwright/test';
e2e/features/memory-tree-viewer.spec.ts:9:import { Page } from '@playwright/test';
e2e/features/production-health.spec.ts:6:import { test, expect } from '@playwright/test';
e2e/chat-provider-decision-certification.spec.ts:18:import { test, expect, Page, ConsoleMessage } from '@playwright/test';
e2e/onboarding.test.ts:12:import { test, expect } from '@playwright/test';
src/__tests__/online-availability.test.ts:14:import { describe, it, expect } from 'vitest';
src/__tests__/e2e-ui-integration.test.tsx:7:import { describe, it, expect, beforeEach, afterEach } from 'vitest';
e2e/helpers/navigation.ts:1:import { expect, Page } from '@playwright/test';
tests/unit/control_panel_commands.test.ts:6:import { describe, test, beforeEach, expect, vi, type Mock } from 'vitest';
e2e/smoke.test.ts:7: * une approche différente avec @tauri-apps/cli-driver ou tests manuels.
e2e/smoke.test.ts:12:import { test } from '@playwright/test';
e2e/user-flows.test.ts:7: * une approche différente avec @tauri-apps/cli-driver ou tests manuels.
e2e/user-flows.test.ts:12:import { test } from '@playwright/test';
src/__tests__/api/tauriClient.test.ts:1:import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
src/__tests__/useChat-streaming.test.ts:3:import { vi } from 'vitest';
tests/unit/services/monitoring.test.ts:13:import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
src/__tests__/chatModes.config.test.ts:6:import { describe, it, expect } from 'vitest';
e2e/critical/app-launch.spec.ts:8:import { test, expect } from '@playwright/test';
src/__tests__/automations.config.test.ts:7:import { describe, it, expect, beforeEach } from 'vitest';
tests/unit/realtime/RealTimeExecutionEngine.test.ts:13:import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
e2e/critical/engine-navigation.spec.ts:11:import { test, expect } from '@playwright/test';
tests/unit/safeLazyImport.test.ts:4:import { describe, it, expect } from 'vitest';
e2e/critical/system-resilience.spec.ts:8:import { test, expect } from '@playwright/test';
tests/unit/ControlPanel.test.tsx:7:import { describe, test, beforeEach, expect, vi, type Mock } from 'vitest';
tests/unit/ControlPanel.test.tsx:9:import '@testing-library/jest-dom/vitest';
e2e/critical/visual-engine.spec.ts:11:import { test, expect } from '@playwright/test';
e2e/critical/chat-interaction.spec.ts:11:import { test, expect, type Page } from '@playwright/test';
e2e/chat-provider-decision-certification-structural.spec.ts:14:import { test, expect } from '@playwright/test';
tests/unit/fusion/SingularityFusionEngine.test.ts:6:import { describe, it, expect, beforeEach, vi } from 'vitest';
e2e/feedback-loop.spec.ts:22:import { test, expect, Page } from '@playwright/test';
e2e/feedback-loop.spec.ts:23:import { _electron as electron } from 'playwright';
src/__tests__/apps/devtools/__snapshots__/DevToolsApp.test.tsx.snap:1:// Vitest Snapshot v1, https://vitest.dev/guide/snapshot.html
e2e/omega-pipeline-e2e.spec.ts:15:import { Page } from '@playwright/test';
.github/REGLE_CRITIQUE_DEPLOIEMENT.md:88:cd src-tauri && cargo test
tests/unit/cognitive/CognitiveOptimizationEngine.test.ts:6:import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
e2e/fixtures/global-setup.ts:4: * Installs Tauri IPC mocks when running without TITANE_E2E_TAURI=1
e2e/fixtures/global-setup.ts:7:import { chromium, FullConfig } from '@playwright/test';
e2e/fixtures/global-setup.ts:11:  const isTauriMode = process.env.TITANE_E2E_TAURI === '1';
tests/unit/autonomy/SingularityAutonomyEngine.test.ts:6:import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
e2e/fixtures/index.ts:7:import { test as base, expect } from '@playwright/test';
e2e/fixtures/index.ts:25:    const isTauriMode = process.env.TITANE_E2E_TAURI === '1';
tests/unit/advancedBootMonitor.test.ts:4:import { describe, it, expect, vi, beforeEach } from 'vitest';
tests/unit/devops/VisualDevOpsEngine.test.ts:7:import { describe, it, expect, beforeEach, vi } from 'vitest';
tests/unit/devops/LocalAgentEngine.test.ts:7:import { describe, it, expect, beforeEach, vi } from 'vitest';
tests/unit/context/LongContextOptimizer.test.ts:6:import { describe, it, expect, beforeEach, vi } from 'vitest';
tests/ui-navigation.test.tsx:7:import { describe, it, expect, beforeEach } from 'vitest';
.github/workflows/ci-unified.yml:258:            libwebkit2gtk-4.1-dev \
.github/workflows/ci-unified.yml:286:        run: cargo test --verbose
.github/workflows/ci-unified.yml:334:        run: pnpm exec playwright install --with-deps chromium
.github/workflows/ci-unified.yml:344:          name: playwright-report-${{ github.run_id }}
.github/workflows/ci-unified.yml:345:          path: playwright-report/
.github/workflows/ci-unified.yml:388:            libwebkit2gtk-4.1-dev \
tests/chat/chat.test.ts:13:import { describe, it, expect, vi, beforeEach } from 'vitest';
.github/workflows/p3-build-guard.yml:54:          sudo apt-get install -y jq libwebkit2gtk-4.1-dev libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
tests/glm46v-integration.test.ts:6:import { describe, it, expect } from 'vitest';
src/__tests__/c3-latency.test.ts:10:import { describe, it, expect, vi, beforeEach } from 'vitest';
.github/workflows/registry-guard.yml:21:      - 'vitest*.config.ts'
.github/workflows/registry-guard.yml:22:      - 'playwright.config.ts'
.github/workflows/registry-guard.yml:23:      - 'wdio.conf.js'
.github/workflows/registry-guard.yml:39:      - 'vitest*.config.ts'
.github/workflows/registry-guard.yml:40:      - 'playwright.config.ts'
.github/workflows/registry-guard.yml:41:      - 'wdio.conf.js'
```

## Résultats (aperçu ls)
```text
total 156
drwxrwxr-x  8 titane-os titane-os  4096 févr. 23 10:23 .
drwxrwxr-x 56 titane-os titane-os 36864 mars   4 13:02 ..
-rw-rw-r--  1 titane-os titane-os   808 janv. 16 23:55 beta-smoke.test.js
-rw-rw-r--  1 titane-os titane-os 14781 mars   1 15:20 chat-provider-decision-certification.spec.ts
-rw-rw-r--  1 titane-os titane-os  8280 févr. 23 15:06 chat-provider-decision-certification-structural.spec.ts
drwxrwxr-x  2 titane-os titane-os  4096 févr. 13 18:21 critical
drwxrwxr-x  2 titane-os titane-os  4096 mars   4 12:55 desktop
-rw-rw-r--  1 titane-os titane-os   397 janv. 19 16:13 .eslintrc.cjs
-rw-rw-r--  1 titane-os titane-os   120 janv. 17 12:52 .eslintrc.json
drwxrwxr-x  2 titane-os titane-os  4096 févr. 23 07:00 features
-rw-rw-r--  1 titane-os titane-os 18885 mars   1 16:42 feedback-loop.spec.ts
drwxrwxr-x  2 titane-os titane-os  4096 févr. 13 18:30 fixtures
drwxrwxr-x  2 titane-os titane-os  4096 févr. 13 18:21 helpers
-rw-rw-r--  1 titane-os titane-os  3998 mars   1 15:23 omega-pipeline-e2e.spec.ts
-rw-rw-r--  1 titane-os titane-os 13861 déc.   9 18:44 onboarding.test.ts
drwxrwxr-x  2 titane-os titane-os  4096 févr. 14 09:43 runtime-validation
-rw-rw-r--  1 titane-os titane-os  1016 mars   1 14:38 smoke.test.ts
-rw-rw-r--  1 titane-os titane-os  1029 mars   1 14:38 user-flows.test.ts
total 184
drwxrwxr-x 20 titane-os titane-os  4096 févr.  2 11:45 .
drwxrwxr-x 56 titane-os titane-os 36864 mars   4 13:02 ..
drwxrwxr-x  2 titane-os titane-os  4096 déc.   9 10:57 a11y
drwxrwxr-x  2 titane-os titane-os  4096 janv. 19 15:24 chat
-rw-rw-r--  1 titane-os titane-os 18763 janv. 17 12:49 cognitive-engines-e2e.test.ts
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:49 contract
drwxrwxr-x  2 titane-os titane-os  4096 févr.  2 08:30 e2e
drwxrwxr-x  2 titane-os titane-os  4096 janv.  2 23:20 fixtures
-rw-rw-r--  1 titane-os titane-os 16101 févr. 28 09:06 glm46v-integration.test.ts
drwxrwxr-x  2 titane-os titane-os  4096 janv. 19 15:24 integration
drwxrwxr-x  2 titane-os titane-os  4096 janv. 24 22:03 mocks
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:49 performance
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:49 phase2
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:49 phase3
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:49 phase4
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:49 phase5
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:49 phase6
drwxrwxr-x  2 titane-os titane-os  4096 janv.  1 19:08 polyfills
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:49 release
-rw-rw-r--  1 titane-os titane-os  2885 janv.  4 20:15 run_all_autonomous_tests.sh
-rwxrwxr-x  1 titane-os titane-os  9104 janv. 19 15:24 run_all_tests.sh
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:49 security
-rw-rw-r--  1 titane-os titane-os  1239 janv. 17 12:49 setup.ts
-rw-rw-r--  1 titane-os titane-os  8239 févr.  3 08:05 ui-navigation.test.tsx
drwxrwxr-x  9 titane-os titane-os  4096 févr. 13 17:55 unit
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:49 verification
total 796
drwxrwxr-x 24 titane-os titane-os  4096 mars   1 12:29 .
drwxrwxr-x 45 titane-os titane-os  4096 mars   4 12:55 ..
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:49 a11y
-rw-rw-r--  1 titane-os titane-os  8440 janv. 29 13:57 ai-orchestrator-neural-fixed.test.ts
-rw-rw-r--  1 titane-os titane-os  7693 janv. 17 12:50 ai-subsystem-validation-v20omega.test.ts
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:50 api
drwxrwxr-x  4 titane-os titane-os  4096 janv. 26 19:17 apps
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:50 architecture
-rw-rw-r--  1 titane-os titane-os 19961 janv. 27 16:36 audioStateMachine.test.ts
-rw-rw-r--  1 titane-os titane-os 17054 janv. 27 16:36 automations.config.test.ts
-rw-rw-r--  1 titane-os titane-os  3248 janv. 17 12:50 boot-smoke.test.ts
-rw-rw-r--  1 titane-os titane-os  9979 févr.  5 08:58 c1-contracts.test.ts
-rw-rw-r--  1 titane-os titane-os 14036 févr.  5 09:01 c2-anti-silence.test.tsx
-rw-rw-r--  1 titane-os titane-os 11472 févr. 19 18:43 c3-latency.test.ts
-rw-rw-r--  1 titane-os titane-os 10816 févr.  5 10:07 c4-memory.test.ts
-rw-rw-r--  1 titane-os titane-os 11025 févr.  5 09:05 c5-observability.test.ts
-rw-rw-r--  1 titane-os titane-os  5560 févr.  5 09:04 c6-baseline.test.ts
-rw-rw-r--  1 titane-os titane-os  8973 janv. 27 16:36 chatEngine-memory-integration.test.ts
-rw-rw-r--  1 titane-os titane-os  8081 janv. 17 12:50 chatEngine.test.ts
-rw-rw-r--  1 titane-os titane-os  2562 janv. 29 13:57 chat-fallback-display.test.ts
-rw-rw-r--  1 titane-os titane-os 10902 janv. 19 15:24 chat-ia-critical-fixes.test.ts
-rw-rw-r--  1 titane-os titane-os 11775 janv. 27 16:36 chat-ia-diagnostic.test.ts
-rw-rw-r--  1 titane-os titane-os 11654 janv. 27 16:36 chat-ia-stability.test.ts
-rw-rw-r--  1 titane-os titane-os 12474 janv. 17 12:50 chatModes.config.test.ts
-rw-rw-r--  1 titane-os titane-os  6803 févr. 19 20:19 cloud-agent-timeout-config.test.ts
-rw-rw-r--  1 titane-os titane-os 10301 janv. 27 16:36 cognitive-kernel-v22omega.test.ts
drwxrwxr-x  2 titane-os titane-os  4096 févr. 13 17:37 compliance
drwxrwxr-x  4 titane-os titane-os  4096 janv. 26 19:46 components
-rw-rw-r--  1 titane-os titane-os 13401 janv. 17 12:50 constitution-integration.test.ts
drwxrwxr-x  3 titane-os titane-os  4096 déc.  20 13:25 core
drwxrwxr-x  2 titane-os titane-os  4096 févr.  8 10:27 e2e
-rw-rw-r--  1 titane-os titane-os  2623 févr.  1 20:56 e2e-api-integration.test.ts
-rw-rw-r--  1 titane-os titane-os 78418 févr. 13 17:20 e2e-automated-validation.test.tsx
-rw-rw-r--  1 titane-os titane-os  2348 févr.  1 20:56 e2e-performance.test.ts
-rw-rw-r--  1 titane-os titane-os   882 févr.  1 20:56 e2e-setup.ts
-rw-rw-r--  1 titane-os titane-os  1605 févr.  1 20:56 e2e-test-utils.ts
-rw-rw-r--  1 titane-os titane-os  1713 févr.  1 20:56 e2e-ui-integration.test.tsx
drwxrwxr-x  2 titane-os titane-os  4096 janv. 26 19:53 edge-cases
-rw-rw-r--  1 titane-os titane-os 16087 janv. 19 15:24 evolutionIA.config.test.ts
drwxrwxr-x  6 titane-os titane-os  4096 janv. 26 19:40 features
drwxrwxr-x  2 titane-os titane-os  4096 févr.  8 10:27 hooks
drwxrwxr-x  2 titane-os titane-os  4096 févr.  4 08:41 integration
drwxrwxr-x  3 titane-os titane-os  4096 déc.  20 12:54 lib
-rw-rw-r--  1 titane-os titane-os 16633 janv. 17 12:49 memoryComponents.test.tsx
drwxrwxr-x  2 titane-os titane-os  4096 janv. 27 09:42 mocks
-rw-rw-r--  1 titane-os titane-os 17187 janv. 17 12:50 multimodal-fusion.test.ts
-rw-rw-r--  1 titane-os titane-os  1068 mars   1 00:09 ollama-proxy.test.ts
drwxrwxr-x  2 titane-os titane-os  4096 janv. 19 15:24 omega
-rw-rw-r--  1 titane-os titane-os 12555 févr.  6 16:00 omega-e2e-validation.test.ts
-rw-rw-r--  1 titane-os titane-os 28077 févr. 13 19:29 omega-provider-tests.test.ts
-rw-rw-r--  1 titane-os titane-os  9523 févr. 25 20:26 online-availability.test.ts
-rw-rw-r--  1 titane-os titane-os 21318 janv. 17 12:50 opus-engines.test.ts
drwxrwxr-x  3 titane-os titane-os  4096 févr.  4 08:41 panels
drwxrwxr-x  2 titane-os titane-os  4096 janv. 26 19:53 performance
-rw-rw-r--  1 titane-os titane-os  5033 janv. 17 12:50 performance-optimizations.test.ts
-rw-rw-r--  1 titane-os titane-os 37772 janv. 17 12:50 persistentMemory.test.ts
-rw-rw-r--  1 titane-os titane-os  8930 févr. 25 20:26 provider-decision-invariants.test.ts
-rw-rw-r--  1 titane-os titane-os   759 janv. 17 12:50 secure-secrets-utils.test.ts
drwxrwxr-x  8 titane-os titane-os  4096 déc.  20 13:41 services
-rw-rw-r--  1 titane-os titane-os  5264 févr. 16 09:34 setup.ts
-rw-rw-r--  1 titane-os titane-os 10396 janv. 17 12:50 singularity-fusion-integration.test.ts
-rw-rw-r--  1 titane-os titane-os  7903 janv. 18 06:14 singularity-fusion-mocked.test.ts
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:50 stores
-rw-rw-r--  1 titane-os titane-os  6619 janv. 17 12:50 stub-engines-safety.test.ts
-rw-rw-r--  1 titane-os titane-os  1238 janv. 29 13:57 test-globals.d.ts
-rw-rw-r--  1 titane-os titane-os   856 janv. 29 13:57 test-helpers.tsx
drwxrwxr-x  2 titane-os titane-os  4096 janv. 27 16:35 test-utils
drwxrwxr-x  2 titane-os titane-os  4096 févr.  2 10:04 ui
-rw-rw-r--  1 titane-os titane-os  3101 janv. 27 10:42 ui-first-10-responses.test.tsx
-rw-rw-r--  1 titane-os titane-os 15358 janv. 17 12:50 unifiedMemory.test.ts
-rw-rw-r--  1 titane-os titane-os  8347 janv. 18 06:14 useAudioStreaming.test.ts
-rw-rw-r--  1 titane-os titane-os  2557 janv. 27 10:42 useChat-streaming.test.ts
-rw-rw-r--  1 titane-os titane-os 15986 janv. 27 10:42 useTTSWithMicControl.test.ts
-rw-rw-r--  1 titane-os titane-os 26407 janv. 27 10:42 useVAD.test.ts
drwxrwxr-x  2 titane-os titane-os  4096 janv. 29 15:16 utils
-rw-rw-r--  1 titane-os titane-os   472 janv. 26 20:54 vitest-env.d.ts
-rw-rw-r--  1 titane-os titane-os 20292 janv. 17 12:50 xpExtended.config.test.ts
total 80
drwxrwxr-x  8 titane-os titane-os  4096 janv. 17 12:50 .
drwxrwxr-x 45 titane-os titane-os  4096 mars   4 12:55 ..
-rw-rw-r--  1 titane-os titane-os 17043 janv. 17 12:50 activeListeningIntegration.test.ts
drwxrwxr-x  2 titane-os titane-os  4096 janv. 17 12:50 browser
-rw-rw-r--  1 titane-os titane-os  7536 janv. 17 12:49 chat-ia-interface.test.tsx
-rw-rw-r--  1 titane-os titane-os  5950 janv. 23 20:53 chat-ia-real.test.ts
drwxrwxr-x  2 titane-os titane-os  4096 févr. 15 09:34 consistency
drwxrwxr-x  2 titane-os titane-os  4096 févr. 16 09:34 e2e
drwxrwxr-x  2 titane-os titane-os  4096 févr. 15 09:34 memory
-rw-rw-r--  1 titane-os titane-os  4058 janv. 17 12:50 presenceOS.test.ts
drwxrwxr-x  2 titane-os titane-os  4096 janv. 19 15:24 regression
-rw-rw-r--  1 titane-os titane-os  1309 janv. 17 12:50 security.test.ts
-rw-rw-r--  1 titane-os titane-os  1674 janv. 17 12:50 tauri-invoke-fix-validator.ts
drwxrwxr-x  2 titane-os titane-os  4096 févr. 15 09:34 voice
total 428
drwxrwxr-x  19 titane-os titane-os   4096 mars   3 20:27 .
drwxrwxr-x  56 titane-os titane-os  36864 mars   4 13:02 ..
-rw-rw-r--   1 titane-os titane-os      0 déc.  18 23:20 =
-rw-rw-r--   1 titane-os titane-os   5354 févr. 10 18:29 allowlist.whitelist.stable.BACKUP_20260210T232915.json
-rw-rw-r--   1 titane-os titane-os  18896 févr. 23 18:34 allowlist.whitelist.stable.json
drwxrwxr-x   2 titane-os titane-os   4096 déc.  15 10:37 benches
-rw-rw-r--   1 titane-os titane-os     39 déc.   9 10:57 build.rs
drwxrwxr-x   2 titane-os titane-os   4096 mars   3 20:27 capabilities
drwxrwxr-x   2 titane-os titane-os   4096 déc.   9 10:57 .cargo
-rw-rw-r--   1 titane-os titane-os 199423 févr. 25 08:02 Cargo.lock
-rw-rw-r--   1 titane-os titane-os   5951 févr. 25 08:02 Cargo.toml
drwxrwxr-x   4 titane-os titane-os   4096 févr. 25 08:19 data
drwxrwxr-x   3 titane-os titane-os   4096 févr. 27 18:54 deployment
drwxrwxr-x   3 titane-os titane-os   4096 déc.   9 10:57 gen
drwxrwxr-x   5 titane-os titane-os   4096 mars   1 12:29 icons
drwxrwxr-x   2 titane-os titane-os   4096 mars   4 07:00 memory
drwxrwxr-x   6 titane-os titane-os   4096 mars   4 12:52 reports
drwxrwxr-x   3 titane-os titane-os   4096 févr.  6 10:23 resources
drwxrwxr-x   4 titane-os titane-os   4096 févr. 25 20:37 runtime
-rw-rw-r--   1 titane-os titane-os    384 janv.  2 11:38 .rustfmt.toml
```
