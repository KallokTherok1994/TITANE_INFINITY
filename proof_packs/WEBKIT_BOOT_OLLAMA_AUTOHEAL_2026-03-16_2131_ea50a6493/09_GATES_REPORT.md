# GATES REPORT

| Gate | Status | Evidence |
|------|--------|----------|
| G_BOOT_TRUTH | PASS | boot_marker_log() ignores non-main ENTRY_ markers (runtime_config.rs:121). FIX-1 ensures avatar-floating mounts stub only. |
| G_SINGLE_BOOT_SEQUENCE | QUALIFIED | FIX-1 applied — avatar-floating now mounts stub. Pending tauri dev smoke test. |
| G_NO_DUPLICATE_OLLAMA_PROBES | QUALIFIED | FIX-1+2 applied — singleton + window guard. Pending tauri dev smoke. |
| G_PROVIDER_TRUTH | QUALIFIED | FIX-3: 5s retry vs 45s during 30s warmup. Pending runtime validation. |
| G_NO_LYING_FALLBACK | PASS | titaneLocalProvider returns fallbackUsed:true, no silent lie. |
| G_WEBKIT_CRASH_CAPTURED_OR_MITIGATED | QUALIFIED | FIX-1 prevents full React in avatar-floating. Partial mitigation. |
| G_SAFE_MODE_AVAILABLE | PASS | scheduleBootWatchdog() + BOOT_WATCHDOG_20S overlay (main.tsx:694-838). |
| G_VERIFY_OR_ROLLBACK_ACTIVE | PASS | Rollback: git restore -- src/main.tsx src/services/ai/providers/ollama.ts |
| G_TESTS_X3 | BLOCKED | 3 pre-existing failures in conversationEngine.test.ts (unrelated). Build PASS. |
| G_BUILD_X3 | PASS | pnpm build exits 0 (Node v22). |
| G_E2E_X3 | BLOCKED_E2E | Requires Tauri AppImage + tauri-driver + TITANE_E2E_AUTHORIZED=1. |
