# BOOTSTRAP
## git status --porcelain=v1
 M .clinerules/05-truth-surface.md
 M docs/AUDIT_CHAT_IA_ORCHESTRATEUR_2026-03-26.md
 M scripts/autoheal/autoheal_rules.jsonl
 M scripts/benchmark.sh
 M scripts/e2e/run-memory-chat-proof-ui.sh
 M scripts/e2e/run-online-chat-proof-ui.sh
 M scripts/fix-prod-v27.0.2.sh
 M scripts/install/install-e2e.sh
 M scripts/post-build.sh
 M scripts/prepare-ollama-bundle.sh
 M scripts/publish/publish-v27.2.0.sh
 M scripts/setup-dev.sh
 M scripts/test-all.sh
?? .claude/
?? .github/workflows/docs.yml
?? PLANS/
?? docs/90_release/PRODUCTION_RELEASE_v28.88.0.md
?? docs/governance/BASELINE_VERDICT.md
?? docs/governance/CAPABILITY_MATRIX_CANONICAL_v1.md
?? docs/governance/PROVIDER_FABRIC_CANON_v1.md
?? docs/governance/ROUTING_POLICY_CANON_v1.md
?? docs/governance/ROUTING_TRACE_CONTRACT_v1.md
?? docs/governance/TARGET_OPERATING_MODEL_v1.md
?? documentation/
?? evals/harness/
?? proof
?? proof_p
?? proof_packs/AUDIO_VOICE_RECERT_2026-03-17_1856_8af44abed/
?? proof_packs/CL
?? proof_packs/CLINE_AUTHORITY_CORE_CONVERGENCE_2026-03-26_2044_e88264039/
?? proof_packs/CLINE_CAN
?? proof_packs/CLINE_CANONICAL_REDUCTION_2026-
?? proof_packs/CLINE_CANONICAL_REDUCTION_2026-03-2
?? proof_packs/CLINE_CANONICAL_REDUCTION_2026-03-26_2003_e88264039/
?? proof_packs/CLINE_EXEC
?? proof_packs/CLINE_EXECUTION_CONVERGENCE_
?? proof_packs/CLINE_EXECUTION_CONVERGENCE_2026-03-26_2
?? proof_packs/CLINE_EXECUTION_CONVERGENCE_2026-03-26_2014_e882
?? proof_packs/CLINE_EXECUTION_CONVERGENCE_2026-03-26_2014_e882640
?? proof_packs/CLINE_EXECUTION_CONVERGENCE_2026-03-26_2014_e88264039/
?? proof_packs/FINAL_PROMOTION_GATEKEEPER_2026-03-27_0712_e88264039/
?? proof_packs/LOCK1_PROVIDER_FABRIC_STATUS_FIX_2026-03-27_e88264039/
?? proof_packs/LOCK_SURGEON_FALSE_MEMORY_CLAIM_2026-03-27_2219_e88264039/
?? proof_packs/MEMORY_FALLBACK_TRUTH_SEALER_2026-03-27_0647_e88264039/
?? proof_packs/PHASE0_AUTHORITY_FREEZE_2026-03-27_e88264039/
?? proof_packs/PHASE1_PROVIDER_ADAPTER_COMPAT_2026-03-27_e88264039/
?? proof_packs/PHASE1_PROVIDER_FABRIC_FREEZE_2026-03-27_e88264039/
?? proof_packs/PHASE1_PROVIDER_FABRIC_STATUS_2026-03-27_e88264039/
?? proof_packs/PHASE2_ROUTING_TRUTH_FREEZE_2026-03-27_e88264039/
?? proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/
?? proof_packs/POST_REVERT_CLOSURE_TRANSITION_2026-03-28_1038_e88264039/
?? proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/
?? proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/
?? proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/
?? proof_packs/POST_SEALED_SENTINEL_STEADY_2026-03-28_1058_e88264039/
?? proof_packs/ROUTING_PROOF_UNBLOCK_2026-03-27_e88264039/
?? proof_packs/TERMINAL_CONVERGENCE_REFINER_2026-03-27_0747_e88264039/
?? proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/
?? proof_packs/ULTRA_MASTER_AUDIT_2026-03-16_2032_ce22c1f4f/
?? proof_packs/ZERO_REGRESSION_2026-03-20_1430_7973fbd/
?? proof_packs/ZERO_REGRESSION_AUTO_MODE_2026-03-27_2147_e88264039/
?? scripts/cleanup-console-log.mjs
?? scripts/sync-docs.sh

## git rev-parse --short HEAD
e88264039

## git branch --show-current
MAIN

## git log -20 --oneline
e88264039 docs(audit): mise à jour audit chat IA — suite complète + cargo warnings
4ed5b6e49 fix(rust/tests): omega_meta manquant dans 9 struct literals de tests
3ad620c6c fix(misc): main.rs comment + audit doc wording mineures
1420ffea1 fix(cleanup): chatClient.ts suppression — orphelin prouvé (0 imports src/)
4d3a64771 fix(docs): hardening léger — statuts RESOLVED et classifications mises à jour
5845ad12f docs(ops): CLAUDE_CODE_NEXT_READINESS — évaluation automation post-consolidation
924056d33 docs(governance): EXECUTION_GUARDRAILS — garde-fous post-optimisation
5591b9825 docs(architecture): UNKNOWN_REDUCTION_PLAN — 4 UNKNOWN réduits/résolus
123619569 docs(architecture): VALIDATION_CERTIFICATION_BASELINE — hiérarchie honnête des preuves
4d31bd288 docs(architecture): CONSOLIDATED_AUTHORITY_STATE — état post-chantier principal
a36f71c59 fix(tests): MemorySearch — fake timers pour debounce 300ms (régression 5edd219df)
f570ec62a docs(audit): AUDIT_CHAT_IA_ORCHESTRATEUR_2026-03-26 — PASS 53/53
3ff7cf8b4 fix(cleanup): TitanePage dead code + orchestrator version header
d1d88e24e docs(ops): main optimization execution log — Phase 10 STABLE
2ed09297d feat(shell): App.tsx phase 3b — extract useTopNavigation hook (-60 lines)
5e201c066 fix(memory): MemoryIntelligenceEngine — TODO marker P2 + MOVE_PLAN updated
1daf353f0 fix(rust): audio-capture opt-in — retire cpal du default set (P1 ALSA risk)
283abcaa7 docs(architecture): Phase 5+7+9 docs + recharts reclassification + proof_packs archive
cad543f47 fix(misc): XP_ENGINE sync experienceService + TimePage CSS fix + clinerules truth-surface
af5db04c7 style(ai): prettier formatting — omegaModeClassifier, championChallenger, conversationEngine

## git diff --stat
 .clinerules/05-truth-surface.md                | 60 +++++++++++++-------------
 docs/AUDIT_CHAT_IA_ORCHESTRATEUR_2026-03-26.md | 31 ++++++-------
 scripts/autoheal/autoheal_rules.jsonl          |  6 ++-
 scripts/benchmark.sh                           |  0
 scripts/e2e/run-memory-chat-proof-ui.sh        |  0
 scripts/e2e/run-online-chat-proof-ui.sh        |  0
 scripts/fix-prod-v27.0.2.sh                    |  0
 scripts/install/install-e2e.sh                 |  0
 scripts/post-build.sh                          |  0
 scripts/prepare-ollama-bundle.sh               |  0
 scripts/publish/publish-v27.2.0.sh             |  0
 scripts/setup-dev.sh                           |  0
 scripts/test-all.sh                            |  0
 13 files changed, 49 insertions(+), 48 deletions(-)

## git diff --name-only
.clinerules/05-truth-surface.md
docs/AUDIT_CHAT_IA_ORCHESTRATEUR_2026-03-26.md
scripts/autoheal/autoheal_rules.jsonl
scripts/benchmark.sh
scripts/e2e/run-memory-chat-proof-ui.sh
scripts/e2e/run-online-chat-proof-ui.sh
scripts/fix-prod-v27.0.2.sh
scripts/install/install-e2e.sh
scripts/post-build.sh
scripts/prepare-ollama-bundle.sh
scripts/publish/publish-v27.2.0.sh
scripts/setup-dev.sh
scripts/test-all.sh

## git diff -- src src-tauri package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json

## grep '"version"' package.json
  "version": "28.88.0",

## grep '^version' src-tauri/Cargo.toml
version      = "28.88.0"

## head -10 README.md
# TITANE∞ — Cognitive Operating System

![CI/CD Status](https://github.com/KallokTherok1994/TITANE_INFINITY/actions/workflows/ci.yml/badge.svg?branch=MAIN)
![Mermaid Canon](https://github.com/KallokTherok1994/TITANE_INFINITY/actions/workflows/mermaid-verify.yml/badge.svg?branch=MAIN)

**Version:** v28.88.0 (repository authority)  
**Status:** Production Ready ✅ (sealed v28.88.0)  
**License:** Proprietary — © 2025-2026 Humain Total / Kevin Thibault

**Canal de release canonique:** v28.88.0

## head -10 docs/README.md
# TITANE∞ v28.88.0

![Version](https://img.shields.io/badge/version-28.88.0-blue)
![Rust](https://img.shields.io/badge/rust-2021-orange)
![React](https://img.shields.io/badge/react-18-61dafb)
![TypeScript](https://img.shields.io/badge/typescript-5.5-3178c6)
![Tauri](https://img.shields.io/badge/tauri-2.0-ffc131)
![Modules](https://img.shields.io/badge/modules-60+-green)
![Status](https://img.shields.io/badge/status-production%20ready-success)


## grep -m3 '^## \[' CHANGELOG.md
## [28.88.0] - 2026-03-22 (Governance)
## [28.87.0] - 2026-03-22 (Governance)
## [28.86.0] - 2026-03-22 (Governance)

## find RELEASE_*_SEALED.txt
./RELEASE_v28.83.0_SEALED.txt
./RELEASE_v28.84.0_SEALED.txt
./RELEASE_v28.87.0_SEALED.txt
./RELEASE_v27.0.3_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.15.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.6.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.29.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.48.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.73.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.64.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.11.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.20.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.31.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.57.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.76.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.52.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.55.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.21.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.42.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.34.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.61.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.54.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.41.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.58.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.19.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.66.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.28.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.75.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.18.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.35.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.33.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.79.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.65.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.67.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.7.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.44.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.63.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.71.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.9.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.69.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.39.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.68.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.37.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.49.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.12.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.80.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.22.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.53.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.16.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.36.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.70.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.43.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.46.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.56.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.32.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.14.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.78.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.17.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.59.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.51.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.47.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.50.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.38.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.30.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.40.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.10.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.72.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.27.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.24.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.13.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.8.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.74.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.23.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.26.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.60.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.77.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.25.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.45.0_SEALED.txt
./_archive/01_root_reports/releases/RELEASE_v28.62.0_SEALED.txt
./RELEASE_v28.0.0_SEALED.txt
./RELEASE_v28.81.0_SEALED.txt
./RELEASE_v28.85.0_SEALED.txt
./RELEASE_v28.5.0_SEALED.txt
./RELEASE_v28.82.0_SEALED.txt
./RELEASE_v28.86.0_SEALED.txt
./RELEASE_v28.88.0_SEALED.txt

## find RELEASE_ARTIFACTS_CHECKSUMS_*
./_archive/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.5.0.txt
./_archive/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.87.0.txt
./_archive/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.84.0.txt
./_archive/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.83.0.txt
./_archive/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.85.0.txt
./_archive/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.81.0.txt
./_archive/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.88.0.txt
./_archive/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.82.0.txt
./_archive/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.86.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.52.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.66.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.62.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.61.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.63.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.53.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.69.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.79.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.20.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.13.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.38.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.14.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.10.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.68.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.76.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.65.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.36.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.44.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.23.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.64.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.25.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.47.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.29.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.15.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.40.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.60.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.48.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.7.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.51.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.17.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.74.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.54.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.28.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.78.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.75.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.6.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.26.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.12.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.56.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.31.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.41.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.71.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.21.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.70.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.35.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.8.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.50.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.9.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.73.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.27.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.32.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.49.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.37.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.67.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.80.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.59.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.58.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.33.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.45.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.55.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.34.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.43.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.42.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.22.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.57.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.72.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.16.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.46.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.11.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.77.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.30.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.39.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.18.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.24.0.txt
./_archive/01_root_reports/releases/RELEASE_ARTIFACTS_CHECKSUMS_28.19.0.txt

## find backup/patch/diff/supervision/telemetry
./.vite-cache/deps/@opentelemetry_api.js
./.vite-cache/deps/@opentelemetry_api.js.map
./PLANS/PERFECTIONNEMENTS_FRONTEND_SUPERVISION.md
./_archive/omnis_backup_20251215
./_archive/proof_packs_2026-03-26/AUDIO_VOICE_FORENSIC_2026-03-15_1408_c59e9b5/raw/diffs/001_main_rs.patch
./_archive/proof_packs_2026-03-26/AUDIO_VOICE_FORENSIC_2026-03-15_1408_c59e9b5/raw/env/autoheal_rules_backup.jsonl
./_archive/proof_packs_2026-03-26/COMMIT_DISCIPLINE_2026-03-15_1441_536d86574/raw/diffs/CameraPage_HEAD.patch
./_archive/proof_packs_2026-03-26/COMMIT_DISCIPLINE_2026-03-15_1441_536d86574/raw/diffs/ChatPage_HEAD.patch
./_archive/proof_packs_2026-03-26/COMMIT_DISCIPLINE_2026-03-15_1441_536d86574/raw/diffs/audio_tts_HEAD1.patch
./_archive/proof_packs_2026-03-26/COMMIT_DISCIPLINE_2026-03-15_1441_536d86574/raw/diffs/chat_rs_HEAD.patch
./_archive/proof_packs_2026-03-26/COMMIT_DISCIPLINE_2026-03-15_1441_536d86574/raw/diffs/main_rs_HEAD1.patch
./_archive/proof_packs_2026-03-26/COMMIT_DISCIPLINE_2026-03-15_1441_536d86574/raw/registry/autoheal_new_entries.diff
./_archive/proof_packs_2026-03-26/COMMIT_DISCIPLINE_2026-03-15_1441_536d86574/raw/registry/autoheal_rules_backup.jsonl
./_archive/proof_packs_2026-03-26/DRIFT_RESOLUTION_2026-03-07_1811_d859691c8/raw/20_diff_runtime_stable_manifest.patch
./_archive/proof_packs_2026-03-26/DRIFT_RESOLUTION_2026-03-07_1811_d859691c8/raw/21_diff_titane_infinity_desktop.patch
./_archive/proof_packs_2026-03-26/FINAL_100_SCOPE_2026-03-07_1717_d859691c8/raw/89_unexpected_changes_diff.patch
./_archive/proof_packs_2026-03-26/FINAL_RESUME_POST_DRIFT_2026-03-07_1826_d859691c8/raw/05_git_diff_drift_pair.patch
./_archive/proof_packs_2026-03-26/FINAL_RESUME_POST_DRIFT_2026-03-07_1826_d859691c8/raw/35_drift_pair_final.patch
./_archive/proof_packs_2026-03-26/FINAL_RESUME_POST_DRIFT_FIX_2026-03-07_1842_d859691c8/raw/03_target_diff.patch
./_archive/proof_packs_2026-03-26/FINAL_RESUME_POST_DRIFT_FIX_2026-03-07_1842_d859691c8/raw/24_drift_pair_snapshot.patch
./_archive/proof_packs_2026-03-26/MEMORY_RESTORE_CLOSURE_2026-03-20_2247_61df44d0b/02_BACKUP_COVERAGE_MAP.md
./_archive/proof_packs_2026-03-26/MEMORY_RESTORE_CLOSURE_2026-03-20_2247_61df44d0b/04_RUST_LTM_BACKUP_PATH_MAP.md
./_archive/proof_packs_2026-03-26/V61_PROMOTION_CLOSURE_RELEASE_GOVERNANCE_20260313_074108_8ed1ef72c/raw/07_docset_normalization_diff.patch
./_archive/proof_packs_2026-03-26/V62_RELEASE_PROMOTION_EXECUTION_20260313_075617_8ed1ef72c/raw/07_promotion_window_diff.patch
./_archive/proof_packs_2026-03-26/V69_POST_PROD_TRUTH_CLOSURE_20260313_214054_14416abf6b/raw/20_supersession_actions.patch
./deployment/latest/certification/phase10_1/P10_1_AUTOFIX_TO_PASS_20260218_014217/05_INT_FIX_ATTEMPT_1.patch
./deployment/latest/certification/phase10_1/P10_1_AUTOFIX_TO_PASS_20260218_014217/05_INT_FIX_ATTEMPT_2.patch
./deployment/latest/certification/phase10_1/P10_1_AUTOFIX_TO_PASS_20260218_014217/05_INT_FIX_ATTEMPT_3.patch
./deployment/latest/certification/phase10_1/P10_1_AUTOFIX_TO_PASS_20260218_014217/08_E2E_LOGGING_PATCH.patch
./deployment/latest/certification/phase10_1/P10_1_AUTOFIX_TO_PASS_20260218_014217/11_E2E_FIX_ATTEMPT_1.patch
./deployment/latest/certification/phase10_1/P10_1_AUTOFIX_TO_PASS_20260218_014217/11_E2E_FIX_ATTEMPT_2.patch
./deployment/latest/certification/phase10_1/P10_1_AUTOFIX_TO_PASS_20260218_014217/11_E2E_FIX_ATTEMPT_3.patch
./deployment/latest/certification/phase10_1/P10_1_AUTOFIX_TO_PASS_20260218_014217/11_E2E_FIX_ATTEMPT_4.patch
./deployment/latest/certification/phase10_1/P10_1_AUTOFIX_TO_PASS_20260218_014217/11_E2E_FIX_ATTEMPT_5.patch
./deployment/latest/certification/phase9_3/P9_3_REGISTRY_INCIDENT_20260218_003236/02_DIFF_FULL.patch
./deployment/latest/certification/phase9_3b/P9_3B_REMEDIATION_20260218_003400/REGISTRY_POST_DIFF.patch
./deployment/latest/certification/phase9_4/P9_4_INCIDENT_CLOSURE_20260218_003713/07_REGISTRY_DIFF.patch
./deployment/prod-builds/frontend-28.0.0/assets/telemetryEngine-CQRRtqcq.js
./deployment/prod-builds/frontend-28.0.0/assets/telemetryEngine-CQRRtqcq.js.br
./deployment/prod-builds/frontend-28.0.0/assets/telemetryEngine-CQRRtqcq.js.gz
./deployment/prod-builds/frontend-28.0.0/dist/assets/telemetryEngine-CQRRtqcq.js
./deployment/prod-builds/frontend-28.0.0/dist/assets/telemetryEngine-CQRRtqcq.js.br
./deployment/prod-builds/frontend-28.0.0/dist/assets/telemetryEngine-CQRRtqcq.js.gz
./dist/assets/telemetryEngine-CEEphy57.js
./dist/assets/telemetryEngine-CEEphy57.js.br
./dist/assets/telemetryEngine-CEEphy57.js.gz
./docs/99_ARCHIVE/obsolete/BACKUP_PROTECTION_REPORT.md
./docs/99_ARCHIVE/obsolete/FIX_BACKUP_v2.0.md
./docs/adr/ADR-002-performance-guards-telemetry.md
./docs/backup_20251218_122526
./docs/backup_20251218_122540
./docs/backup_20251218_123316
./docs/super-prompts/CHANGELOG_V1_BACKUP.md
./legacy/backend/main_backup.rs
./memory/backup
./memory/backup/cognitive.json.backup-2026-03-23T12-22-54-141Z
./memory/backup/cognitive.json.backup-2026-03-23T12-36-27-682Z
./memory/backup/cognitive.json.backup-2026-03-23T12-49-39-977Z
./memory/backup/harmonics.json.backup-2026-03-23T12-22-54-141Z
./memory/backup/harmonics.json.backup-2026-03-23T12-36-27-682Z
./memory/backup/harmonics.json.backup-2026-03-23T12-49-39-977Z
./memory/backup/ltm.json.backup-2026-03-23T12-22-54-141Z
./memory/backup/ltm.json.backup-2026-03-23T12-36-27-682Z
./memory/backup/ltm.json.backup-2026-03-23T12-49-39-977Z
./memory/backup/mtm.json.backup-2026-03-23T12-22-54-141Z
./memory/backup/mtm.json.backup-2026-03-23T12-36-27-682Z
./memory/backup/mtm.json.backup-2026-03-23T12-49-39-977Z
./memory/backup/singularity.json.backup-2026-03-23T12-22-54-141Z
./memory/backup/singularity.json.backup-2026-03-23T12-36-27-682Z
./memory/backup/singularity.json.backup-2026-03-23T12-49-39-977Z
./memory/backup/stm.json.backup-2026-03-23T12-22-54-141Z
./memory/backup/stm.json.backup-2026-03-23T12-36-27-682Z
./memory/backup/stm.json.backup-2026-03-23T12-49-39-977Z
./memory/backup/system_state.json.backup-2026-03-23T12-22-54-141Z
./memory/backup/system_state.json.backup-2026-03-23T12-36-27-682Z
./memory/backup/system_state.json.backup-2026-03-23T12-49-39-977Z
./node_modules/.pnpm/@opentelemetry+api@1.9.1
./node_modules/.pnpm/@opentelemetry+api@1.9.1/node_modules/@opentelemetry
./node_modules/.pnpm/@opentelemetry+core@2.6.1_@opentelemetry+api@1.9.1
./node_modules/.pnpm/@opentelemetry+core@2.6.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry
./node_modules/.pnpm/@opentelemetry+resources@2.6.1_@opentelemetry+api@1.9.1
./node_modules/.pnpm/@opentelemetry+resources@2.6.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry
./node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.6.1_@opentelemetry+api@1.9.1
./node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.6.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry
./node_modules/.pnpm/@opentelemetry+sdk-trace-web@2.6.1_@opentelemetry+api@1.9.1
./node_modules/.pnpm/@opentelemetry+sdk-trace-web@2.6.1_@opentelemetry+api@1.9.1/node_modules/@opentelemetry
./node_modules/.pnpm/@opentelemetry+semantic-conventions@1.40.0
./node_modules/.pnpm/@opentelemetry+semantic-conventions@1.40.0/node_modules/@opentelemetry
./node_modules/.pnpm/core-util-is@1.0.2/node_modules/core-util-is/float.patch
./node_modules/.pnpm/node_modules/@opentelemetry
./node_modules/.pnpm/vitest@4.1.1_@opentelemetry+api@1.9.1_@types+node@25.5.0_@vitest+browser-playwright@4.1_402750081a0eb862733f9a599cb31063
./node_modules/.pnpm/vitest@4.1.1_@opentelemetry+api@1.9.1_@types+node@25.5.0_@vitest+browser-playwright@4.1_402750081a0eb862733f9a599cb31063/node_modules/@opentelemetry
./node_modules/.pnpm/vitest@4.1.2_@opentelemetry+api@1.9.1_@types+node@25.5.0_@vitest+browser-playwright@4.1_1202c9a508990b03c89eb33315907e7f
./node_modules/.pnpm/vitest@4.1.2_@opentelemetry+api@1.9.1_@types+node@25.5.0_@vitest+browser-playwright@4.1_1202c9a508990b03c89eb33315907e7f/node_modules/@opentelemetry
./proof_packs/ORCHESTRATOR_FIXES_2026-03-23_1007_641001554/10_DIFF_FILES.diff
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/03_BACKUP_SOURCE_SEARCH.md
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_find.txt
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/backup_rg.txt
./proof_packs/POST_REVERT_ARCHIVE_RESOLUTION_2026-03-28_1029_e88264039/recovered_frontend_supervision_context.md
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/frontend_supervision.patch
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/governance_and_tooling.diff
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/package.diff
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src-tauri.diff
./proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/src.diff
./reports/instructions-seal/20260214-011649/06_DIFF.patch
./runs/POST_PROD_OPS_PHASE3_CONTINUOUS_DIFF_20260223_175600/PROOF/telemetry_drift_analysis.json
./runs/_loop/proofs/post_stop_130_20260227_1822_c955b541c/git_show_patch.diff
./scripts/core/lib/telemetry.sh
./scripts/setup/TITANE_PRE_MIGRATION_BACKUP.sh
./src-tauri/icons/backup_icons_20251128_145500
./src-tauri/src/api/telemetry_api.rs
./src-tauri/src/devtools/telemetry.rs
./src-tauri/src/memory/telemetry.rs
./src-tauri/src/monitoring/telemetry
./src-tauri/src/persistence/backup.rs
./src-tauri/src/time/backup_engine.rs
./src/services/backup
./src/services/backup/AutoBackupService.ts
./src/services/telemetry
./src/services/telemetry/__tests__/useProductionHealthTelemetry.test.ts
./src/services/telemetry/useProductionHealthTelemetry.ts
./src/types/telemetry.ts
./src/utils/advancedTelemetry.ts
./src/utils/telemetryEngine.ts
./titane_local_training/backup_info.txt

## rg POST_SEALED_SENTINEL|POST_REVERT_MONITORING|archive loss|backup optional|sentinel baseline|monitoring rules
proof_packs/CLEANUP_ARCHIVE_2026-03-22_1544_b9aae0cc8/01_BOOTSTRAP.md:39:git log -20 --oneline → latest: POST_SEALED_SENTINEL v28.82.0
proof_packs/POST_REVERT_CLOSURE_TRANSITION_2026-03-28_1038_e88264039/06_GATES_REPORT.md:11:- G_POST_REVERT_MONITORING_DEFINED: PASS
proof_packs/POST_REVERT_CLOSURE_TRANSITION_2026-03-28_1038_e88264039/04_REGIME_TRANSITION.md:4:New regime: POST_REVERT_MONITORING
proof_packs/POST_REVERT_CLOSURE_TRANSITION_2026-03-28_1038_e88264039/00_EXEC_SUMMARY.md:7:- Defined monitoring rules and preserved rollback limitation
docs/90_release/PRODUCTION_RELEASE_v28.7.0.md:57:- `proof_packs/POST_SEALED_SENTINEL_28.7.0_2026-03-21_1655_9cce755f3/` — SEALED_SENTINEL_CLEAR
docs/90_release/PRODUCTION_RELEASE_v28.12.0.md:44:- `proof_packs/POST_SEALED_SENTINEL_28.12.0_2026-03-21_1847_f355c441e/` — SEALED_SENTINEL_CLEAR
docs/90_release/PRODUCTION_RELEASE_v28.6.0.md:59:`proof_packs/POST_SEALED_SENTINEL_2026-03-21_1538_fb1e67a88/` — 11 files, SEALED_SENTINEL_CLEAR  
docs/90_release/PRODUCTION_RELEASE_v28.13.0.md:50:- `proof_packs/POST_SEALED_SENTINEL_28.13.0_2026-03-21/` — SEALED_SENTINEL_CLEAR
docs/90_release/PRODUCTION_RELEASE_v28.11.0.md:44:- `proof_packs/POST_SEALED_SENTINEL_28.11.0_2026-03-21_1829_ddb6a0f5e/` — SEALED_SENTINEL_CLEAR
docs/90_release/PRODUCTION_RELEASE_v28.9.0.md:49:- `proof_packs/POST_SEALED_SENTINEL_28.9.0_2026-03-21_c4b74e201/` — SEALED_SENTINEL_CLEAR
docs/90_release/PRODUCTION_RELEASE_v28.10.0.md:45:- `proof_packs/POST_SEALED_SENTINEL_28.10.0_2026-03-21_1806_c5c5c839e/` — SEALED_SENTINEL_CLEAR
docs/90_release/PRODUCTION_RELEASE_v28.15.0.md:48:- `proof_packs/POST_SEALED_SENTINEL_28.15.0_2026-03-21/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_SEALED_SENTINEL_STEADY_2026-03-28_1058_e88264039/02_PREVIOUS_PACKS_READ.md:78:- Defined monitoring rules and preserved rollback limitation
proof_packs/POST_SEALED_SENTINEL_STEADY_2026-03-28_1058_e88264039/02_PREVIOUS_PACKS_READ.md:95:New regime: POST_REVERT_MONITORING
proof_packs/POST_SEALED_SENTINEL_STEADY_2026-03-28_1058_e88264039/02_PREVIOUS_PACKS_READ.md:102:### 05_POST_REVERT_MONITORING_RULES.md
proof_packs/POST_SEALED_SENTINEL_STEADY_2026-03-28_1058_e88264039/02_PREVIOUS_PACKS_READ.md:122:- G_POST_REVERT_MONITORING_DEFINED: PASS
proof_packs/POST_SEALED_SENTINEL_STEADY_2026-03-28_1058_e88264039/02_PREVIOUS_PACKS_READ.md:144:## POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039
proof_packs/POST_SEALED_SENTINEL_STEADY_2026-03-28_1058_e88264039/02_PREVIOUS_PACKS_READ.md:154:POST_REVERT_MONITORING_CLEAR_BACKUP_OPTIONAL
proof_packs/POST_SEALED_SENTINEL_STEADY_2026-03-28_1058_e88264039/02_PREVIOUS_PACKS_READ.md:156:## POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039
proof_packs/POST_SEALED_SENTINEL_STEADY_2026-03-28_1058_e88264039/02_PREVIOUS_PACKS_READ.md:176:- Regime: POST_SEALED_SENTINEL (promotion from POST_REVERT_MONITORING)
proof_packs/POST_SEALED_SENTINEL_STEADY_2026-03-28_1058_e88264039/02_PREVIOUS_PACKS_READ.md:180:POST_SEALED_SENTINEL_CLEAR_BACKUP_OPTIONAL
proof_packs/AUDIT_v28.85.0_GAP_2026-03-22/VERDICT.md:30:| HEAD | 61a4407e3 (POST_SEALED_SENTINEL v28.84.0) |
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/09_MONITORING_RULES.md:7:- Future monitoring prompts start from POST_SEALED_SENTINEL state.
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/13_VERDICT.md:1:POST_SEALED_SENTINEL_CLEAR_BACKUP_OPTIONAL
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:54:?? proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:259:## rg supervision|telemetry|archive loss|POST_REVERT_MONITORING|POST_SEALED_TRIGGERED|POST_SEALED_SENTINEL
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:275:proof_packs/POST_REVERT_CLOSURE_TRANSITION_2026-03-28_1038_e88264039/06_GATES_REPORT.md:11:- G_POST_REVERT_MONITORING_DEFINED: PASS
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:282:proof_packs/POST_REVERT_CLOSURE_TRANSITION_2026-03-28_1038_e88264039/04_REGIME_TRANSITION.md:4:New regime: POST_REVERT_MONITORING
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3368:docs/90_release/PRODUCTION_RELEASE_v28.12.0.md:44:- `proof_packs/POST_SEALED_SENTINEL_28.12.0_2026-03-21_1847_f355c441e/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3395:docs/90_release/PRODUCTION_RELEASE_v28.11.0.md:44:- `proof_packs/POST_SEALED_SENTINEL_28.11.0_2026-03-21_1829_ddb6a0f5e/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3401:proof_packs/AUDIT_v28.85.0_GAP_2026-03-22/VERDICT.md:30:| HEAD | 61a4407e3 (POST_SEALED_SENTINEL v28.84.0) |
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3403:docs/90_release/PRODUCTION_RELEASE_v28.15.0.md:48:- `proof_packs/POST_SEALED_SENTINEL_28.15.0_2026-03-21/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3405:docs/90_release/PRODUCTION_RELEASE_v28.9.0.md:49:- `proof_packs/POST_SEALED_SENTINEL_28.9.0_2026-03-21_c4b74e201/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3408:docs/90_release/PRODUCTION_RELEASE_v28.10.0.md:45:- `proof_packs/POST_SEALED_SENTINEL_28.10.0_2026-03-21_1806_c5c5c839e/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3419:docs/90_release/PRODUCTION_RELEASE_v28.6.0.md:59:`proof_packs/POST_SEALED_SENTINEL_2026-03-21_1538_fb1e67a88/` — 11 files, SEALED_SENTINEL_CLEAR  
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3420:docs/90_release/PRODUCTION_RELEASE_v28.13.0.md:50:- `proof_packs/POST_SEALED_SENTINEL_28.13.0_2026-03-21/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3430:docs/90_release/PRODUCTION_RELEASE_v28.7.0.md:57:- `proof_packs/POST_SEALED_SENTINEL_28.7.0_2026-03-21_1655_9cce755f3/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3514:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:10:- Archive failure: untracked frontend supervision cluster content was not preserved (frontend_supervision.patch is empty)
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3515:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:34:- frontend_supervision.patch is EMPTY; untracked frontend files were removed and cannot be rehydrated from this proof pack.
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3516:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:49:- Preserved context-only plan (if present) in recovered_frontend_supervision_context.md
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3517:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:183:- recovered_frontend_supervision_context.md (plan document)
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3518:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:186:- A backup or copy of the original untracked frontend supervision/telemetry files.
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3519:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:218:Old regime: POST_SEALED_TRIGGERED
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3520:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:219:New regime: POST_REVERT_MONITORING
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3521:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:226:### 05_POST_REVERT_MONITORING_RULES.md
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3522:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:246:- G_POST_REVERT_MONITORING_DEFINED: PASS
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3523:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:257:- Lost untracked frontend supervision/telemetry cluster remains unrecoverable from existing proof packs
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3550:proof_packs/CLEANUP_ARCHIVE_2026-03-22_1544_b9aae0cc8/01_BOOTSTRAP.md:39:git log -20 --oneline → latest: POST_SEALED_SENTINEL v28.82.0
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/12_VERDICT.md:1:POST_REVERT_MONITORING_CLEAR_BACKUP_OPTIONAL
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/02_PREVIOUS_PACKS_READ.md:78:- Defined monitoring rules and preserved rollback limitation
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/02_PREVIOUS_PACKS_READ.md:95:New regime: POST_REVERT_MONITORING
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/02_PREVIOUS_PACKS_READ.md:102:### 05_POST_REVERT_MONITORING_RULES.md
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/02_PREVIOUS_PACKS_READ.md:122:- G_POST_REVERT_MONITORING_DEFINED: PASS
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/02_PREVIOUS_PACKS_READ.md:144:## POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/02_PREVIOUS_PACKS_READ.md:154:POST_REVERT_MONITORING_CLEAR_BACKUP_OPTIONAL
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:202:- Defined monitoring rules and preserved rollback limitation
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:219:New regime: POST_REVERT_MONITORING
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:226:### 05_POST_REVERT_MONITORING_RULES.md
proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:246:- G_POST_REVERT_MONITORING_DEFINED: PASS
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/03_SENTINEL_BASELINE.md:11:- Regime: POST_SEALED_SENTINEL (promotion from POST_REVERT_MONITORING)
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/02_AUTHORITY_MAP.md:7:- Monitoring authority: PROVEN_STATIC (latest POST_REVERT_MONITORING_SENTINEL pack)
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:54:?? proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:56:?? proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:438:## rg POST_REVERT_MONITORING|POST_SEALED_SENTINEL|archive loss|backup optional|sentinel
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:439:proof_packs/CLEANUP_ARCHIVE_2026-03-22_1544_b9aae0cc8/01_BOOTSTRAP.md:39:git log -20 --oneline → latest: POST_SEALED_SENTINEL v28.82.0
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:440:proof_packs/POST_REVERT_CLOSURE_TRANSITION_2026-03-28_1038_e88264039/06_GATES_REPORT.md:11:- G_POST_REVERT_MONITORING_DEFINED: PASS
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:441:proof_packs/POST_REVERT_CLOSURE_TRANSITION_2026-03-28_1038_e88264039/04_REGIME_TRANSITION.md:4:New regime: POST_REVERT_MONITORING
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:446:docs/90_release/PRODUCTION_RELEASE_v28.7.0.md:57:- `proof_packs/POST_SEALED_SENTINEL_28.7.0_2026-03-21_1655_9cce755f3/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:447:docs/90_release/PRODUCTION_RELEASE_v28.6.0.md:59:`proof_packs/POST_SEALED_SENTINEL_2026-03-21_1538_fb1e67a88/` — 11 files, SEALED_SENTINEL_CLEAR  
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:448:docs/90_release/PRODUCTION_RELEASE_v28.13.0.md:50:- `proof_packs/POST_SEALED_SENTINEL_28.13.0_2026-03-21/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:503:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:54:?? proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:504:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:259:## rg supervision|telemetry|archive loss|POST_REVERT_MONITORING|POST_SEALED_TRIGGERED|POST_SEALED_SENTINEL
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:505:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:275:proof_packs/POST_REVERT_CLOSURE_TRANSITION_2026-03-28_1038_e88264039/06_GATES_REPORT.md:11:- G_POST_REVERT_MONITORING_DEFINED: PASS
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:506:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:282:proof_packs/POST_REVERT_CLOSURE_TRANSITION_2026-03-28_1038_e88264039/04_REGIME_TRANSITION.md:4:New regime: POST_REVERT_MONITORING
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:507:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3368:docs/90_release/PRODUCTION_RELEASE_v28.12.0.md:44:- `proof_packs/POST_SEALED_SENTINEL_28.12.0_2026-03-21_1847_f355c441e/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:508:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3395:docs/90_release/PRODUCTION_RELEASE_v28.11.0.md:44:- `proof_packs/POST_SEALED_SENTINEL_28.11.0_2026-03-21_1829_ddb6a0f5e/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:509:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3401:proof_packs/AUDIT_v28.85.0_GAP_2026-03-22/VERDICT.md:30:| HEAD | 61a4407e3 (POST_SEALED_SENTINEL v28.84.0) |
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:510:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3403:docs/90_release/PRODUCTION_RELEASE_v28.15.0.md:48:- `proof_packs/POST_SEALED_SENTINEL_28.15.0_2026-03-21/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:511:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3405:docs/90_release/PRODUCTION_RELEASE_v28.9.0.md:49:- `proof_packs/POST_SEALED_SENTINEL_28.9.0_2026-03-21_c4b74e201/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:512:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3408:docs/90_release/PRODUCTION_RELEASE_v28.10.0.md:45:- `proof_packs/POST_SEALED_SENTINEL_28.10.0_2026-03-21_1806_c5c5c839e/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:513:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3419:docs/90_release/PRODUCTION_RELEASE_v28.6.0.md:59:`proof_packs/POST_SEALED_SENTINEL_2026-03-21_1538_fb1e67a88/` — 11 files, SEALED_SENTINEL_CLEAR  
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:514:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3420:docs/90_release/PRODUCTION_RELEASE_v28.13.0.md:50:- `proof_packs/POST_SEALED_SENTINEL_28.13.0_2026-03-21/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:515:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3430:docs/90_release/PRODUCTION_RELEASE_v28.7.0.md:57:- `proof_packs/POST_SEALED_SENTINEL_28.7.0_2026-03-21_1655_9cce755f3/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:516:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3514:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:10:- Archive failure: untracked frontend supervision cluster content was not preserved (frontend_supervision.patch is empty)
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:517:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3515:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:34:- frontend_supervision.patch is EMPTY; untracked frontend files were removed and cannot be rehydrated from this proof pack.
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:518:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3516:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:49:- Preserved context-only plan (if present) in recovered_frontend_supervision_context.md
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:519:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3517:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:183:- recovered_frontend_supervision_context.md (plan document)
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:520:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3518:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:186:- A backup or copy of the original untracked frontend supervision/telemetry files.
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:521:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3519:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:218:Old regime: POST_SEALED_TRIGGERED
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:522:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3520:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:219:New regime: POST_REVERT_MONITORING
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:523:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3521:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:226:### 05_POST_REVERT_MONITORING_RULES.md
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:524:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3522:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:246:- G_POST_REVERT_MONITORING_DEFINED: PASS
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:525:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3523:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:257:- Lost untracked frontend supervision/telemetry cluster remains unrecoverable from existing proof packs
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:526:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/01_BOOTSTRAP.md:3550:proof_packs/CLEANUP_ARCHIVE_2026-03-22_1544_b9aae0cc8/01_BOOTSTRAP.md:39:git log -20 --oneline → latest: POST_SEALED_SENTINEL v28.82.0
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:527:docs/90_release/PRODUCTION_RELEASE_v28.10.0.md:45:- `proof_packs/POST_SEALED_SENTINEL_28.10.0_2026-03-21_1806_c5c5c839e/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:528:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/12_VERDICT.md:1:POST_REVERT_MONITORING_CLEAR_BACKUP_OPTIONAL
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:529:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:219:New regime: POST_REVERT_MONITORING
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:530:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:226:### 05_POST_REVERT_MONITORING_RULES.md
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:531:proof_packs/POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039/02_PREVIOUS_PACKS_READ.md:246:- G_POST_REVERT_MONITORING_DEFINED: PASS
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:532:docs/90_release/PRODUCTION_RELEASE_v28.9.0.md:49:- `proof_packs/POST_SEALED_SENTINEL_28.9.0_2026-03-21_c4b74e201/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:535:proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/02_PREVIOUS_PACKS_READ.md:95:New regime: POST_REVERT_MONITORING
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:536:proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/02_PREVIOUS_PACKS_READ.md:102:### 05_POST_REVERT_MONITORING_RULES.md
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:537:proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/02_PREVIOUS_PACKS_READ.md:122:- G_POST_REVERT_MONITORING_DEFINED: PASS
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:538:proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/02_PREVIOUS_PACKS_READ.md:144:## POST_REVERT_MONITORING_SENTINEL_2026-03-28_1044_e88264039
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:539:proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/02_PREVIOUS_PACKS_READ.md:154:POST_REVERT_MONITORING_CLEAR_BACKUP_OPTIONAL
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:540:proof_packs/AUDIT_v28.85.0_GAP_2026-03-22/VERDICT.md:30:| HEAD | 61a4407e3 (POST_SEALED_SENTINEL v28.84.0) |
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:571:docs/90_release/PRODUCTION_RELEASE_v28.12.0.md:44:- `proof_packs/POST_SEALED_SENTINEL_28.12.0_2026-03-21_1847_f355c441e/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:574:docs/90_release/PRODUCTION_RELEASE_v28.11.0.md:44:- `proof_packs/POST_SEALED_SENTINEL_28.11.0_2026-03-21_1829_ddb6a0f5e/` — SEALED_SENTINEL_CLEAR
proof_packs/POST_SEALED_SENTINEL_PROMOTION_2026-03-28_1051_e88264039/01_BOOTSTRAP.md:576:docs/90_release/PRODUCTION_RELEASE_v28.15.0.md:48:- `proof_packs/POST_SEALED_SENTINEL_28.15.0_2026-03-21/` — SEALED_SENTINEL_CLEAR

