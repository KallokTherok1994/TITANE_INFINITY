# 09 Gates Report

- `G_CURRENT_VALIDATION: PASS`
  - Evidence: `proof_packs/preprod_final_2026-03-15_2050_5869384/09_CURRENT_VALIDATION.log`
  - Marker: `=== CURRENT VALIDATION RETRY2 END rc=0 ===`
- `G_TESTS_X3: PASS`
  - Evidence: `proof_packs/preprod_final_2026-03-15_2050_5869384/10_TESTS_X3.log`
  - Marker: `=== run_x3 SUMMARY: PASS=3/3 FAIL=0/3 ===`
- `G_E2E_ONLINE_CHAT_PROOF: PASS`
  - Evidence: `proof_packs/preprod_final_2026-03-15_2050_5869384/e2e_online_chat_retry4.log`
  - Marker: `[E2E_CHAT_PROOF] STATUS=0`
- `G_BUILD_X3: FAIL`
  - Evidence: `proof_packs/preprod_final_2026-03-15_2050_5869384/11_BUILD_X3.log`
  - Marker: `--- RUN 1/3: FAIL (exit 124) ---`
- `G_BUILD_SINGLE_EXTENDED: PASS`
  - Evidence: `proof_packs/preprod_final_2026-03-15_2050_5869384/14_BUILD_SINGLE_EXTENDED.log`
  - Marker: `Finished 3 bundles at:`
- `G_AH_RULE_CAPTURED_FOR_EACH_FIX: PASS`
  - Evidence: `scripts/autoheal/autoheal_rules.jsonl`
  - Entries: `AH-CHAT-AUDIT-006`, `AH-CHAT-AUDIT-007`
- `G_AH_RECURRENCE_GUARD_PASS: PASS`
  - Evidence: `proof_packs/preprod_final_2026-03-15_2050_5869384/12_AUTOHEAL_RECURRENCE_RERUN.log`
- `G_VERIFY_INSTRUCTIONS: PASS`
  - Evidence: `proof_packs/preprod_final_2026-03-15_2050_5869384/13_VERIFY_INSTRUCTIONS_RERUN.log`
  - Marker: `SUMMARY: PASS=20 FAIL=0`
- `G_PROD_TOKEN_AUTHORIZATION: BLOCKED_APPROVAL`
  - Evidence: `proof_packs/preprod_final_2026-03-15_2050_5869384/14_PROD_TOKEN_CHECK.log`
  - Marker: `BUILD_TOKEN=FAIL`, `DEPLOY_TOKEN=FAIL`

## Gate Decision

- `VERDICT_GATE: FAIL`
- Stopline reason:
  - mandatory build profile x3 gate failed (`exit 124` timeout on run 1).
  - PROD authorization tokens absent.
