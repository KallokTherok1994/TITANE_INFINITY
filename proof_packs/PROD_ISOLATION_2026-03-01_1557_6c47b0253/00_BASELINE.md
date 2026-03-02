]633;E;{   echo "# BASELINE VERITE"\x3b   echo "generated_at: $(date -Iseconds)"\x3b   echo "sha: $SHA"\x3b   echo "branch: $(git branch --show-current)"\x3b   echo\x3b   echo "## git status --porcelain"\x3b   echo '```'\x3b   git status --porcelain || true\x3b   echo '```'\x3b   echo\x3b   echo "## git rev-parse --short HEAD"\x3b   echo '```'\x3b   git rev-parse --short HEAD || true\x3b   echo '```'\x3b   echo\x3b   echo "## scripts build/run disponibles"\x3b   echo '```'\x3b   node -e "const p=require('./package.json')\x3b const keys=Object.keys(p.scripts||{}).filter(k=>/(build|run|tauri|prod|test:e2e)/i.test(k))\x3b console.log(keys.sort().map(k=>k+': '+p.scripts[k]).join('\\\\n'))\x3b" || true\x3b   echo '```'\x3b   echo\x3b   echo "## versions"\x3b   echo '```'\x3b   node -v || true\x3b   pnpm -v || npm -v || true\x3b   rustc -V || true\x3b   cargo -V || true\x3b   echo '```'\x3b } > "$PACK/00_BASELINE.md";82d7c740-33bc-4493-bbfa-fbe9001b1573]633;C# BASELINE VERITE
generated_at: 2026-03-01T15:57:31-05:00
sha: 6c47b0253
branch: MAIN

## git status --porcelain
```
 M .vscode/tasks.json
 M e2e/chat-provider-decision-certification.spec.ts
 M e2e/critical/app-launch.spec.ts
 M e2e/critical/chat-interaction.spec.ts
 M e2e/critical/engine-navigation.spec.ts
 M e2e/critical/system-resilience.spec.ts
 M e2e/critical/visual-engine.spec.ts
 M e2e/features/audio-center.spec.ts
 M e2e/features/governance-center.spec.ts
 M e2e/features/memory-tree-viewer.spec.ts
 M e2e/features/production-health.spec.ts
 M e2e/feedback-loop.spec.ts
 M e2e/omega-pipeline-e2e.spec.ts
 M e2e/runtime-validation/chat-ar20.spec.ts
 M e2e/smoke.test.ts
 M e2e/user-flows.test.ts
 M package.json
 M playwright.config.ts
 M scripts/e2e/vite-e2e-watch.cjs
 M src-tauri/src/runtime_config.rs
 M src/App.tsx
 M src/hooks/useChat.ts
 M src/lib/security.ts
 M src/main.tsx
?? .last_omega_pack
?? .last_prod_infinite_pack
# BASELINE VERITE

generated_at: 2026-03-01T15:57:31-05:00
sha: 6c47b0253
branch: MAIN

## git status --porcelain

```text
 M .vscode/tasks.json
 M e2e/chat-provider-decision-certification.spec.ts
 M e2e/critical/app-launch.spec.ts
 M e2e/critical/chat-interaction.spec.ts
 M e2e/critical/engine-navigation.spec.ts
 M e2e/critical/system-resilience.spec.ts
 M e2e/critical/visual-engine.spec.ts
 M e2e/features/audio-center.spec.ts
 M e2e/features/governance-center.spec.ts
 M e2e/features/memory-tree-viewer.spec.ts
 M e2e/features/production-health.spec.ts
 M e2e/feedback-loop.spec.ts
 M e2e/omega-pipeline-e2e.spec.ts
 M e2e/runtime-validation/chat-ar20.spec.ts
 M e2e/smoke.test.ts
 M e2e/user-flows.test.ts
 M package.json
 M playwright.config.ts
 M scripts/e2e/vite-e2e-watch.cjs
 M src-tauri/src/runtime_config.rs
 M src/App.tsx
 M src/hooks/useChat.ts
 M src/lib/security.ts
 M src/main.tsx
?? .last_omega_pack
?? .last_prod_infinite_pack
?? .last_prod_isolation_pack
?? .last_vnext_pack
?? proof_packs/
```

## git rev-parse --short HEAD

```text
6c47b0253
```

## scripts build/run disponibles

```text
build: vite build
build-storybook: storybook build
build:prod-safe: NPM_CONFIG_IGNORE_SCRIPTS=1 vite build
build:prod-safe:verify: node scripts/guards/guard-prod-safe-build.mjs
build:production: pnpm run lint && pnpm run format:check && pnpm run ollama:bundle && vite build && tauri build && bash scripts/post-build.sh
build:tauri:e2e: pnpm run guard:ollama-proxy && bash scripts/e2e/require-e2e-build-authorization.sh && vite build && tauri build --config src-tauri/tauri.conf.json
dev:tauri: node scripts/launch/dev_tauri_monitor.mjs
dev:tauri:no-ollama: bash scripts/launch/deploy_full_local_dev.sh --no-ollama
dev:tauri:raw: bash scripts/launch/deploy_full_local_dev.sh
e2e:desktop:run: node scripts/e2e/run-desktop-suite.js
gate:prod-boot: bash scripts/gate-prod-boot.sh
postbuild: bash scripts/post-build.sh
run:x3:build: bash scripts/lib/run_x3_profile.sh build
run:x3:network: bash scripts/lib/run_x3_profile.sh network
run:x3:tests: bash scripts/lib/run_x3_profile.sh tests
stopline:rebuild-proof: bash scripts/stopline_rebuild_proof.sh
test:e2e: playwright test e2e
test:e2e:playwright: playwright test e2e
test:e2e:vitest: bash -c 'if [[ "${TITANE_E2E_TAURI:-}" != "1" ]]; then echo "SKIP: Vitest E2E (src/tests/e2e) nécessite un contexte Tauri réel. Relance avec TITANE_E2E_TAURI=1"; exit 0; fi; cross-env RUN_E2E_TESTS=1 NODE_OPTIONS="--max-old-space-size=12288 --require ./tests/polyfills/resizable-arraybuffer.cjs" vitest run src/tests/e2e/titane_e2e.test.ts'
test:tauri: pnpm run test:rust
titane:build: ./titane.sh build
verify:lab-runner-v2: bash scripts/verify/lab-runner-v2.sh
verify:prod-boot: node scripts/gates/vite-base-relative-gate.cjs
verify:tauri-bundle-type: bash scripts/verify/verify-tauri-bundle-type-warning.sh
verify:tauri-configs: bash scripts/verify/validate-tauri-configs.sh
verify:tauri-only: bash scripts/verify/enforce-tauri-only.sh
```

## versions

```text
v24.0.0
10.30.2
rustc 1.91.1 (ed61e7d7e 2025-11-07)
cargo 1.91.1 (ea2d97820 2025-10-10)
```
