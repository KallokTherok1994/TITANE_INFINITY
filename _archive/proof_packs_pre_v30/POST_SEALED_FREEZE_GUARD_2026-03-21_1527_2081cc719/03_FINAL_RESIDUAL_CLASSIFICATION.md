# Final Residual Classification

| Item | Classification | Rationale |
|------|---------------|-----------|
| DesignCenter.truth-chain.test.tsx:88 flaky test | SHOULD_FIX_NEXT_CYCLE | Pre-existing parallel-suite timing issue. Passes alone. Not product-affecting. |
| src-tauri/src/ollama.rs (orphaned dead file) | HISTORICAL_KEEP | #[allow(dead_code)], not in lib.rs module tree. Legacy reference. Do not touch. |
| `cargo test --release` linker error (tauri_plugin_dialog) | HISTORICAL_KEEP | Test-mode limitation, production binary unaffected. Pre-existing. |
| deployment/latest/ missing v28.6.0 AppImage copy | SHOULD_FIX_NEXT_CYCLE | Staging area not updated. Canonical artifact lives in bundle/appimage/ with verified checksum. Non-blocking. |
| docs/90_release/ missing PRODUCTION_RELEASE_v28.6.0.md | SHOULD_FIX_NEXT_CYCLE | Seal is in root RELEASE_v28.6.0_SEALED.txt. No contradiction. |
| ESLint 10 PEER_BLOCKED | HISTORICAL_KEEP | eslint-plugin-react caps at ^9.7. Documented in sealed release. Not solvable without upstream fix. |
| TITANE_CONVERSATION_TIMEOUT_SECS dead env | HISTORICAL_KEEP | Labelled [DEAD] in harness scripts. No removal needed post-sealed. |
| Chat path: PARTIAL_CHAIN (desktop E2E) | NON_BLOCKING_MONITOR | Browser + API + IPC proven. Full desktop E2E x3 requires dedicated Ollama env session. |
| No automated post-deploy health check in CI | NON_BLOCKING_MONITOR | Manual commands documented. No CI pipeline gap causes sealed-state contradiction. |
| docs/README.md v28.5.0 refs in module descriptions (cosmetic) | NON_BLOCKING_DOC_ONLY | Module stack description context, not version authority. Does not affect canon. |
| Historical AppImages (v27.x, v28.0.0, v28.5.0) in deployment/latest/ | HISTORICAL_KEEP | Historical staging copies. Required for rollback reference. Do not remove. |
| Multiple old proof packs (v27, v28.0, etc.) | HISTORICAL_KEEP | Append-only governance record. Never remove. |

**BLOCKING_SEALED**: None found.
**UNKNOWN**: None found.
