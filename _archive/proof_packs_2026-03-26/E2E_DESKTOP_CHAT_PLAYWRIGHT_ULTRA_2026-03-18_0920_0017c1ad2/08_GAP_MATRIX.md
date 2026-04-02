# GAP_MATRIX

| Surface/Capability | Classification | Evidence |
|---|---|---|
| Router and major pages visible | PROVEN_VISIBLE_ONLY | App.tsx route map + discovery |
| Playwright discovery scope governance | PROVEN_RUNTIME | playwright test --list pre/post fix |
| tests/e2e inclusion in Playwright | PROVEN_RUNTIME | project chromium-tests-e2e now discovered |
| Desktop target identity | PROVEN_RUNTIME | reports/e2e-desktop/tauri-wrapper.log |
| Chat submit runtime proof | UI_ONLY | tests/e2e/chat.spec.ts x3 fail |
| Provider runtime truth | PARTIAL_CHAIN | code chain mapped, no passing runtime lane in this pass |
| Memory/history runtime truth | PARTIAL_CHAIN | chain mapped, not runtime-certified this pass |
| Anti-lie transversal assertions | UNKNOWN | no dedicated anti-lie test lane added in this pass |
| Browser pass as desktop pass confusion | STALE_TARGET_RISK mitigated | explicit desktop and browser lanes separated |
