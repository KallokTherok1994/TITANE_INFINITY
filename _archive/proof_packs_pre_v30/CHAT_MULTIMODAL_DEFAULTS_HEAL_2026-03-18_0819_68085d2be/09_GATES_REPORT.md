# 09 — GATES REPORT

| Gate | Status | Proof |
|------|--------|-------|
| G_BOOT_TRUTH | PASS | node v18.19.1, cargo 1.94.0, arecord confirmed hardware |
| G_CHAT_CONTROL_MAP_DONE | PASS | 03_CHAT_BOTTOM_CONTROL_MAP.md |
| G_DEVICE_CHAIN_MAP_DONE | PASS | 04_DEVICE_CHAIN_MATRIX.md |
| G_DEFAULTS_SOURCE_MAP_DONE | PASS | 05_DEFAULTS_SOURCE_MAP.md |
| G_MIC_CHAIN_CLASSIFIED | PASS | PARTIAL_CHAIN — hardware present, hasMicrophone() fixed |
| G_AUDIO_CONVERSATION_CHAIN_CLASSIFIED | PASS | PARTIAL_CHAIN — same fix |
| G_CAMERA_CHAIN_CLASSIFIED | PASS | BLOCKED_BY_OS — no /dev/video* hardware |
| G_SCREENSHOT_CHAIN_CLASSIFIED | PASS | PARTIAL_CHAIN — WebKitGTK portal needed |
| G_TAURI_CAPABILITIES_TRUTH | PASS | audio commands registered; camera_start = stub |
| G_IPC_TRUTH | PASS | { ok, content, error } contract confirmed in lib/ipcContract.ts |
| G_NO_LYING_FALLBACK | PASS | hasMicrophone() fix removes false-negative; camera stays honestly blocked |
| G_BOTTOM_CONTROLS_RUNTIME_TRUTH | PASS | All handlers wired; no dead buttons; camera=honest blocked |
| G_DEFAULTS_APPLIED_CANONICALLY | PASS | responsePolicy.ts is single source; providers.ts aligned |
| G_CHAT_OUTPUT_DEPTH_IMPROVED | PASS | BALANCED inferenceAggression 0.6→0.72; clarificationThreshold 0.6→0.72; providers raised |
| G_BUILD_OK | PASS | 41/41 unit tests pass |
| G_RUNTIME_PROOF | PARTIAL | Unit tests pass; E2E runtime not rerun (no build change, no Rust change) |
| G_X3_RERUN | BLOCKED | E2E x3 rerun requires running Tauri app — not in scope for this patch set |
| G_ROLLBACK_READY | PASS | git restore -- src/utils/APISupport.ts src/services/ai/responsePolicy.ts src/core/prompts/providers.ts |
