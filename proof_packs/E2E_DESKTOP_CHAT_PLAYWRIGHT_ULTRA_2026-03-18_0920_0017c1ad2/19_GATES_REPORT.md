# GATES_REPORT

| Gate | Status | Proof |
|---|---|---|
| G_BOOT_TRUTH | PASS | 01_BOOTSTRAP.md |
| G_DISCOVERY_TRUTH | PASS | 03_TEST_STACK_DISCOVERY.md + 04/05/06 maps |
| G_ROUTE_REACHABILITY | BLOCKED | route inventory static; no full traversal pass run in this session |
| G_SURFACE_MAP_COMPLETE | PASS | 04_UI_SURFACE_MAP.md |
| G_CHAT_MAP_COMPLETE | PASS | 05_CHAT_CAPABILITY_MAP.md |
| G_PLAYWRIGHT_CONFIG_GOVERNED | PASS | playwright.config.ts diff + 20_DIFF_FILES.md |
| G_PLAYWRIGHT_PROJECTS_DEFINED | PASS | 09_PLAYWRIGHT_PROJECT_MATRIX.md |
| G_A11Y_LOCATOR_STABILITY | FAIL | 15_PLAYWRIGHT_X3.log (legacy brittle selectors fail) |
| G_RUNTIME_CHAIN_TRUTH | BLOCKED | no passing browser chat runtime chain in this run |
| G_CHAT_RUNTIME_TRUTH | FAIL | 15_PLAYWRIGHT_X3.log (3/3 deterministic failures) |
| G_ANTI_LIE_ACTIVE | BLOCKED | no dedicated anti-lie assertions added in this pass |
| G_IPC_CHAIN_TRUTH | PASS | 16_DESKTOP_E2E_X3.log + wrapper logs show tauri-driver and binary run |
| G_PROVIDER_TRUTH | BLOCKED | provider chain not runtime-certified this pass |
| G_MEMORY_OR_HISTORY_TRUTH | BLOCKED | memory/history runtime lane not executed in this pass |
| G_DESKTOP_TARGET_TRUTH | PASS | 07_TARGET_AUTHORITY_MAP.md + reports/e2e-desktop/tauri-wrapper.log |
| G_NO_DEV_SERVER_CONFUSION | PASS | tauri-wrapper.log shows TAURI_DEV_SERVER_URL=<unset> |
| G_NO_SKIP_TESTS | PASS | no skip flags used in x3 commands |
| G_TRACE_EVIDENCE_READY | PASS | 12_PLAYWRIGHT_TRACE_INDEX.md + 17_TRACES_INDEX.md |
| G_SCREENSHOT_SUPPORT_READY | PASS | 18_SCREENSHOTS_INDEX.md |
| G_STALE_TARGET_GUARD | PASS | wrapper enforces binary path disclosure |
| G_STALE_ARTIFACT_GUARD | PASS | wrapper logs selected runtime binary on each run |
| G_TESTS_X3 | PASS | 14_TESTS_X3.log |
| G_PLAYWRIGHT_X3 | FAIL | 15_PLAYWRIGHT_X3.log |
| G_DESKTOP_E2E_X3 | PASS | 16_DESKTOP_E2E_X3.log |
| G_ROLLBACK_READY | PASS | 21_ROLLBACK.md |

Verdict contribution:
- Harness/config governance improved and proven.
- Product chat lane remains unproven/failed.
