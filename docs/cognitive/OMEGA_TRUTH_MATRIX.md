# OMEGA Truth Matrix

Lock: B1
Date: 2026-05-06
Type: T0/T1 (documentation audit)

| subsystem | files inspected | claimed capability | actual observed implementation | classification | proof signal | risk | next lock dependency | scorecard dependency | Desktop test dependency |
|---|---|---|---|---|---|---|---|---|---|
| OMEGA Router | src-tauri/src/omega/pipeline.rs, src/schemas/ipcTruthContracts.ts | Route request through OMEGA stages with reason codes | Stage pipeline and reason codes exist; visibility in user surface remains partial | PARTIAL | Contract fields present in source | Trace visibility gap | B2 | ROUTER_TRUTH_SCORECARD, PROVIDER_ROUTING_TRUTH_SCORECARD | AI-DESKTOP-03, AI-DESKTOP-04 |
| OMEGA Executor | src-tauri/src/omega/pipeline.rs, src/services/omega_handler/OmegaHandlerUpgradeContract.ts | Execute selected cognitive handlers | T3 upgrade contract exists; behavior gated and bounded | HEURISTIC | D1 lock tests previously passed | Runtime activation risk if flag misuse | D1 | OMEGA_HANDLER_REALITY_SCORECARD | AI-DESKTOP-11 |
| OMEGA Merger | src-tauri/src/omega/pipeline.rs | Merge partial outputs into response | Merger stage exists; deep merge quality not fully benchmarked in this lock | PARTIAL | Stage enum and pipeline references | Output consistency drift | B2 | RESPONSE_QUALITY_SCORECARD | AI-DESKTOP-20 |
| OMEGA Guardrails | src-tauri/src/omega/guardrails.rs, src/schemas/ipcTruthContracts.ts | Detect and block unsafe/invalid responses | Guardrail fields and reason codes present; factual grounding still eval-dependent | PARTIAL | Guardrail structures in source + scorecards exist | False-negative guard risk | C0, C3 | HONESTY_SCORECARD, INTELLIGENCE_TRUTH_SCORECARD | AI-DESKTOP-15 |
| OMEGA Bridge / Integration | src/services/cognitive/cognitiveOmegaIntegration.ts, src/lib/ipcContract.ts | Bridge frontend cognition and tauri IPC truth contract | Integration layer exists; end-to-end trace normalization not unified | PARTIAL | IPC contract and integration files | Cross-layer drift | B2 | COGNITIVE_CORE_TRUTH_SCORECARD | AI-DESKTOP-20 |
