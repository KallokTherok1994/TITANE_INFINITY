# Residual Classification — v28.7.0

Items carried from v28.6.0 residual (unresolved — not in v28.7.0 scope):

| Item | Classification | Note |
|------|---------------|------|
| Chat path: PARTIAL_CHAIN (desktop E2E) | NON_BLOCKING_MONITOR | Browser + API + IPC proven. Full desktop E2E x3 requires dedicated Ollama env session. |
| No automated post-deploy health check in CI | NON_BLOCKING_MONITOR | Manual commands documented. No pipeline gap causes contradiction. |
| ESLint 10: PEER_BLOCKED | HISTORICAL_KEEP | eslint-plugin-react caps at ^9.7. Upstream constraint. |
| cargo test --release linker error | HISTORICAL_KEEP | tauri_plugin_dialog native deps. Production binary unaffected. |
| src-tauri/src/ollama.rs orphaned | HISTORICAL_KEEP | #[allow(dead_code)], not in lib.rs. Do not touch. |
| docs/90_release/ PRODUCTION_RELEASE_v28.7.0.md missing | SHOULD_FIX_NEXT_CYCLE | Follow v28.6.0 pattern — create doc in next cycle. |
| deployment/latest/ v28.7.0 AppImage | SHOULD_FIX_NEXT_CYCLE | Gitignored binaries not tracked. Local deploy step only. |
