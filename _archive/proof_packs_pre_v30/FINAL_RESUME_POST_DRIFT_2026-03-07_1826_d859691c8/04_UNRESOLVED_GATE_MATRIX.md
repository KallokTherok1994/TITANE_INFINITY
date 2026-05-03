# 04 Unresolved Gate Matrix

Scope rule: include only inherited gates from prior final authority and classify strictly.

| Gate | Prior class | Current class | Proof source | Why it still matters | Command/check needed | Affects statuses |
|---|---|---|---|---|---|---|
| `G_DRIFT_DECISION_KEEP_KEEP` | `CONTRADICTION` (historical) | `ALREADY_SATISFIED_BY_DRIFT_LANE` | `proof_packs/DRIFT_RESOLUTION_2026-03-07_1811_d859691c8/06_DECISION_MATRIX.md`, `.../12_FINAL_VERDICT.md` | Drift blocker must stay frozen and not be reopened without contradiction proof. | Re-check pair diff only for contradiction detection. | `FINAL_100_SCOPE`, `SEAL`, `MAIN`, `PUSH` |
| `G_PRE_DEPLOYMENT_CHECK` | `BLOCKED_GATES` | `STILL_UNRESOLVED_AND_RELEVANT` | `proof_packs/FINAL_100_SCOPE_2026-03-07_1717_d859691c8/raw/50_pre_deployment_check_postfix2_quick.log` | Directly blocked prod-readiness and scope/seal in prior lane. | `bash scripts/verify/pre-deployment-check.sh --quick` | `FINAL_100_SCOPE`, `SEAL`, `PROD_BUILD`, `PROD_DEPLOY` |
| `G_VERIFY_PREPROD_BEFORE_DEV` | `BLOCKED_ENV` | `STILL_UNRESOLVED_AND_RELEVANT` | `proof_packs/FINAL_100_SCOPE_2026-03-07_1717_d859691c8/raw/75_before_dev_failure_tail.txt` | Prior lane shows before-dev wrapper path failure; must be freshly re-evaluated. | `bash scripts/verify/verify-preprod.sh` | `FINAL_100_SCOPE`, `SEAL`, `PROD_BUILD`, `PROD_DEPLOY` |
| `G_MERMAID_ROOT_ALIAS` | `NON_BLOCKING` | `NO_LONGER_RELEVANT` | `proof_packs/FINAL_100_SCOPE_2026-03-07_1717_d859691c8/05_FINAL_GAP_MATRIX.md` | Explicitly non-blocking and unrelated to inherited non-drift prod blockers. | None in this lane. | none |
Execution set for Phase 3 (only these):

1. `G_PRE_DEPLOYMENT_CHECK`
2. `G_VERIFY_PREPROD_BEFORE_DEV`

