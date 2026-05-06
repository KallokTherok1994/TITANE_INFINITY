# TITANE Runtime Feature Flags Registry

Lock: C2
Date: 2026-05-06

| id | feature_flag | lock | default | surface | activation_policy | rollback |
|---|---|---|---|---|---|---|
| FF-C0 | TITANE_C0_PROVIDER_ROUTING_ENABLED | C0 | false | src-tauri/src/overdrive/chat_orchestrator.rs; src/services/routing/ProviderRoutingContract.ts | T3 gated, must be set explicitly | restore Rust + TS defaults |
| FF-C1 | VITE_TITANE_C1_MEMORYGRAPH_V2_SHADOW | C1 | false | src/services/memory/v2/MemoryGraphV2ShadowContract.ts | T3 gated, shadow-only, no v2 reads | set VITE_TITANE_C1_MEMORYGRAPH_V2_SHADOW=false |
| FF-C2 | VITE_TITANE_C2_KNOWLEDGE_GOVERNANCE | C2 | false | src/services/knowledge_governance/KnowledgeGovernanceContract.ts; data/knowledge_base/KNOWLEDGE_GOVERNANCE_INDEX.json | T2 passive — no runtime activation required; governance index is read-only sidecar | restore governance index to previous state; set VITE_TITANE_C2_KNOWLEDGE_GOVERNANCE=false |
| FF-D1 | TITANE_D1_OMEGA_REAL_HANDLER | D1 | false | src/services/omega_handler/OmegaHandlerUpgradeContract.ts | T3 gated, no silent activation | restore contract and env defaults |
| FF-D2 | TITANE_D2_SINGULARITY_MEASURED | D2 | false | src/services/singularity_layer/SingularityMeasuredLayerContract.ts | T3 gated, measurement-only scaffold | restore contract and env defaults |
| FF-D3 | TITANE_D3_TWIN_CONSENT_LEDGER | D3 | false | src/services/twin_consent/TwinConsentLedgerContract.ts | T4 scaffold boundary | restore contract and env defaults |
| FF-D4 | TITANE_D4_SELF_IMPROVEMENT_LAB | D4 | false | src/services/self_improvement_lab/SelfImprovementLabContract.ts | T4 scaffold only, apply blocked | restore contract and env defaults |
| FF-D5 | TITANE_D5_INTELLIGENCE_SEAL | D5 | false | src/services/intelligence_seal/IntelligenceSealContract.ts | T5 certification gate | restore contract and env defaults |

