# Residual Debt Register

| Item | Description | Classification |
|------|-------------|---------------|
| DesignCenter.truth-chain.test.tsx:88 | Flaky in parallel suite (timing), passes alone — pre-existing, not introduced by v28.6.0 | SHOULD_FIX_NEXT_CYCLE |
| src-tauri/src/ollama.rs | Orphaned dead file (#[allow(dead_code)], not in lib.rs module tree) — legacy, safe | NON_BLOCKING_KEEP |
| cargo test --release linker error | tauri_plugin_dialog native deps unavailable in test mode — pre-existing limitation, production binary unaffected | NON_BLOCKING_KEEP |
| deployment/latest/ missing v28.6.0 AppImage | Copy not made to staging area after build | SHOULD_FIX_NEXT_CYCLE |
| Chat path desktop proof | PARTIAL_CHAIN — browser E2E proven, Ollama API proven, IPC reachability proven via tauri-driver (Omega recert). Full desktop E2E pass x3 pending dedicated Ollama env. | NON_BLOCKING_MONITOR |
| ESLint 10 PEER_BLOCKED | eslint-plugin-react caps at ^9.7 — documented in RELEASE seal | NON_BLOCKING_KEEP |
| TITANE_CONVERSATION_TIMEOUT_SECS | Dead env var labelled [DEAD] in harness scripts (Sessions 5) | NON_BLOCKING_KEEP |
| docs/90_release/ has no PRODUCTION_RELEASE_v28.6.0.md | v28.5.0 doc present, v28.6.0 seal is in root RELEASE_v28.6.0_SEALED.txt | SHOULD_FIX_NEXT_CYCLE |
| docs/README.md v28.5.0 refs in arch/modules descriptions | Module stack descriptions still reference v28.5.0 context (cosmetic, not version authority) | NON_BLOCKING_DOC_ONLY |

**BLOCKING_POST_PROD**: None found.
