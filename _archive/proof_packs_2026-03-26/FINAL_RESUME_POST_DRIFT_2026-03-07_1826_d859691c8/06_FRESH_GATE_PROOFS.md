# 06 Fresh Gate Proofs

Normalized gate outcomes from Phase 3 rerun:

| Gate | Source command | Exit code | Current status | Affected statuses | Closed or blocking |
|---|---|---|---|---|---|
| `G_PRE_DEPLOYMENT_CHECK` | `timeout 360 bash scripts/verify/pre-deployment-check.sh --quick` | `2` | `BLOCKED_GATES` | `FINAL_100_SCOPE`, `SEAL_ELIGIBILITY`, `PROD_BUILD_STATUS`, `PROD_DEPLOY_STATUS` | `STILL_BLOCKING` |
| `G_VERIFY_PREPROD_BEFORE_DEV` | `timeout 360 bash scripts/verify/verify-preprod.sh` | `124` | `BLOCKED_ENV` | `FINAL_100_SCOPE`, `SEAL_ELIGIBILITY`, `PROD_BUILD_STATUS`, `PROD_DEPLOY_STATUS` | `STILL_BLOCKING` |

Evidence:

- `05_GATE_EXECUTION.log`
- `raw/21_gate_pre_deployment.log`
- `raw/21_gate_pre_deployment.exit`
- `raw/22_gate_verify_preprod.log`
- `raw/22_gate_verify_preprod.exit`
- `raw/23_gate_status.env`
- `raw/25_before_dev_test_tail.txt`

Supporting normalized artifacts:

- `raw/final_gate_counts.env`
- `raw/final_gate_matrix.tsv`
- `raw/final_gate_status.env`

