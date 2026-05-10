# UI_DESKTOP_PENDING_MARKER_AUDIT_v66

Mission: TITANE UI_DESKTOP_POST_SEAL_HYGIENE_CI_RELEASE_READINESS_v66  
Date: 2026-05-10

## Scope

- Input command: rg -n "PENDING|PENDING_GATE_O|PENDING_WDIO_RUN|runtime-filled|runtime fill|TODO v65|BLOCKED_MISSING|UNKNOWN" docs artifacts e2e scripts package.json
- Total hits: 910

## Audit table (every hit)

| file | line | meaning | current status | action |
|---|---:|---|---|---|
| scripts/map_refresh.sh | 41 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/05_FAMILY_LEDGER.md | 9 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/05_FAMILY_LEDGER.md | 35 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/05_FAMILY_LEDGER.md | 36 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/05_FAMILY_LEDGER.md | 40 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/05_FAMILY_LEDGER.md | 42 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/05_FAMILY_LEDGER.md | 43 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/05_FAMILY_LEDGER.md | 47 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/05_FAMILY_LEDGER.md | 59 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/chat-provider-decision-certification-structural.spec.ts | 53 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/chat-provider-decision-certification-structural.spec.ts | 128 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/chat-provider-decision-certification-structural.spec.ts | 129 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/12_DOC_RUNTIME_DRIFT.md | 12 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/12_DOC_RUNTIME_DRIFT.md | 17 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/critical/generated-files-download.spec.ts | 8 | domain workflow status constant | active business-state literal | KEEP_HISTORICAL_CONTEXT |
| e2e/critical/generated-files-download.spec.ts | 26 | domain workflow status constant | active business-state literal | KEEP_HISTORICAL_CONTEXT |
| e2e/critical/generated-files-download.spec.ts | 38 | domain workflow status constant | active business-state literal | KEEP_HISTORICAL_CONTEXT |
| e2e/critical/generated-files-download.spec.ts | 46 | domain workflow status constant | active business-state literal | KEEP_HISTORICAL_CONTEXT |
| e2e/critical/generated-files-download.spec.ts | 130 | domain workflow status constant | active business-state literal | KEEP_HISTORICAL_CONTEXT |
| e2e/critical/generated-files-download.spec.ts | 132 | domain workflow status constant | active business-state literal | KEEP_HISTORICAL_CONTEXT |
| e2e/critical/generated-files-download.spec.ts | 137 | domain workflow status constant | active business-state literal | KEEP_HISTORICAL_CONTEXT |
| e2e/critical/generated-files-download.spec.ts | 147 | domain workflow status constant | active business-state literal | KEEP_HISTORICAL_CONTEXT |
| e2e/critical/generated-files-download.spec.ts | 167 | domain workflow status constant | active business-state literal | KEEP_HISTORICAL_CONTEXT |
| e2e/chat-provider-decision-certification.spec.ts | 70 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/chat-provider-decision-certification.spec.ts | 143 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/chat-provider-decision-certification.spec.ts | 322 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/chat-provider-decision-certification.spec.ts | 416 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/chat-provider-decision-certification.spec.ts | 417 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/chat-orchestrator-advanced-stress.wdio.test.js | 68 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/online-chat-proof.wdio.test.js | 296 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/online-chat-proof.wdio.test.js | 299 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/online-chat-proof.wdio.test.js | 300 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/online-chat-proof.wdio.test.js | 313 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-v63-real-ipc-research.wdio.test.js | 105 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-v63-real-ipc-research.wdio.test.js | 111 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-sandbox.wdio.test.js | 68 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-sandbox.wdio.test.js | 77 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-sandbox.wdio.test.js | 102 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-sandbox.wdio.test.js | 148 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-sandbox.wdio.test.js | 176 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-v63-real-ipc-cloud.wdio.test.js | 105 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-v63-real-ipc-cloud.wdio.test.js | 111 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js | 28 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js | 44 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js | 45 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js | 49 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js | 50 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js | 51 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js | 52 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js | 53 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js | 54 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js | 66 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v24_visible_real_ui_fullstack_perfection.wdio.test.js | 806 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-chat-360-autofix.wdio.test.cjs | 1249 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-chat-360-autofix.wdio.test.cjs | 1400 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/chat-ui-complete-runtime.wdio.test.js | 511 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/dev/LOCAL_AI_SURFACES_AUTHORITY.md | 47 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/chat-ia-complete-simulation.wdio.test.cjs | 66 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/search-prod-model-compliance.wdio.test.js | 95 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v22_visible_real_ui_cert.wdio.test.js | 28 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v22_visible_real_ui_cert.wdio.test.js | 47 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v22_visible_real_ui_cert.wdio.test.js | 48 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v22_visible_real_ui_cert.wdio.test.js | 49 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v22_visible_real_ui_cert.wdio.test.js | 50 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v22_visible_real_ui_cert.wdio.test.js | 51 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v22_visible_real_ui_cert.wdio.test.js | 52 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v22_visible_real_ui_cert.wdio.test.js | 61 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-agent-chat.wdio.test.js | 53 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-agent-chat.wdio.test.js | 62 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-agent-chat.wdio.test.js | 71 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-agent-chat.wdio.test.js | 86 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-agent-chat.wdio.test.js | 120 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/registry/UI_VΩ_EVENT_ACCESSIBILITE.md | 306 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-core.wdio.test.js | 59 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-core.wdio.test.js | 60 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-core.wdio.test.js | 68 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-core.wdio.test.js | 92 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-core.wdio.test.js | 100 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-core.wdio.test.js | 141 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-core.wdio.test.js | 148 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-core.wdio.test.js | 173 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-core.wdio.test.js | 181 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-core.wdio.test.js | 199 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-core.wdio.test.js | 219 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-ipc-response-reflection-agent-chat.wdio.test.js | 52 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-v63-tier1-regression.wdio.test.js | 110 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-v63-tier1-regression.wdio.test.js | 117 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-utility.wdio.test.js | 36 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-utility.wdio.test.js | 50 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-utility.wdio.test.js | 64 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-utility.wdio.test.js | 78 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-utility.wdio.test.js | 92 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-utility.wdio.test.js | 106 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-admin-dev.wdio.test.js | 76 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-admin-dev.wdio.test.js | 83 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-admin-dev.wdio.test.js | 110 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-admin-dev.wdio.test.js | 123 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-backend-proof-depth-admin-dev.wdio.test.js | 141 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-v62-real-ipc-experience.wdio.test.js | 83 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-v62-real-ipc-experience.wdio.test.js | 89 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-v62-real-ipc-cloud.wdio.test.js | 84 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-v62-real-ipc-cloud.wdio.test.js | 90 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js | 30 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v25_visible_real_chat_functional_truth.wdio.test.js | 31 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/certification/lib_cert.sh | 274 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/online-chat-proof-ui.wdio.test.js | 1302 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/certification/run-master-chat-to-prod.sh | 88 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/certification/run-master-chat-to-prod.sh | 248 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/certification/run-master-chat-to-prod.sh | 263 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/certification/run-master-chat-to-prod.sh | 286 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/certification/run-master-chat-to-prod.sh | 312 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/17_PATCH_SEMANTICS_MATRIX.md | 24 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/17_PATCH_SEMANTICS_MATRIX.md | 27 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v26_real_online_chat_truth.wdio.test.js | 37 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/v26_real_online_chat_truth.wdio.test.js | 38 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-v62-real-ipc-agent-chat.wdio.test.js | 83 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/ui-desktop-v62-real-ipc-agent-chat.wdio.test.js | 91 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| artifacts/run1/v30_three_truth_verdict.json | 15 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/helpers/uiDesktopBackendProofDepth.js | 182 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/helpers/uiDesktopBackendProofDepth.js | 492 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/helpers/uiDesktopBackendProofDepth.js | 569 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| e2e/desktop/chat-qa-mode-validation.wdio.test.cjs | 68 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/research/RESEARCH_TRUTH_POLICY.md | 88 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/research/RESEARCH_TRUTH_ENGINE_CONTRACT.md | 54 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/V26_UI_IMPLEMENTATION.md | 19 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/V26_UI_IMPLEMENTATION.md | 169 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/V26_UI_IMPLEMENTATION.md | 183 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/V26_UI_IMPLEMENTATION.md | 667 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/V26_UI_IMPLEMENTATION.md | 677 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/V26_UI_IMPLEMENTATION.md | 684 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/V26_UI_IMPLEMENTATION.md | 710 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/V26_UI_IMPLEMENTATION.md | 756 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/day1_launch.sh | 164 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/day1_launch.sh | 171 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/day1_launch.sh | 178 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/day1_launch.sh | 185 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/day1_launch.sh | 192 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/day1_launch.sh | 199 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/backend/AUDIT_SUMMARY.md | 281 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/backend/AUDIT_SUMMARY.md | 287 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/backend/DOCUMENTATION_COMPLETE.md | 107 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/backend/DOCUMENTATION_COMPLETE.md | 114 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/registry/UI_VΩ_EVENT_MODE_DEGRADE.md | 321 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/backend/IPC_CONTRACT.md | 249 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/backend/IPC_CONTRACT.md | 254 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/e2e/run-ui-chat-360-autofix.cjs | 413 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/api/enums/types.FailureClass.html | 11 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/api/enums/types.FailureClass.html | 12 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/93_conversation/CHAT_MEM_AUDIT.md | 68 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/e2e/MIGRATION_PLAYWRIGHT_TO_WEBDRIVER.md | 481 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/e2e/WEBDRIVER_MIGRATION_STATUS.md | 283 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/e2e/WEBDRIVER_MIGRATION_STATUS.md | 284 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/93_conversation/CHAT_MEM_DISCOVERY.md | 468 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/93_conversation/CHAT_MEM_DISCOVERY.md | 469 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/93_conversation/CHAT_MEM_DISCOVERY.md | 470 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/93_conversation/CONVERSATION_INTELLIGENCE_CORE_COMPLETE_v1.0.md | 31 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/93_conversation/CONVERSATION_INTELLIGENCE_CORE_COMPLETE_v1.0.md | 64 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/93_conversation/CONVERSATION_INTELLIGENCE_CORE_COMPLETE_v1.0.md | 95 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/93_conversation/CONVERSATION_INTELLIGENCE_CORE_COMPLETE_v1.0.md | 158 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 4 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 6 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 35 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 36 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 37 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 38 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 39 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 40 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 41 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 47 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 48 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 49 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 61 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 62 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 63 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 87 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 88 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 89 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 90 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 91 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 92 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 98 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 99 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 103 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_RELEASE_v30.0.0.md | 104 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/diagnostic/capture-ui-version-truth.sh | 98 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/diagnostic/capture-ui-version-truth.sh | 103 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/run_final.sh | 215 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/run_final.sh | 216 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/run_final.sh | 217 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/run_final.sh | 245 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/governance/constitutional-audit.sh | 207 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/CHANGELOG_v27.1.0.md | 143 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/CHANGELOG_v27.1.0.md | 255 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/DEPLOYMENT_REPORT_v27.0.2.md | 259 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/generate/generate-ui-surface-docs.mjs | 150 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/generate/generate-ui-desktop-manifest.mjs | 404 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/generate/generate-ui-desktop-manifest.mjs | 413 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/generate/generate-ui-desktop-manifest.mjs | 419 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/generate/generate-ui-desktop-manifest.mjs | 420 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/generate/generate-ui-desktop-manifest.mjs | 421 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/generate/generate-ui-desktop-manifest.mjs | 422 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/generate/generate-ui-desktop-manifest.mjs | 423 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/PRODUCTION_SEAL_v27.4.1.md | 168 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/DEPLOYMENT_PLAN_v26.4.0_HYBRID.md | 205 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/DEPLOYMENT_PLAN_v26.4.0_HYBRID.md | 206 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/DEPLOYMENT_PLAN_v26.4.0_HYBRID.md | 207 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/DEPLOYMENT_PLAN_v26.4.0_HYBRID.md | 208 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/DEPLOYMENT_PLAN_v26.4.0_HYBRID.md | 209 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/DEPLOYMENT_PLAN_v26.4.0_HYBRID.md | 210 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/DEPLOYMENT_PLAN_v26.4.0_HYBRID.md | 211 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/AUDIT_UPDATE_2026-01-10.md | 59 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/AUDIT_UPDATE_2026-01-10.md | 75 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/AUDIT_UPDATE_2026-01-10.md | 84 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/AUDIT_UPDATE_2026-01-10.md | 89 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/tests/auto-fix-tests.sh | 46 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/tests/auto-fix-tests.sh | 194 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/gates/f2-rc-gates-x3.sh | 45 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/gates/f2-rc-gates-x3.sh | 105 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/PHASE_4_SPRINT_3_EXECUTIVE_SUMMARY.md | 180 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/PHASE_4_SPRINT_3_EXECUTIVE_SUMMARY.md | 181 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/PHASE_4_SPRINT_3_EXECUTIVE_SUMMARY.md | 182 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/AUDIT_SUMMARY.md | 144 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/90_release/DEPLOYMENT_v27.2.0_STATUS.md | 80 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/REPORT_PROD_FINAL.md | 159 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/REPORT_PROD_FINAL.md | 165 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/REPORT_PROD_FINAL.md | 171 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/REPORT_PROD_FINAL.md | 177 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/REPORT_PROD_FINAL.md | 183 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/REPORT_PROD_FINAL.md | 189 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/verify/verify-ui-desktop-main-menu-reconciliation.mjs | 113 | semantic/test marker retained for traceability | mission-core context | KEEP_HISTORICAL_CONTEXT |
| scripts/verify/verify-ui-desktop-main-menu-reconciliation.mjs | 125 | semantic/test marker retained for traceability | mission-core context | KEEP_HISTORICAL_CONTEXT |
| scripts/verify/verify-ui-desktop-main-menu-reconciliation.mjs | 126 | semantic/test marker retained for traceability | mission-core context | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/AUDIT_STRUCTURE_vOmega.md | 28 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/AUDIT_STRUCTURE_vOmega.md | 29 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/AUDIT_STRUCTURE_vOmega.md | 30 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/AUDIT_STRUCTURE_vOmega.md | 31 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/AUDIT_STRUCTURE_vOmega.md | 32 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/AUDIT_STRUCTURE_vOmega.md | 33 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/AUDIT_STRUCTURE_vOmega.md | 34 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/AUDIT_STRUCTURE_vOmega.md | 67 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/verify/verify-backend-proof-depth.mjs | 92 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/verify/verify_agent_effectiveness_scorecard.sh | 63 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/qa/select_failed_commands.mjs | 38 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/qa/select_failed_commands.mjs | 39 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/agents/AGENT_EFFECTIVENESS_POLICY.md | 22 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/agents/AGENT_EFFECTIVENESS_POLICY.md | 129 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/PHASE4_ALWAYS_RESPOND.md | 365 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/PHASE_4_SPRINT_3_RELEASE_READINESS.md | 149 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/91_reports/AUDIT_TESTS_COMPLET_2026-01-26.md | 67 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/autoheal/autoheal_rules.jsonl | 378 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/autoheal/autoheal_rules.jsonl | 402 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/autoheal/autoheal_rules.jsonl | 769 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/autoheal/autoheal_rules.jsonl | 1483 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/autoheal/autoheal_rules.jsonl | 1517 | domain workflow status constant | active business-state literal | KEEP_HISTORICAL_CONTEXT |
| scripts/autoheal/autoheal_rules.jsonl | 1518 | domain workflow status constant | active business-state literal | KEEP_HISTORICAL_CONTEXT |
| scripts/autoheal/autoheal_rules.jsonl | 1527 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/autoheal/autoheal_rules.jsonl | 1767 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/autoheal/autoheal_rules.jsonl | 1776 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| scripts/autoheal/autoheal_rules.jsonl | 1791 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/autoheal/autoheal_rules.jsonl | 1802 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/diagnostics/IPC_STABLE_UPGRADE_SEAL.md | 332 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/diagnostics/IPC_STABLE_SEAL.md | 93 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/diagnostics/IPC_CONTRACT_REPORT.md | 130 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/diagnostics/CHAT_RUNTIME_IPC_ARGS_FIX_REPORT.md | 33 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/diagnostics/CHAT_RUNTIME_IPC_ARGS_FIX_REPORT.md | 34 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/diagnostics/CHAT_RUNTIME_IPC_ARGS_FIX_REPORT.md | 35 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| scripts/test/test_singularity_logs.py | 152 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/_evidence/program_autoheal_ah_20260226_215033/01_TRUTH_CHECK_PREVIOUS.md | 11 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/21_DEPENDENCY_TRUTH_MATRIX.md | 73 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/CONSOLIDATED_AUTHORITY_STATE.md | 46 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/CONSOLIDATED_AUTHORITY_STATE.md | 49 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/UNKNOWN_REDUCTION_PLAN.md | 1 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/UNKNOWN_REDUCTION_PLAN.md | 2 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/UNKNOWN_REDUCTION_PLAN.md | 8 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/UNKNOWN_REDUCTION_PLAN.md | 14 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/UNKNOWN_REDUCTION_PLAN.md | 18 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/UNKNOWN_REDUCTION_PLAN.md | 47 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/UNKNOWN_REDUCTION_PLAN.md | 59 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/UNKNOWN_REDUCTION_PLAN.md | 68 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/UNKNOWN_REDUCTION_PLAN.md | 70 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/VALIDATION_CERTIFICATION_BASELINE.md | 25 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/VALIDATION_CERTIFICATION_BASELINE.md | 29 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/VALIDATION_CERTIFICATION_BASELINE.md | 37 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/_evidence/csp-unsafe-inline-rationale.md | 32 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/MOVE_PLAN.md | 34 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/MOVE_PLAN.md | 35 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/MOVE_PLAN.md | 36 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/TEST_AUTHORITY_MAP.md | 127 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/architecture/TEST_AUTHORITY_MAP.md | 145 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui-carto-copilot/VERIFICATION/SEAL_PRODUCTION_BLOCKED.md | 118 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui-carto-copilot/VERIFICATION/SEAL_PRODUCTION_BLOCKED.md | 320 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui-carto-copilot/09_MANIFEST.json | 467 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/08_CLAIM_OVERREACH_MATRIX.md | 17 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/08_CLAIM_OVERREACH_MATRIX.md | 19 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/08_CLAIM_OVERREACH_MATRIX.md | 20 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/MAP_INDEX.md | 30 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/MAP_INDEX.md | 32 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/MAP_INDEX.md | 50 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/11_PROOF_PACK_INDEX.md | 14 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/11_PROOF_PACK_INDEX.md | 15 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/11_PROOF_PACK_INDEX.md | 16 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_architecture/NETWORK_DIAGNOSTIC_ENGINE_4RING.md | 17 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/P2_SYNC_FASTFS_TO_MAIN.md | 107 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/20_GITHUB_NATIVE_SECURITY_MATRIX.md | 15 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/20_GITHUB_NATIVE_SECURITY_MATRIX.md | 41 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/20_GITHUB_NATIVE_SECURITY_MATRIX.md | 55 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/20_GITHUB_NATIVE_SECURITY_MATRIX.md | 62 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/20_GITHUB_NATIVE_SECURITY_MATRIX.md | 76 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/20_GITHUB_NATIVE_SECURITY_MATRIX.md | 152 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/20_GITHUB_NATIVE_SECURITY_MATRIX.md | 154 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/20_GITHUB_NATIVE_SECURITY_MATRIX.md | 180 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md | 161 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md | 179 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md | 215 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md | 218 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md | 230 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md | 278 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md | 383 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/AUDIT_FINAL_v26.2.1.md | 123 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/AUDIT_FINAL_v26.2.1.md | 292 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/sealed-releases/v27.0.3/GATE_SUMMARY.txt | 10 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/sealed-releases/v27.0.3/VERDICT.md | 22 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/P1_IMPLEMENTATION_REPORT_2026-01-07.md | 364 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/P1_IMPLEMENTATION_REPORT_2026-01-07.md | 365 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ops/CLAUDE_CODE_NEXT_READINESS.md | 27 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ops/MAIN_OPTIMIZATION_2026-03-26.md | 86 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/24_ACTIONS_HARDENING_MATRIX.md | 197 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/14_DELETE_DISCIPLINE_MATRIX.md | 37 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/14_DELETE_DISCIPLINE_MATRIX.md | 38 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/26_GITHUB_CONTROL_PLANE_TRUTH_GAP.md | 11 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/26_GITHUB_CONTROL_PLANE_TRUTH_GAP.md | 23 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/26_GITHUB_CONTROL_PLANE_TRUTH_GAP.md | 24 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/26_GITHUB_CONTROL_PLANE_TRUTH_GAP.md | 25 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/26_GITHUB_CONTROL_PLANE_TRUTH_GAP.md | 28 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/26_GITHUB_CONTROL_PLANE_TRUTH_GAP.md | 29 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/26_GITHUB_CONTROL_PLANE_TRUTH_GAP.md | 50 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/26_GITHUB_CONTROL_PLANE_TRUTH_GAP.md | 52 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/26_GITHUB_CONTROL_PLANE_TRUTH_GAP.md | 53 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/plans/phase_preparation_20260309/ROADMAP_CANONICAL.md | 19 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/plans/phase_preparation_20260309/ROADMAP_CANONICAL.md | 20 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/plans/phase_preparation_20260309/ROADMAP_CANONICAL.md | 112 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 19 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 20 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 21 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 22 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 23 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 36 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 37 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 38 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 39 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 40 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 53 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 54 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 55 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 56 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 69 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 70 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 71 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 253 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 255 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/V27_SPRINT_TRACKING_DASHBOARD.md | 256 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/DAY1_ACTIVATION_SUMMARY.md | 190 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/DAY1_ACTIVATION_SUMMARY.md | 278 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/DAY1_ACTIVATION_SUMMARY.md | 279 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/DAY1_ACTIVATION_SUMMARY.md | 280 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/DAY1_ACTIVATION_SUMMARY.md | 281 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/DAY1_ACTIVATION_SUMMARY.md | 282 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/DAY1_ACTIVATION_SUMMARY.md | 283 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LOCAL_AI_ABSOLUTE_VERDICT.md | 5 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LOCAL_AI_ABSOLUTE_VERDICT.md | 28 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LOCAL_AI_ABSOLUTE_VERDICT.md | 29 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LOCAL_AI_ABSOLUTE_VERDICT.md | 45 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LOCAL_AI_ABSOLUTE_VERDICT.md | 149 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LOCAL_AI_ABSOLUTE_VERDICT.md | 185 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/AUTONOMY_AUDIT_FINAL_COMPREHENSIVE_VERDICT.md | 42 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/AUTONOMY_AUDIT_FINAL_COMPREHENSIVE_VERDICT.md | 158 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/AUTONOMY_AUDIT_FINAL_COMPREHENSIVE_VERDICT.md | 212 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/AUTONOMY_AUDIT_FINAL_COMPREHENSIVE_VERDICT.md | 278 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/AUTONOMY_AUDIT_FINAL_COMPREHENSIVE_VERDICT.md | 411 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/AUTONOMY_AUDIT_FINAL_COMPREHENSIVE_VERDICT.md | 412 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/cognitive/MEMORY_RETRIEVAL_MATRIX.md | 11 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/governance/UI_RUNTIME_TRUTH_SPEC.md | 19 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/governance/UI_RUNTIME_TRUTH_SPEC.md | 40 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/governance/PROVENANCE_LINEAGE_SPEC.md | 129 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/governance/PROVENANCE_LINEAGE_SPEC.md | 130 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/governance/AUTHORITY_MATRIX.md | 10 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/governance/RUNTIME_SESSION_STABILITY_SPEC.md | 23 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PIVOT_SUCCESS_REPORT.md | 183 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PIVOT_SUCCESS_REPORT.md | 225 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/governance/PROVIDER_RUNTIME_STABILITY_SPEC.md | 38 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/canon/MEMORY_TRIAGE_INDEX.md | 51 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/SPRINT_6_AUDIT_COMPLETION_SUMMARY.md | 254 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/10_NON_SEALED_FAMILY_MATRIX.md | 13 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/10_NON_SEALED_FAMILY_MATRIX.md | 14 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/10_NON_SEALED_FAMILY_MATRIX.md | 15 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/10_NON_SEALED_FAMILY_MATRIX.md | 17 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/10_NON_SEALED_FAMILY_MATRIX.md | 18 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/governance/LTM_RUNTIME_QUALIFICATION_SPEC.md | 38 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/proof/OLLAMA_PROXY_SEAL.md | 246 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/governance/MEMORY_SEAL_SPEC.md | 23 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/governance/MEMORY_SEAL_SPEC.md | 24 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/governance/MEMORY_SEAL_SPEC.md | 43 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/governance/EXECUTION_GUARDRAILS.md | 76 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/governance/SBOM_PROVENANCE_SPEC.md | 137 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/governance/SBOM_PROVENANCE_SPEC.md | 138 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/proof/ollama_abort_normalization/MAP.md | 108 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/PROVIDER_REASON_CODES.md | 25 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/proof/OLLAMA_PROXY_FINAL_OUTPUT.md | 69 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/proof/OLLAMA_PROXY_FINAL_OUTPUT.md | 70 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/proof/OLLAMA_PROXY_FINAL_OUTPUT.md | 71 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/proof/OLLAMA_PROXY_FINAL_OUTPUT.md | 72 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/proof/OLLAMA_PROXY_FINAL_OUTPUT.md | 148 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/proof/OLLAMA_PROXY_FINAL_OUTPUT.md | 149 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/proof/OLLAMA_PROXY_FINAL_OUTPUT.md | 150 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/05_NON_COMPLIANCE_REPORT.md | 31 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/00_core/DOCS_CLASSIFICATION_RULES.md | 23 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/00_core/DOCS_CLASSIFICATION_RULES.md | 25 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/baselines/V24_PHASE1_COMPLETE.md | 197 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/baselines/V24_FINAL_ACTION_BOARD.md | 30 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/15_GLOBAL_VERDICT_MONOTONICITY.md | 22 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/15_GLOBAL_VERDICT_MONOTONICITY.md | 23 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/15_GLOBAL_VERDICT_MONOTONICITY.md | 25 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/15_GLOBAL_VERDICT_MONOTONICITY.md | 47 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 17 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 23 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 24 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 64 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 65 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 90 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 99 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 105 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 106 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 116 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 118 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 119 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 120 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 121 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 122 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 123 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 124 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 125 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 145 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 146 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 147 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROGRAM_END_DISCOVERY.md | 148 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/baselines/CORE_ENGINE_TRACK_STATUS_V23.md | 298 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/baselines/CORE_ENGINE_TRACK_STATUS_V23.md | 299 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/baselines/CORE_ENGINE_TRACK_STATUS_V23.md | 300 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BRANCH_MERGE_COMPLETION.md | 187 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BRANCH_MERGE_COMPLETION.md | 371 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ai/PROVIDERS_INVENTORY.md | 402 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/13_UI_RUNTIME_TRUTH_GAPS.md | 42 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ai/UNIFIED_PROVIDERS_ARCH.md | 673 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/COMMAND_DASHBOARD_STATE_SUMMARY.md | 238 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/SESSION_COMPLETION_REPORT.md | 175 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PATCH.md | 3 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/api/types/types.ReasonCode.html | 1 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/APPROVAL_REQUEST_KEVIN_v27_SPRINT.md | 264 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/roadmap/C3_INGRESS_AUDIT.md | 37 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/roadmap/Z0_POST_SEAL_INGRESS_AUDIT.md | 68 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/HANDOFF_v27.2.0_DEPLOYMENT_READY.md | 261 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/92_maintenance/inventaire_fichiers_avant.txt | 3649 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/92_maintenance/arborescence_avant.txt | 3965 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/TITANE_INFINITY_STATUS_FINAL_vOMEGA2.md | 184 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/23_RULESETS_AND_OWNERSHIP_MATRIX.md | 24 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/23_RULESETS_AND_OWNERSHIP_MATRIX.md | 25 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/23_RULESETS_AND_OWNERSHIP_MATRIX.md | 114 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/23_RULESETS_AND_OWNERSHIP_MATRIX.md | 115 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/23_RULESETS_AND_OWNERSHIP_MATRIX.md | 125 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/23_RULESETS_AND_OWNERSHIP_MATRIX.md | 130 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/FINAL_REPORT.md | 5 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/FINAL_REPORT.md | 28 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/FINAL_REPORT.md | 30 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/FINAL_REPORT.md | 32 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/FINAL_REPORT.md | 51 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/FINAL_REPORT.md | 118 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/CRITICAL_FIXES_v26.2.1.md | 114 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/CRITICAL_FIXES_v26.2.1.md | 120 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/CRITICAL_FIXES_v26.2.1.md | 124 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/CRITICAL_FIXES_v26.2.1.md | 128 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/CRITICAL_FIXES_v26.2.1.md | 273 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/RAPPORT_FINAL_v27.2.1.md | 385 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/RAPPORT_FINAL_v27.2.1.md | 475 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/SEAL_v27.0.3.md | 10 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/02_DISCOVER_RAW.md | 1263 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/RAPPORT_FINAL_SEAL.md | 430 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/DOC_AUDIT.md | 597 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/P0_IMPLEMENTATION_REPORT_2026-01-07.md | 21 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/P0_IMPLEMENTATION_REPORT_2026-01-07.md | 241 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/P0_IMPLEMENTATION_REPORT_2026-01-07.md | 242 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/MAP_TESTS_GATES.md | 12 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/25_SLSA_SSDF_MAPPING.md | 33 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/25_SLSA_SSDF_MAPPING.md | 36 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/25_SLSA_SSDF_MAPPING.md | 68 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/25_SLSA_SSDF_MAPPING.md | 132 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/SECURITY_FIX_SESSION_REPORT.md | 19 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/SECURITY_FIX_SESSION_REPORT.md | 20 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/SECURITY_FIX_SESSION_REPORT.md | 270 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/SECURITY_FIX_SESSION_REPORT.md | 272 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/SECURITY_FIX_SESSION_REPORT.md | 273 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/SECURITY_FIX_SESSION_REPORT.md | 274 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/SECURITY_FIX_SESSION_REPORT.md | 275 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/UNBLOCK_STEP_5_RUNNER_UPDATE.md | 3 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/UNBLOCK_STEP_5_RUNNER_UPDATE.md | 4 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/GATE_E2E_PASS.md | 150 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/WEEK1_EXECUTION_REPORT.md | 263 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/E2E_RECOVERY_SUCCESS.md | 20 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/E2E_RECOVERY_SUCCESS.md | 38 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/E2E_RECOVERY_SUCCESS.md | 39 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/E2E_RECOVERY_SUCCESS.md | 191 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/VERDICT__deployment_latest_certification_phase7_P7_OPS_CADENCE_20260217_174805_VERDICT.md.md | 213 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/POST_PROD_OPS_PHASE3_PLAN.md | 114 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/current/phases/completed/PHASE_1_FINAL_REPORT.md | 147 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/EPIC_REFACTOR_SESSION_v27.0.md | 233 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_v60_STARTUP_AUDIT.md | 91 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_IPC_RESPONSE_REFLECTION_v59_STARTUP_AUDIT.md | 54 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_IPC_RESPONSE_REFLECTION_v59_STARTUP_AUDIT.md | 61 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/PROOF_PACK_INDEX_v64.md | 144 | historical mission marker, now covered by runtime proof | mission-core context | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_TIER1_BLOCKER_REDUCTION_v61_STARTUP_AUDIT.md | 16 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_CERTIFICATION_v60.md | 17 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_CERTIFICATION_v60.md | 36 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_CERTIFICATION_v60.md | 38 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_CERTIFICATION_v60.md | 85 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_CERTIFICATION_v60.md | 124 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_CERTIFICATION_v60.md | 169 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_CERTIFICATION_v60.md | 174 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_STRICT_BACKEND_PROOF_GATE_CERTIFICATION_v60.md | 179 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_V64_RUNTIME_RECONCILIATION_SEAL_v65_STARTUP_AUDIT.md | 38 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_V64_RUNTIME_RECONCILIATION_SEAL_v65_STARTUP_AUDIT.md | 41 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_V64_RUNTIME_RECONCILIATION_SEAL_v65_STARTUP_AUDIT.md | 42 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_FUNCTIONAL_SUITE_FINALIZATION_CERTIFICATION_v56.md | 43 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_FUNCTIONAL_SUITE_FINALIZATION_CERTIFICATION_v56.md | 88 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_BACKEND_PROOF_DEPTH_v58_STARTUP_AUDIT.md | 105 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/SESSION_2_FINAL_STATUS.md | 252 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/E2E_RECOVERY_FINAL_SUMMARY.md | 140 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/STATUS_REPORT_SESSION_COMPLETE_v26.4.1.md | 228 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_BACKEND_ACTIVATION_REDUCTION_CERTIFICATION_v57.md | 72 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_BACKEND_ACTIVATION_REDUCTION_CERTIFICATION_v57.md | 75 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_DESKTOP_AGENT_CHAT_UNIFICATION_v49_STARTUP_AUDIT.md | 47 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/10_GATES_SUMMARY.md | 220 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_BACKEND_RUNTIME_PROOF_v48_STARTUP_AUDIT.md | 6 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_BACKEND_RUNTIME_PROMOTION_CERTIFICATION_v47.md | 38 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_BACKEND_RUNTIME_PROMOTION_CERTIFICATION_v47.md | 192 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_BACKEND_RUNTIME_PROOF_PLAN_v47.md | 4 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_BACKEND_RUNTIME_PROOF_PLAN_v47.md | 157 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/CERTIFICATION_STATUS_SUMMARY.md | 82 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/07_SCANS_RING_INTEGRITY.md | 44 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 12 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 13 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 14 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 15 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 16 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 17 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 18 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 19 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 20 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 21 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 22 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 23 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 24 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 25 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 26 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 27 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 28 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 29 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 30 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 31 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 32 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 33 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 34 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 35 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 36 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 37 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 38 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 39 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 40 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 46 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 47 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 48 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 49 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 50 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 51 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 52 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 53 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 54 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 55 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 56 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 57 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 58 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 59 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 60 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 61 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 62 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 63 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 64 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 65 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 66 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 67 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 73 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 74 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 75 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 76 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/generated/UI_DESKTOP_TEST_COVERAGE_MATRIX_v50.md | 77 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/VERDICT__deployment_latest_certification_pivot_P10_PIVOT_FRAMEWORK_STUB_20260218T212142Z_VERDICT.md.md | 21 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_BACKEND_TRUTH_CERTIFICATION_v46.md | 10 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/archive_legacy/v24/BUGFIX_REPORT_PHASE4_v24.4.0.md | 365 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/12_RELEASE_NOTES.md | 11 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_ACTION_IPC_PROOF_MATRIX_v48.md | 73 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_ACTION_IPC_PROOF_MATRIX_v48.md | 74 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 27 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 28 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 29 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 30 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 31 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 32 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 33 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 34 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 35 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 36 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 37 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 38 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 39 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 40 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 41 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 42 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 43 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 44 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 45 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 46 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 47 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 48 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_TAB_PROOF_MATRIX_v48.md | 58 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_AGENT_CHAT_BRIDGE_PROOF_MATRIX_v49.md | 67 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/runtime/UI_RUNTIME_AGENT_CHAT_BRIDGE_PROOF_MATRIX_v49.md | 98 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_BACKEND_RUNTIME_PROOF_CERTIFICATION_v48.md | 7 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_BACKEND_RUNTIME_PROOF_CERTIFICATION_v48.md | 94 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_BACKEND_RUNTIME_PROOF_CERTIFICATION_v48.md | 95 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_BACKEND_RUNTIME_PROOF_CERTIFICATION_v48.md | 121 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_BACKEND_RUNTIME_v47_COMPLETION_AUDIT.md | 6 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_BACKEND_RUNTIME_v47_COMPLETION_AUDIT.md | 64 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_BACKEND_RUNTIME_v47_COMPLETION_AUDIT.md | 75 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_DESKTOP_AGENT_CHAT_UNIFICATION_CERTIFICATION_v49.md | 15 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/UI_DESKTOP_AGENT_CHAT_UNIFICATION_CERTIFICATION_v49.md | 73 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_DEPTH_TAXONOMY_v58.md | 173 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_FUNCTIONAL_MODULE_PROOF_CERTIFICATION_v54.md | 16 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_FUNCTIONAL_MODULE_PROOF_CERTIFICATION_v54.md | 71 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_FUNCTIONAL_MODULE_PROOF_CERTIFICATION_v54.md | 112 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_ACTIVATION_TARGETS_v57.md | 56 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/super-prompts/SUPER_PROMPT_1_PHASE_2_PROGRESS.md | 16 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/super-prompts/SUPER_PROMPT_1_PHASE_2_PROGRESS.md | 17 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/super-prompts/SUPER_PROMPT_1_PHASE_2_PROGRESS.md | 18 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_TIER1_BLOCKER_REDUCTION_CERTIFICATION_v61.md | 108 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_TIER1_REAL_IPC_COMPLETION_CERTIFICATION_v63.md | 78 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_MAIN_MENU_RECONCILIATION_v64_STARTUP_AUDIT.md | 19 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_MAIN_MENU_RECONCILIATION_v64_STARTUP_AUDIT.md | 90 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_DEPTH_MODULE_MATRIX_v58.md | 60 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/UI_DESKTOP_BACKEND_PROOF_DEPTH_CERTIFICATION_v58.md | 66 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_DEPTH_BLOCKERS_v58.md | 20 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_REMOTE_CI_READINESS_v60.md | 4 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_REMOTE_CI_READINESS_v60.md | 22 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_STRICT_BACKEND_PROOF_RUNTIME_BLOCKERS_v60.md | 325 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_STRICT_BACKEND_PROOF_RUNTIME_BLOCKERS_v60.md | 348 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_FUNCTIONAL_MODULE_MATRIX_v54.md | 56 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_FUNCTIONAL_MODULE_MATRIX_v54.md | 68 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_STRICT_BACKEND_PROOF_TIER_RESULTS_v60.md | 21 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_STRICT_BACKEND_PROOF_TIER_RESULTS_v60.md | 39 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_STRICT_BACKEND_PROOF_TIER_RESULTS_v60.md | 45 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_STRICT_BACKEND_PROOF_TIER_RESULTS_v60.md | 96 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_ACTIVATION_MODULE_MATRIX_v57.md | 54 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_ACTIVATION_MODULE_MATRIX_v57.md | 56 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/GO_ALL_PHASE_EXECUTION_REPORT.md | 42 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/GO_ALL_PHASE_EXECUTION_REPORT.md | 43 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/GO_ALL_PHASE_EXECUTION_REPORT.md | 44 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/GO_ALL_PHASE_EXECUTION_REPORT.md | 267 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_REMOTE_CI_READINESS_v59.md | 61 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_FUNCTIONAL_BLOCKERS_v56.md | 9 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/13_VERDICT.md | 16 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/13_VERDICT.md | 23 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/13_VERDICT.md | 29 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_V64_PROOF_PACK_PENDING_TO_PASS_v65.md | 1 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_V64_PROOF_PACK_PENDING_TO_PASS_v65.md | 11 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_V64_PROOF_PACK_PENDING_TO_PASS_v65.md | 14 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_V64_PROOF_PACK_PENDING_TO_PASS_v65.md | 15 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_V64_PROOF_PACK_PENDING_TO_PASS_v65.md | 22 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_V64_PROOF_PACK_PENDING_TO_PASS_v65.md | 29 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_V64_PROOF_PACK_PENDING_TO_PASS_v65.md | 30 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_V64_PROOF_PACK_PENDING_TO_PASS_v65.md | 39 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_V64_PROOF_PACK_PENDING_TO_PASS_v65.md | 40 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_V64_PROOF_PACK_PENDING_TO_PASS_v65.md | 42 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_V64_PROOF_PACK_PENDING_TO_PASS_v65.md | 46 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_FUNCTIONAL_MODULE_MATRIX_v56.md | 6 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_FUNCTIONAL_MODULE_MATRIX_v56.md | 53 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_FUNCTIONAL_MODULE_MATRIX_v56.md | 57 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/backend-proof-tier-thresholds.v60.json | 36 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/backend-proof-tier-thresholds.v60.json | 71 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/backend-proof-tier-thresholds.v60.json | 107 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_V64_MAIN_MENU_ARTIFACT_VALIDATION_v65.md | 22 | semantic/test marker retained for traceability | mission-core context | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_REMOTE_SYNC_v61.md | 25 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_TIER_THRESHOLDS_v60.md | 25 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_TIER_THRESHOLDS_v60.md | 42 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_BACKEND_PROOF_TIER_THRESHOLDS_v60.md | 62 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/DESKTOP_E2E_BLOCKED.md | 3 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_REMOTE_CI_READINESS_v58.md | 16 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_REMOTE_CI_READINESS_v58.md | 59 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/ui/desktop/runtime/UI_DESKTOP_IPC_RESPONSE_REFLECTION_TAXONOMY_v59.md | 71 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/archive_legacy/sessions/DEPLOYMENT_PLAN_v26.2_PRODUCTION.md | 591 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/merged/IMPLEMENTATION_COMPLETE_FULL_DUPLEX_v∞.5.md | 514 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/merged/IMPLEMENTATION_COMPLETE_FULL_DUPLEX_v∞.5.md | 521 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/archive_legacy/sessions/PHASE_1_COMPLETE_BANNER.txt | 85 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/merged/LOGO_INTEGRATION_COMPLETE_v∞.2.md | 52 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/archive_legacy/root/AUDIT_SUMMARY.md | 144 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/archive_legacy/sessions/CHAT_CONSOLIDATION_SUCCESS_REPORT.md | 74 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/archive_legacy/sessions/CHAT_CONSOLIDATION_SUCCESS_REPORT.md | 80 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/merged/SUPER_PROMPT_1_COMPLETE_REPORT.md | 117 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/merged/SUPER_PROMPT_1_COMPLETE_REPORT.md | 127 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/RAPPORT_FINAL_SEAL__deployment_latest_certification_p3_seal_P3_7_SEAL_20260216_172121_RAPPORT_FINAL_SEAL.md.md | 430 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/archive_legacy/root/BRANCH_MERGE_INDEX.md | 164 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/archive_legacy/root/BRANCH_MERGE_INDEX.md | 171 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/archive_legacy/sessions/PRODUCTION_READY_FINAL_REPORT_v26.1.md | 487 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/merged/SUPER_PROMPT_2_COMPLETE_REPORT.md | 228 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BRANCH_MERGE_INDEX.md | 164 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BRANCH_MERGE_INDEX.md | 171 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/OPTIMIZATION_REPORT_v29.0.0.md | 535 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/06_SCANS_BACKEND_HTTP.md | 54 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/06_CI_VERDICT.md | 20 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/06_CI_VERDICT.md | 22 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/06_CI_VERDICT.md | 35 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LOCAL_AI_RUNTIME_FULL_PASS_VERDICT.md | 4 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LOCAL_AI_RUNTIME_FULL_PASS_VERDICT.md | 68 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LOCAL_AI_RUNTIME_FULL_PASS_VERDICT.md | 69 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LOCAL_AI_RUNTIME_FULL_PASS_VERDICT.md | 85 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LOCAL_AI_RUNTIME_FULL_PASS_VERDICT.md | 218 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/PROD_FIX_v27.0.2_COMPLETE_GUIDE.md | 381 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LAUNCH_CHECKLIST_v27.2.0.md | 93 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LAUNCH_CHECKLIST_v27.2.0.md | 126 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LAUNCH_CHECKLIST_v27.2.0.md | 146 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LAUNCH_CHECKLIST_v27.2.0.md | 262 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LAUNCH_CHECKLIST_v27.2.0.md | 263 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LAUNCH_CHECKLIST_v27.2.0.md | 264 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/LAUNCH_CHECKLIST_v27.2.0.md | 265 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/10_VSCODE_CRASH_DIAG.md | 47 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/10_VSCODE_CRASH_DIAG.md | 56 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/archive_legacy/root/BRANCH_MERGE_COMPLETION.md | 187 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/archive_legacy/root/BRANCH_MERGE_COMPLETION.md | 371 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/11_DEPLOYMENT_GATE_SUMMARY.md | 15 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/SEAL_SCORECARD.md | 12 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/VERDICT__deployment_latest_certification_phase10_3_1_P10_3_1_FAST_TRACK_20260218T135700Z_VERDICT.md.md | 4 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/VERDICT__deployment_latest_certification_recovery_P10_R_PROOF_PACK_RECOVERY_20260218_122138_VERDICT.md.md | 26 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/AUTONOMY_AUDIT_FINAL_ANALYSIS.md | 122 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BUILD_IN_PROGRESS.md | 13 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BOOTSTRAP_REPORT.md | 24 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BOOTSTRAP_REPORT.md | 25 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BOOTSTRAP_REPORT.md | 106 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BOOTSTRAP_REPORT.md | 112 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BOOTSTRAP_REPORT.md | 119 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BOOTSTRAP_REPORT.md | 299 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BOOTSTRAP_REPORT.md | 300 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BOOTSTRAP_REPORT.md | 301 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BOOTSTRAP_REPORT.md | 302 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BOOTSTRAP_REPORT.md | 303 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BOOTSTRAP_REPORT.md | 305 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/BOOTSTRAP_REPORT.md | 306 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/08_CONTINUATION_PLAN.md | 55 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/VERDICT__deployment_latest_certification_phase10_3_2_P10_3_2_FULL_DESKTOP_E2E_X3_20260218T200739Z_VERDICT.md.md | 16 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/VERDICT__deployment_latest_certification_phase10_3_2_P10_3_2_FULL_DESKTOP_E2E_X3_20260218T200739Z_VERDICT.md.md | 27 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/VERDICT__deployment_latest_certification_phase10_6_P10_6_E2E_FULL_SUITE_20260218T203013Z_VERDICT.md.md | 47 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/00_SCOPE__deployment_latest_certification_phase10_3_2_P10_3_2_FULL_DESKTOP_E2E_X3_20260218T200739Z_00_SCOPE.md.md | 4 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/legacy_reports/SECURITY_HARDENING_SUCCESS_v17.txt | 94 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/legacy_reports/SECURITY_HARDENING_SUCCESS_v17.txt | 193 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/legacy_reports/SECURITY_HARDENING_SUCCESS_v17.txt | 200 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/__ARCHIVE_UI_CARTOGRAPHY_VAULT___legacy/CRITICAL_FILES/09_MANIFEST.json | 370 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/AUTONOMY_AUDIT_FINAL_VERDICT.md | 28 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/AUTONOMY_AUDIT_FINAL_VERDICT.md | 31 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/CERTIFICATION_REGISTRY_APPEND_ONLY__deployment_latest_certification_p3_registry_CERTIFICATION_REGISTRY_APPEND_ONLY.md.md | 161 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/CERTIFICATION_REGISTRY_APPEND_ONLY__deployment_latest_certification_p3_registry_CERTIFICATION_REGISTRY_APPEND_ONLY.md.md | 179 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/CERTIFICATION_REGISTRY_APPEND_ONLY__deployment_latest_certification_p3_registry_CERTIFICATION_REGISTRY_APPEND_ONLY.md.md | 240 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/CERTIFICATION_REGISTRY_APPEND_ONLY__deployment_latest_certification_p3_registry_CERTIFICATION_REGISTRY_APPEND_ONLY.md.md | 345 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/CERTIFICATION_REGISTRY_APPEND_ONLY__deployment_latest_certification_p3_registry_CERTIFICATION_REGISTRY_APPEND_ONLY.md.md | 381 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/00_FINAL_EXECUTION_REPORT.md | 54 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/00_FINAL_EXECUTION_REPORT.md | 80 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/00_FINAL_EXECUTION_REPORT.md | 169 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/PROGRESS_TRACKING.md | 323 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/PROGRESS_TRACKING.md | 441 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/archive_legacy/v25/OPT1_THREE_JS_LAZY_COMPLETION_v25.3.0.md | 304 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/legacy_reports/LOGO_CHECKLIST_VISUAL_v∞.2.txt | 193 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/92_maintenance/ls_lR_avant.txt | 4615 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/diagnostics/DIAGNOSTIC_ARCHITECTURE_SINGULARITY.md | 390 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/diagnostics/DIAGNOSTIC_ARCHITECTURE_SINGULARITY.md | 391 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/TITANE_ARCHITECTURE_IMPLEMENTATION_v24.30.md | 17 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/TITANE_ARCHITECTURE_IMPLEMENTATION_v24.30.md | 18 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/TITANE_ARCHITECTURE_IMPLEMENTATION_v24.30.md | 19 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/TITANE_ARCHITECTURE_IMPLEMENTATION_v24.30.md | 20 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/TITANE_ARCHITECTURE_IMPLEMENTATION_v24.30.md | 21 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/archive_legacy/v25/PHASE_4_P1_INTEGRATION_v25.7.5.md | 303 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/old_sessions/2025-12-10/SUCCESS_BANNER_v24.12.0.txt | 126 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/implementations/OMEGA_SINGULARITY_IMPLEMENTATION_SUMMARY.md | 220 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/implementations/ADAPTIVE_TIMEOUT_IMPLEMENTATION_R02.md | 409 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/implementations/ADAPTIVE_TIMEOUT_IMPLEMENTATION_R02.md | 410 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/implementations/ADAPTIVE_TIMEOUT_IMPLEMENTATION_R02.md | 411 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/old_sessions/2025-12-10/DEPLOYMENT_REPORT_v19.5.2_FINAL.md | 367 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/implementations/MEMORY_INTEGRATION_R04_COMPLETE.md | 742 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/implementations/MEMORY_INTEGRATION_R04_COMPLETE.md | 743 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/implementations/MEMORY_INTEGRATION_R04_COMPLETE.md | 744 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/implementations/MEMORY_INTEGRATION_R04_COMPLETE.md | 745 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/old_sessions/2025-12-10/DEPLOYMENT_STATUS_STABLE_v1.0.0.txt | 37 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/runtime/RUNTIME_VALIDATION_READY.md | 472 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/runtime/RUNTIME_VALIDATION_READY.md | 473 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/runtime/RUNTIME_VALIDATION_READY.md | 474 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/runtime/RUNTIME_VALIDATION_READY.md | 506 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/runtime/RUNTIME_STATUS_ACTIVE.md | 306 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/runtime/SINGULARITY_VALIDATION_THEORIQUE.md | 860 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/LOCK__deployment_latest_certification_recovery_P10_R_PROOF_PACK_RECOVERY_20260218_122138_LOCK.md.md | 49 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/__ARCHIVE_UI_CARTOGRAPHY_VAULT___legacy/ui-carto-copilot/09_MANIFEST.json | 370 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/__ARCHIVE_UI_CARTOGRAPHY_VAULT___legacy/ui-carto-copilot/VERIFICATION/SEAL_PRODUCTION_BLOCKED.md | 118 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/__ARCHIVE_UI_CARTOGRAPHY_VAULT___legacy/ui-carto-copilot/VERIFICATION/SEAL_PRODUCTION_BLOCKED.md | 320 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/FINAL_VERDICT__reports_local_ai_runtime_full_pass_2026-02-11T172936Z_FINAL_VERDICT.md.md | 57 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/FINAL_VERDICT__reports_local_ai_runtime_full_pass_2026-02-11T172936Z_FINAL_VERDICT.md.md | 110 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/FINAL_VERDICT__reports_local_ai_runtime_full_pass_2026-02-11T172936Z_FINAL_VERDICT.md.md | 352 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/FINAL_VERDICT__reports_local_ai_runtime_full_pass_2026-02-11T172936Z_FINAL_VERDICT.md.md | 353 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md | 712 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md | 713 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md | 714 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md | 715 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md | 716 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/complete-reports/API_CHAT_FIXES_COMPLETE_v21.md | 717 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/VERDICT__deployment_latest_certification_phase6_P6_OPS_READINESS_20260217_173452_VERDICT.md.md | 228 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/versions/v24/README.v24.md | 172 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/versions/v24/README.v24.md | 173 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/versions/v24/README.v24.md | 174 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/versions/v24/README.v24.md | 175 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/versions/v24/README.v24.md | 176 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/versions/v24/README.v24.md | 177 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/versions/v24/README.v24.md | 178 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/versions/v24/README.v24.md | 179 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/versions/v24/README.v24.md | 180 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/versions/v24/PERFORMANCE_PHASE_5_PARTIAL_v24.20.md | 413 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/TAURI_RUST_BACKEND_STATUS_v24.md | 275 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/SESSION_RECAP_v24_TAURI.md | 443 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/SESSION_RECAP_v24_TAURI.md | 444 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/SESSION_RECAP_v24_TAURI.md | 445 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/SESSION_RECAP_v24_TAURI.md | 446 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/SESSION_RECAP_v24_TAURI.md | 447 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/SESSION_RECAP_v24_TAURI.md | 448 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/SESSION_RECAP_v24_TAURI.md | 449 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/SESSION_RECAP_v24_TAURI.md | 474 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/VISUAL_TRANSFORMATION_v20.md | 161 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/super_prompts_legacy/P4.17_REGISTRY_MAPS_MERMAID_PROOF_COMPLETION.md | 133 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/super_prompts_legacy/P4.17_REGISTRY_MAPS_MERMAID_PROOF_COMPLETION.md | 300 | sentinel/guard literal in tests/scripts/docs | expected explicit fallback classification | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/05_SCANS_ALLOWLIST.md | 6020 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/05_SCANS_ALLOWLIST.md | 12073 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/INSTALL_NODE_PNPM_GUIDE.md | 304 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/AUDIO_AUTOFIX_REPORT_v∞.md | 28 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/AUDIO_AUTOFIX_REPORT_v∞.md | 238 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/AUDIO_AUTOFIX_REPORT_v∞.md | 239 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/AUDIO_AUTOFIX_REPORT_v∞.md | 240 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/AUDIO_AUTOFIX_REPORT_v∞.md | 241 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/AUDIO_AUTOFIX_REPORT_v∞.md | 242 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/AUDIO_AUTOFIX_REPORT_v∞.md | 243 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/AUDIO_AUTOFIX_REPORT_v∞.md | 244 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/AUDIO_AUTOFIX_REPORT_v∞.md | 245 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/AUDIO_AUTOFIX_REPORT_v∞.md | 246 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/AUDIO_AUTOFIX_REPORT_v∞.md | 247 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/AUDIO_AUTOFIX_REPORT_v∞.md | 248 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/2025-12/SESSION_FINALE_VALIDATION.md | 556 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/2025-12/SESSION_COMPLETE_11DEC2025.md | 232 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/2025-12/SESSION_COMPLETE_11DEC2025.md | 412 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/2025-12/SESSION_COMPLETE_11DEC2025.md | 476 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/2025-12/SESSION_COMPLETE_11DEC2025.md | 501 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/SPRINT_1_PROGRESS.md | 24 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/SPRINT_1_PROGRESS.md | 240 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/2025-12/REFLEXION_APPROFONDIE_VALIDATION.md | 134 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/2025-12/REFLEXION_APPROFONDIE_VALIDATION.md | 146 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/2025-12/REFLEXION_OMEGA_SINGULARITY_COMPLETE.md | 469 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/RAPPORT_v∞_ABC_IMPLEMENTATION_COMPLETE.md | 278 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/RAPPORT_v∞_ABC_IMPLEMENTATION_COMPLETE.md | 469 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/RAPPORT_v∞_ABC_IMPLEMENTATION_COMPLETE.md | 855 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/INSTALL_NODEJS_SUCCESS_v24.md | 340 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/sessions/MCP_OS_CONSTITUTION_v1.1_IMPLEMENTATION.md | 279 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122526/PHASE_1_FINAL_REPORT.md | 147 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122526/BUGFIX_REPORT_PHASE4_v24.4.0.md | 365 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_123316/BUGFIX_REPORT_PHASE4_v24.4.0.md | 365 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_123316/PHASE_1_FINAL_REPORT.md | 147 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122526/PRODUCTION_READY_FINAL_REPORT_v26.1.md | 487 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122526/PHASE_4_P1_INTEGRATION_v25.7.5.md | 303 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_123316/PHASE_4_P1_INTEGRATION_v25.7.5.md | 303 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_123316/CHAT_CONSOLIDATION_SUCCESS_REPORT.md | 74 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_123316/CHAT_CONSOLIDATION_SUCCESS_REPORT.md | 80 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122526/CHAT_CONSOLIDATION_SUCCESS_REPORT.md | 74 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122526/CHAT_CONSOLIDATION_SUCCESS_REPORT.md | 80 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_123316/PRODUCTION_READY_FINAL_REPORT_v26.1.md | 487 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122526/OPT1_THREE_JS_LAZY_COMPLETION_v25.3.0.md | 304 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_123316/OPT1_THREE_JS_LAZY_COMPLETION_v25.3.0.md | 304 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122526/DEPLOYMENT_PLAN_v26.2_PRODUCTION.md | 591 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_123316/DEPLOYMENT_PLAN_v26.2_PRODUCTION.md | 591 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122540/PHASE_1_FINAL_REPORT.md | 147 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122540/BUGFIX_REPORT_PHASE4_v24.4.0.md | 365 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122540/PRODUCTION_READY_FINAL_REPORT_v26.1.md | 487 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122540/PHASE_4_P1_INTEGRATION_v25.7.5.md | 303 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122540/DEPLOYMENT_PLAN_v26.2_PRODUCTION.md | 591 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122540/OPT1_THREE_JS_LAZY_COMPLETION_v25.3.0.md | 304 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122540/CHAT_CONSOLIDATION_SUCCESS_REPORT.md | 74 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/obsolete/repo_cleanup_2026-05-03/docs_backup_20251218_122540/CHAT_CONSOLIDATION_SUCCESS_REPORT.md | 80 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/SCANS_ALLOWLIST.md | 6387 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/SCANS_ALLOWLIST.md | 14485 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/01_misc/SCANS_ALLOWLIST.md | 20538 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17-42-42Z.txt | 7579 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/__AUDITS__/HOUSEKEEPING/INVENTORY_RAW_2026-02-09T17-42-42Z.txt | 7580 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md | 6387 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md | 14485 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |
| docs/99_ARCHIVE/05_SCANS_ALLOWLIST__runs_p469_475_proof_pack_05_SCANS_ALLOWLIST.md.md | 20538 | historical or semantic marker literal | non-blocking outside v64/v65 core closure scope | KEEP_HISTORICAL_CONTEXT |

## Mission-scope conclusion

- No unresolved v64/v65 core blocker marker detected.
- No stale pending marker required forced removal in mission-core files; remaining mentions are historical trace context.
