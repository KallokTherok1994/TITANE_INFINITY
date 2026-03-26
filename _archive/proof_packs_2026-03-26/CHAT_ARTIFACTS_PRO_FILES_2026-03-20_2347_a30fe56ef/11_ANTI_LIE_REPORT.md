# 11_ANTI_LIE_REPORT
Detected anti-lie risks and treatment:
1) Risk: export success implied without save truth contract.
- surface: chat conversation export helpers
- rupture: void return + blind browser download path
- classification: SAVE_CHAIN_BROKEN (pre-patch)
- minimal fix: explicit ExportSaveResult + Tauri save/write path + honest statuses
- rollback: git restore changed export files + ConversationSection handlers

2) Risk: desktop-native claim with browser-only fallback path.
- surface: same
- classification: FORMAT_TRUE_QUALITY_FALSE / SAVE_CHAIN_BROKEN (pre-patch)
- state after patch: downgraded to PARTIAL_CHAIN with explicit status labels.
