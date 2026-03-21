]633;E;{   echo "# 01_BOOTSTRAP"\x3b   echo\x3b   echo "## date"\x3b   date -Is\x3b   echo\x3b   echo "## git status"\x3b   git status --short\x3b   echo\x3b   echo "## git status (full)"\x3b   git status\x3b   echo\x3b   echo "## git rev-parse --short HEAD"\x3b   git rev-parse --short HEAD\x3b   echo\x3b   echo "## git log -20 --oneline"\x3b   git log -20 --oneline\x3b   echo\x3b   echo "## node -v"\x3b   node -v || true\x3b   echo\x3b   echo "## pnpm -v"\x3b   pnpm -v || true\x3b   echo\x3b   echo "## cargo -V"\x3b   cargo -V || true\x3b   echo\x3b   echo "## rustc -V"\x3b   rustc -V || true\x3b   echo\x3b   echo "## pnpm tauri -v"\x3b   pnpm tauri -v || true\x3b   echo\x3b   echo "## pnpm -s run"\x3b   pnpm -s run || true\x3b } > "$PACK/01_BOOTSTRAP.md";f9ffc318-013b-4042-b5a9-f5d3c416bfe3]633;C# 01_BOOTSTRAP

## date
2026-03-20T23:47:21-04:00

## git status
 M RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt
?? .current_chat_artifact_pack
?? proof_packs/BUILD_UNBLOCK_TO_RELEASE_2026-03-20_2345_a30fe56ef/
?? proof_packs/CHAT_ARTIFACTS_PRO_FILES_2026-03-20_2347_a30fe56ef/

## git status (full)
Sur la branche MAIN
Votre branche est à jour avec 'origin/MAIN'.

Modifications qui ne seront pas validées :
  (utilisez "git add <fichier>..." pour mettre à jour ce qui sera validé)
  (utilisez "git restore <fichier>..." pour annuler les modifications dans le répertoire de travail)
	modifié :         RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt

Fichiers non suivis:
  (utilisez "git add <fichier>..." pour inclure dans ce qui sera validé)
	.current_chat_artifact_pack
	proof_packs/BUILD_UNBLOCK_TO_RELEASE_2026-03-20_2345_a30fe56ef/
	proof_packs/CHAT_ARTIFACTS_PRO_FILES_2026-03-20_2347_a30fe56ef/

aucune modification n'a été ajoutée à la validation (utilisez "git add" ou "git commit -a")

## git rev-parse --short HEAD
a30fe56ef

## git log -20 --oneline
a30fe56ef chore: stage release artifacts before rebase
f4ffe208d audit(preprod): PREPROD_FINAL_AUDIT_2026-03-21 — registry drift fix + QUALIFIED verdict
9a8f8315a preprod seal: fix capability-coverage validator accuracy + proof pack
38dc82517 feat(nav): TWINS menu fusion — symbiose tab canonical under TITANE (v29.2)
6e6310efd fix(capabilities): add chat_memory_backup/restore/stats to chat_ai.json — close DEFECT_001
5e8d050e2 feat(memory): add chat_memory_backup/restore Tauri commands — close MEMORY_RESTORE_UNPROVEN
db911a5e2 fix(memory): close MEMORY_INJECTION_UNPROVEN — recall hook + LTM full content + response metadata
f77204667 fix(memory): LTM disk write + cross-session restore in UnifiedMemory
0b82fd6d5 docs(postfix-closure): POST_FIX_CERTIFICATION_COMPLETE — UI truth chain audit + desktop proof plan
71f5afd82 docs(proof-pack): TOTAL_DEV native harness certification — BLOCKED_NATIVE_AUTOMATION_FRAMEWORK
d66485c0e NATIVE E2E: TOTAL_DEV wdio tests + debug runs (BLOCKED_NATIVE_AUTOMATION)
43c0727e7 fix(chat-provider): reset failure counter on Ollama probe success — LOCAL_PROVIDER_RECOVERED_STATE_NOT_PROPAGATED
b02cae75d feat(e2e): add native TOTAL_DEV test to WebdriverIO/Tauri suite
05bb7be75 docs(hardening-audit): TOTAL_DEV native E2E audit — downgrade to PARTIAL_WEB_HARNESS_ONLY (honest scope)
154286a6b docs(real-desktop-final): TOTAL_DEV real X11 desktop certification — PASS_REAL_DESKTOP_CERTIFIED
5d6e45c20 fix(e2e): add data-testid attributes for smoke test Playwright selectors
3eb6af59f docs(pass-upgrade): TOTAL_DEV v28.1.0 E2E audit + testid wiring — BLOCKED_HEADLESS_E2E_ENVIRONMENT (honest blocker classification)
f7973be9e docs(recert): TOTAL_DEV v28.1.0 hard recertification — PARTIAL verdict + plaintext fix + 11 gate-audited discovery files (2026-03-20)
3e2907000 fix(security): remove plaintext token reference from TOTAL_DEV unlock comment — secret hygiene I7
3d044db4e docs(proof-pack): TOTAL_DEV v28.1.0 session completion — e2e smoke test + architecture audit

## node -v
v24.0.0

## pnpm -v
10.30.2

## cargo -V
cargo 1.94.0 (85eff7c80 2026-01-15)

## rustc -V
rustc 1.94.0 (4a4ef493e 2026-03-02)

## pnpm tauri -v

## pnpm -s run
Lifecycle scripts:
  preinstall
    node scripts/install/enforce-package-manager.cjs
  start
    echo '🔒 TAURI-ONLY MODE: Use pnpm run dev instead' && exit 1
  test
    cross-env TZ=UTC NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run
  prepare
    husky

Commands available via "pnpm run":
  dev
    tauri dev
  dev:tauri
    node scripts/launch/dev_tauri_monitor.mjs
  dev:tauri:clean
    bash scripts/dev/cleanup-dev-env.sh && pnpm run dev:tauri
  dev:tauri:raw
    bash scripts/launch/deploy_full_local_dev.sh
  dev:tauri:no-ollama
    bash scripts/launch/deploy_full_local_dev.sh --no-ollama
  dev:cleanup
    bash scripts/dev/cleanup-dev-env.sh
  ollama:start
    ollama serve
  ollama:status
    curl -s http://127.0.0.1:11434/api/tags | jq . 2>/dev/null || echo 'Ollama not running'
  ollama:pull
    ollama pull llama3.2:latest
  ollama:bundle
    bash scripts/prepare-ollama-bundle.sh
  build
    vite build
  postbuild
    bash scripts/post-build.sh
  build:prod-safe
    NPM_CONFIG_IGNORE_SCRIPTS=1 vite build
  build:prod-safe:verify
    node scripts/guards/guard-prod-safe-build.mjs
  guard:ollama-proxy
    bash scripts/guard/guard-ollama-proxy.sh
  guard:ipc-only-tests
    bash scripts/guard/guard-ipc-only-tests.sh
  guard:dev-bridge
    node scripts/guard/guard-dev-bridge.mjs
  guard:ipc-contract
    cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run tests/contract/tauri-ipc-contract.test.ts
  build:tauri:e2e
    pnpm run guard:ollama-proxy && bash scripts/e2e/require-e2e-build-authorization.sh && vite build && tauri build --config src-tauri/tauri.conf.json
  build:production
    pnpm run lint && pnpm run format:check && pnpm run ollama:bundle && vite build && tauri build && bash scripts/post-build.sh
  android:init
    tauri android init
  android:dev
    tauri android dev
  android:build
    tauri android build --features custom-protocol,mock
  android:build:debug
    tauri android build --debug --features custom-protocol,mock
  preview
    echo '🔒 TAURI-ONLY MODE' && exit 1
  lint
    eslint "src/**/*.{ts,tsx,js,jsx}"
  lint:fix
    eslint "src/**/*.{ts,tsx,js,jsx}" --fix
  lint:staged
    lint-staged
  format
    prettier --write .
  format:check
    prettier --check .
  check
    tsc --noEmit
  verify
    pnpm run lint && pnpm run format:check && pnpm run check && pnpm run test:all && pnpm run verify:tauri-only && pnpm run verify:online-first && pnpm run verify:invariants-governed && pnpm run verify:network-guard && pnpm run guard:ipc-only-tests && pnpm run verify:seal-post-certification && pnpm run verify:instructions && pnpm run verify:docs:mermaid && pnpm run verify:tauri-configs
  verify:final100
    pnpm run check && pnpm run lint && pnpm run format:check && pnpm run verify:tauri-only
  verify:prod-boot
    node scripts/gates/vite-base-relative-gate.cjs
  verify:tauri-only
    bash scripts/verify/enforce-tauri-only.sh
  verify:online-first
    bash scripts/verify/enforce-online-first.sh
  verify:invariants-governed
    bash scripts/verify/enforce-invariants-governed.sh
  verify:network-guard
    bash scripts/guards/guard-network-policy.sh
  verify:command-whitelist-sync
    bash scripts/verify/verify-command-whitelist-sync.sh
  verify:seal-post-certification
    bash scripts/verify/verify-seal-post-certification.sh
  verify:instructions
    bash scripts/verify/verify-copilot-instructions.sh
  render:docs:mermaid
    bash scripts/verify/mermaid-render-sync.sh
  verify:docs:mermaid
    bash scripts/verify/verify-mermaid-diagrams.sh
  verify:docs:mermaid:change
    bash scripts/verify/mermaid-change-request-guard.sh
  verify:docs:mermaid:diff
    bash scripts/verify/mermaid-diff-intel.sh
  verify:docs:mermaid:status
    bash scripts/verify/mermaid-status-report.sh --check
  op:mermaid
    pnpm run verify:docs:mermaid:change && pnpm run render:docs:mermaid && pnpm run verify:docs:mermaid && bash scripts/verify/mermaid-hash-registry.sh --check && bash scripts/verify/verify-mermaid-drift.sh --strict --allowlist docs/diagrams/DRIFT_ALLOWLIST.txt && bash scripts/verify/mermaid-no-self-hash-guard.sh
  op:mermaid:pack
    bash scripts/verify/mermaid-proof-pack.sh
  verify:tauri-configs
    bash scripts/verify/validate-tauri-configs.sh
  verify:remediation-permissions
    node scripts/gates/remediation-permissions-widening-gate.js
  verify:autopr-v2
    node scripts/gates/autopr-v2-policy-gate.js
  verify:staged-patch-v2
    bash scripts/verify/staged-patch-v2-workflow.sh
  verify:proof-requirements-v2
    bash scripts/verify/proof-requirements-v2.sh
  verify:lab-runner-v2
    bash scripts/verify/lab-runner-v2.sh
  verify:scorecard-ci-gate-v2
    bash scripts/verify/scorecard-ci-gate-v2.sh
  verify:tauri-bundle-type
    bash scripts/verify/verify-tauri-bundle-type-warning.sh
  test:watch
    cross-env TZ=UTC NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest --watch
  test:coverage
    cross-env TZ=UTC NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run --coverage && pnpm run test:coverage:check
  test:coverage:unit
    cross-env TZ=UTC NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run -c vitest.unit.config.ts --coverage
  test:coverage:integration
    cross-env TZ=UTC NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run -c vitest.integration.config.ts --coverage
  test:coverage:check
    bash scripts/verify/verify-coverage.sh
  test:coverage:report
    cross-env NODE_OPTIONS='--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run --coverage && echo 'Open coverage/index.html in browser'
  e2e:desktop:ensure
    bash scripts/e2e/ensure-webkit-webdriver.sh
  e2e:desktop:run
    node scripts/e2e/run-desktop-suite.js
  e2e:desktop:proof:online-chat
    bash scripts/e2e/run-online-chat-proof-ui.sh
  e2e:desktop:proof:memory-chat
    bash scripts/e2e/run-memory-chat-proof-ui.sh
  e2e:desktop
    pnpm run guard:ollama-proxy && bash scripts/e2e/require-e2e-build-authorization.sh && pnpm run e2e:desktop:ensure && pnpm run e2e:desktop:run
  test:e2e
    playwright test e2e
  test:e2e:playwright
    playwright test e2e
  test:e2e:vitest
    bash -c 'if [[ "${TITANE_E2E_TAURI:-}" != "1" ]]; then echo "SKIP: Vitest E2E (src/tests/e2e) nécessite un contexte Tauri réel. Relance avec TITANE_E2E_TAURI=1"; exit 0; fi; cross-env RUN_E2E_TESTS=1 NODE_OPTIONS="--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs" vitest run src/tests/e2e/titane_e2e.test.ts'
  test:browser
    vitest --config vitest.browser.config.ts --run
  test:browser:ui
    vitest --config vitest.browser.config.ts --ui
  test:browser:watch
    vitest --config vitest.browser.config.ts
  test:dev-bridge:contract
    node scripts/dev/dev-bridge-contract-test.mjs
  test:100
    pnpm run test && pnpm run test:browser
  test:100:full
    pnpm run test && cross-env RUN_E2E_TESTS=1 pnpm run test:e2e:vitest && pnpm run test:browser
  test:rust
    mkdir -p dist && cd src-tauri && cargo test --lib
  test:tauri
    pnpm run test:rust
  test:architecture
    cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/architecture
  test:compliance
    cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/compliance
  test:omega
    cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/*omega*.test.ts
  test:all
    cross-env NODE_OPTIONS='--max-old-space-size=8192' pnpm run test && pnpm run test:rust && pnpm run test:architecture && pnpm run test:compliance
  test:all:full
    pnpm run test:all && pnpm run test:e2e:playwright
  audit
    pnpm audit && cd src-tauri && cargo audit
  audit:master
    ./scripts/audit/00-master-audit.sh
  audit:security
    ./scripts/audit/01-security-audit.sh
  audit:architecture
    ./scripts/audit/02-architecture-audit.sh
  audit:performance
    ./scripts/audit/03-performance-measure.sh
  audit:coverage
    ./scripts/audit/04-test-coverage.sh
  audit:deployment
    ./scripts/audit/05-deployment-audit.sh
  audit:auto-fix
    ./scripts/audit/06-auto-fix.sh
  audit:quality-gates
    ./scripts/audit/07-quality-gates.sh
  clean
    rm -rf node_modules target dist
  clean:vite
    rm -rf node_modules/.vite dist/.vite-cache
  clean:all
    rm -rf node_modules/.vite dist node_modules target
  titane
    ./titane.sh
  titane:clean
    ./titane.sh clean
  titane:repair
    ./titane.sh repair
  titane:fix
    ./titane.sh fix
  titane:build
    ./titane.sh build
  titane:deploy
    ./titane.sh deploy
  titane:full
    ./titane.sh full
  titane:health
    ./titane.sh health
  titane:dev
    node scripts/dev/dev-bridge.mjs
  gate:dist-assets
    node scripts/gate-dist-assets.mjs
  gate:appimage-index
    node scripts/gate-appimage-index.mjs
  gate:prod-boot
    bash scripts/gate-prod-boot.sh
  gate:all
    pnpm run gate:dist-assets && pnpm run gate:appimage-index
  stopline:rebuild-proof
    bash scripts/stopline_rebuild_proof.sh
  stopline:latest
    bash scripts/stopline_latest_report.sh
  reviewer:normalize
    node scripts/reviewer_gate_normalize.js
  auto-heal
    ./scripts/maintenance/auto-heal.sh
  auto-fix
    pnpm run lint -- --fix && pnpm run format
  storybook
    storybook dev -p 6006
  build-storybook
    storybook build
  docs
    typedoc
  docs:serve
    echo '🔒 TAURI-ONLY MODE' && exit 1
  copilot-xs:validate
    node .github/copilot-xs/scripts/validate.js
  copilot-xs:precommit
    node .github/copilot-xs/scripts/precommit.js
  copilot-xs:status
    node .github/copilot-xs/scripts/agent-status.js
  copilot-xs:security-scan
    node .github/copilot-xs/scripts/security-scan.js
  copilot-xs:test
    pnpm run copilot-xs:validate && pnpm run test:all
  cline:install
    bash .clinerules/install-hooks.sh
  cline:test-hooks
    bash -c 'echo Testing hooks... && .clinerules/hooks/TaskStart < tests/fixtures/hook-test-input.json'
  cline:logs
    tail -f .clinerules/logs/operations.log
  cline:verify
    bash -c 'for hook in TaskStart PreToolUse PostToolUse UserPromptSubmit; do echo "Testing $hook..."; test -x .clinerules/hooks/$hook && echo "✅ $hook" || echo "❌ $hook"; done'
  registry:log
    node scripts/registry/log-event.js
  registry:snapshot
    node scripts/registry/rebuild-snapshot.js
  registry:dashboard
    node scripts/registry/render-dashboard.js
  registry:cycle:start
    node scripts/registry/start-cycle.js
  registry:cycle:close
    node scripts/registry/close-cycle.js
  verify:registry:sync
    node scripts/verify/registry-sync.js
  verify:registry:integrity
    node scripts/verify/registry-integrity.js
  verify:registry:quality
    node scripts/verify/registry-quality.js
  verify:registry
    pnpm -s verify:registry:sync && pnpm -s verify:registry:integrity && pnpm -s verify:registry:quality
  run:x3:tests
    bash scripts/lib/run_x3_profile.sh tests
  run:x3:build
    bash scripts/lib/run_x3_profile.sh build
  run:x3:network
    bash scripts/lib/run_x3_profile.sh network
