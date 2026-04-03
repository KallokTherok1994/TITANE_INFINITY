# TEST_STACK_DISCOVERY

## Runtime and Toolchain
- Node: v24.0.0
- pnpm: 10.30.2
- Rust: 1.94.0
- Cargo: 1.94.0
- Tauri CLI: 2.10.0

## Test Layers
- Unit/Integration (frontend): `vitest`
- Rust unit/integration: `cargo test --manifest-path src-tauri/Cargo.toml`
- Browser E2E: `playwright`
- Desktop E2E (Tauri/WRY): `wdio` via `wdio.desktop.conf.cjs`

## Canonical Commands
- Frontend targeted unit: `pnpm exec vitest run src/services/conversationEngine.test.ts`
- Rust targeted pipeline proof: `cargo test --manifest-path src-tauri/Cargo.toml conversation_os_single_pipeline_trace_and_artifacts_are_canonical -- --nocapture`
- Desktop online chat proof: `bash scripts/e2e/run-online-chat-proof-ui.sh`

## Verified in this session
- `conversationEngine.test.ts`: PASS
- Rust conversation OS canonical test: PASS
- Desktop proof after hardening: PASS x3

## Desktop E2E Artifacts (latest cycle)
- `reports/ui_research_e2e/20260320T132754Z`
- `reports/ui_research_e2e/20260320T132956Z`
- `reports/ui_research_e2e/20260320T133059Z`

## Notes
- Desktop proof uses `tauri-driver` + WRY via `wdio.desktop.conf.cjs`.
- Harness is sensitive to model latency. E2E launcher now forces a lightweight model profile by default and bounded conversation timeout.