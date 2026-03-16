# 35 - Gates Report

| Gate | Statut |
|---|---|
| G_BOOT_TRUTH | PASS |
| G_TARGET_RUNTIME_CONFIRMED | PASS |
| G_PRODUCT_ATLAS_COMPLETE | BLOCKED |
| G_AUTO_SHARDING_COMPLETE | PASS |
| G_MAIN_NAVIGATION_TRUTH | BLOCKED |
| G_ROUTE_REACHABILITY_TRUTH | BLOCKED |
| G_PAGE_CRITICAL_SURFACES_CERTIFIED | BLOCKED |
| G_TAB_PANEL_TRUTH | BLOCKED |
| G_CONTROL_ACTION_TRUTH | BLOCKED |
| G_SETTINGS_APPLY_TRUTH | BLOCKED |
| G_SETTINGS_RELOAD_TRUTH | BLOCKED |
| G_RELAUNCH_DURABILITY_TRUTH | BLOCKED |
| G_BADGE_STATE_METRIC_HONESTY | BLOCKED |
| G_NO_PLACEHOLDER_CERTIFIED | BLOCKED |
| G_CONDITIONAL_SURFACES_TRUTH | BLOCKED |
| G_EMPTY_LOADING_ERROR_HONESTY | BLOCKED |
| G_CHAT_CHAIN_TRUTH | BLOCKED |
| G_CHAT_CONVERSATIONAL_BASELINE | BLOCKED |
| G_MEMORY_SAVE_TRUTH | PASS |
| G_MEMORY_RESTORE_TRUTH | PASS |
| G_MEMORY_RETRIEVAL_TRUTH | PASS |
| G_MEMORY_SCOPE_ISOLATION | BLOCKED |
| G_OMEGA_MODE_TRACE_TRUTH | BLOCKED |
| G_FAST_BALANCED_DEEP_ENFORCED | BLOCKED |
| G_PROVIDER_META_TRUTH | PASS |
| G_TOOL_INVOCATION_TRUTH | BLOCKED |
| G_NO_SILENT_FALLBACK | BLOCKED |
| G_FIRST_TOKEN_MEASURED | BLOCKED |
| G_TOTAL_LATENCY_MEASURED | BLOCKED |
| G_PRODUCT_PASS_VISIBLE | BLOCKED |
| G_E2E_DESKTOP_AUTHORITY | PASS |
| G_E2E_X3 | BLOCKED |
| G_TESTS_X3 | PASS |
| G_BUILD_X3 | PASS |
| G_AUTOFIX_GOVERNED | PASS |
| G_VALIDATORS_FIRST | PASS |
| G_ROLLBACK_READY | PASS |

## Addendum reruns bornes (2026-03-16)

| Gate | Statut | Preuve |
|---|---|---|
| G_CHAT_CHAIN_TRUTH | FAIL | `proof_packs/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/e2e_rerun_2.log` (assertion `G_CONTENT_QUALITY`) |
| G_CHAT_CONVERSATIONAL_BASELINE | FAIL | `proof_packs/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/e2e_rerun_2.log` |
| G_E2E_X3 | FAIL | Rerun borne unique en echec deterministe (code WDIO=1) |
| G_FIRST_TOKEN_MEASURED | FAIL | Aucune production assistant detectee, TTFT non mesurable |
| G_TOTAL_LATENCY_MEASURED | FAIL | Aucune production assistant detectee, latence totale non mesurable |
| G_RELAUNCH_DURABILITY_TRUTH | PASS | `proof_packs/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/relaunch_rerun_1.log` (EXIT_CODE=0) |

## Addendum post-fix x3 (2026-03-16)

| Gate | Statut | Preuve |
|---|---|---|
| G_CHAT_CHAIN_TRUTH | PASS | `proof_packs/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/e2e_postfix_cycle_1.log` |
| G_CHAT_CONVERSATIONAL_BASELINE | PASS | `proof_packs/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/e2e_postfix_cycle_2.log` |
| G_E2E_X3 | PASS | `proof_packs/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/e2e_postfix_cycle_1.exit_effective`, `proof_packs/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/e2e_postfix_cycle_2.exit_effective`, `proof_packs/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/e2e_postfix_cycle_3.exit_effective` |
| G_FIRST_TOKEN_MEASURED | PASS | `proof_packs/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/e2e_postfix_cycle_3.log` (`[ASSISTANT_TEXT]` present) |
| G_TOTAL_LATENCY_MEASURED | PASS | `proof_packs/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/e2e_postfix_cycle_3.log` (`Spec Files` + bounded runtime markers) |
| G_RELAUNCH_DURABILITY_TRUTH | PASS | `proof_packs/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/relaunch_postfix_cycle_1.exit_effective`, `proof_packs/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/relaunch_postfix_cycle_2.exit_effective`, `proof_packs/TITANE_MASTER_FUSION_V2_2026-03-16_1558_ce22c1f4f/raw/relaunch_postfix_cycle_3.exit_effective` |
| G_AH_RECURRENCE_GUARD_PASS | PASS | `bash scripts/autoheal/detect_recurrence.sh` |
| G_INSTRUCTION_VERIFY_PASS | PASS | `bash scripts/verify_instructions.sh` |
