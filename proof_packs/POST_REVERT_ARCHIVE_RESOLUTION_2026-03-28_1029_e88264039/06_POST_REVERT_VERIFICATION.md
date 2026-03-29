# Post-Revert Verification

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
?? proof_packs/POST_SEALED_DRIFT_REVERT_2026-03-28_1016_e88264039/
?? proof_packs/ROUTING_PROOF_UNBLOCK_2026-03-27_e88264039/
?? proof_packs/TERMINAL_CONVERGENCE_REFINER_2026-03-27_0747_e88264039/
?? proof_packs/TRUTH_CONTRACT_SEALER_2026-03-27_2250_e88264039/
?? proof_packs/ULTRA_MASTER_AUDIT_2026-03-16_2032_ce22c1f4f/
?? proof_packs/ZERO_REGRESSION_2026-03-20_1430_7973fbd/
?? proof_packs/ZERO_REGRESSION_AUTO_MODE_2026-03-27_2147_e88264039/
?? scripts/cleanup-console-log.mjs
?? scripts/sync-docs.sh

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

## Version lines
  "version": "28.88.0",
version      = "28.88.0"
