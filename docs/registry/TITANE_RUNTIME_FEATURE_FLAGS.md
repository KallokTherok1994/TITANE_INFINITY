# TITANE Runtime Feature Flags Registry

Lock: B1.5
Date: 2026-05-06

| id | feature_flag | lock | default | surface | activation_policy | rollback |
|---|---|---|---|---|---|---|
| FF-D1 | TITANE_D1_OMEGA_REAL_HANDLER | D1 | false | src/services/omega_handler/OmegaHandlerUpgradeContract.ts | T3 gated, no silent activation | restore contract and env defaults |
| FF-D2 | TITANE_D2_SINGULARITY_MEASURED | D2 | false | src/services/singularity_layer/SingularityMeasuredLayerContract.ts | T3 gated, measurement-only scaffold | restore contract and env defaults |
| FF-D3 | TITANE_D3_TWIN_CONSENT_LEDGER | D3 | false | src/services/twin_consent/TwinConsentLedgerContract.ts | T4 scaffold boundary | restore contract and env defaults |
| FF-D4 | TITANE_D4_SELF_IMPROVEMENT_LAB | D4 | false | src/services/self_improvement_lab/SelfImprovementLabContract.ts | T4 scaffold only, apply blocked | restore contract and env defaults |
| FF-D5 | TITANE_D5_INTELLIGENCE_SEAL | D5 | false | src/services/intelligence_seal/IntelligenceSealContract.ts | T5 certification gate | restore contract and env defaults |
