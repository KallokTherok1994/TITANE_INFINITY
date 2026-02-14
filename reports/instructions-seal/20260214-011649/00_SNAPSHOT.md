]633;E;{   echo "# 00_SNAPSHOT — 20260214-011649"\x3b   echo\x3b   echo "## git"\x3b   echo "branch: $(git rev-parse --abbrev-ref HEAD)"\x3b   echo "commit: $(git log -1 --oneline)"\x3b   echo\x3b   echo "## toolchain"\x3b   node -v || true\x3b   pnpm -v || true\x3b   rustc --version || true\x3b   cargo --version || true\x3b   echo\x3b   echo "## status"\x3b   git status --porcelain=v1 || true\x3b   echo\x3b   echo "## verify scripts (package.json excerpts)"\x3b   (cat package.json | rg -n '"verify"|verify:|heal:' || true)\x3b } > "$DIR/00_SNAPSHOT.md";457a7e9b-f635-409a-81e8-a0b489972b5b]633;C# 00_SNAPSHOT — 20260214-011649

## git
branch: MAIN
commit: 13bb7c3e docs(instructions): performance-first Copilot constitution (E2E wrapper+memory guard+stop-the-line)

## toolchain
v24.0.0
10.28.2
rustc 1.91.1 (ed61e7d7e 2025-11-07)
cargo 1.91.1 (ea2d97820 2025-10-10)

## status
 M .github/copilot-instructions.md
 M .github/instructions/titane.instructions.md
 M .prettierignore
 M e2e/critical/app-launch.spec.ts
 M e2e/desktop/ui-chat-360-autofix.wdio.test.cjs
 M e2e/fixtures/global-setup.ts
 M e2e/fixtures/index.ts
 M e2e/fixtures/tauri-ipc-mock-inline.js
 M e2e/fixtures/tauri-ipc-mock.ts
 M e2e/runtime-validation/chat-ar20.spec.ts
 M package.json
 M playwright.config.ts
 M scripts/e2e/run-ui-chat-360-autofix.cjs
 M scripts/e2e/tauri-wrapper.sh
 M src-tauri/src/perf_bench.rs
 M src-tauri/src/perf_metrics_capture.rs
 M src/__tests__/components/devtools/LogViewer.test.tsx
 M src/__tests__/components/devtools/MetricsDisplay.test.tsx
 M src/__tests__/features/monitoring/SystemHealthMonitor.test.tsx
 M src/__tests__/hooks/useSystemHealth.test.tsx
 M src/__tests__/ollama-proxy.test.ts
 M src/__tests__/omega-provider-tests.test.ts
 M src/features/governance-center/components/APIProviderCard.tsx
 M src/hooks/__tests__/fusion-hooks.test.ts
 M src/services/ai/types.ts
 M tests/unit/ControlPanel.test.tsx
?? .github/instructions/docs-registry.instructions.md
?? .github/instructions/frontend.instructions.md
?? .github/instructions/tauri.instructions.md
?? .github/instructions/tests-e2e.instructions.md
?? docs/current/GOV_COPILOT_INSTRUCTIONS.md
?? scripts/verify/verify-copilot-instructions.sh

## verify scripts (package.json excerpts)
31:    "verify": "pnpm run lint && pnpm run format:check && pnpm run check && pnpm run test:all && pnpm run verify:tauri-only && pnpm run verify:local-first && pnpm run verify:instructions && pnpm run verify:tauri-configs",
32:    "verify:final100": "pnpm run check && pnpm run lint && pnpm run format:check && pnpm run verify:tauri-only",
33:    "verify:prod-boot": "node scripts/gates/vite-base-relative-gate.cjs",
34:    "verify:tauri-only": "bash scripts/verify/enforce-tauri-only.sh",
35:    "verify:local-first": "bash scripts/verify/enforce-local-first.sh",
36:    "verify:instructions": "bash scripts/verify/verify-copilot-instructions.sh",
37:    "verify:tauri-configs": "bash scripts/verify/validate-tauri-configs.sh",
110:    "verify:registry:sync": "node scripts/verify/registry-sync.js",
111:    "verify:registry:integrity": "node scripts/verify/registry-integrity.js",
112:    "verify:registry:quality": "node scripts/verify/registry-quality.js",
113:    "verify:registry": "pnpm -s verify:registry:sync && pnpm -s verify:registry:integrity && pnpm -s verify:registry:quality"
