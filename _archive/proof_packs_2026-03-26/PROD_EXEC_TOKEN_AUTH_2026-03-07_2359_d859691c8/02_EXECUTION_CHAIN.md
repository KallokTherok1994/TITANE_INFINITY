# 02 Execution Chain

## Preflight

- `scripts/check_forbidden_files.sh`: `PASS` (`raw/10_check_forbidden_files.log`)
- `scripts/verify/pre-deployment-check.sh --quick`: `PASS` (`raw/11_pre_deployment_quick.log`)
- Summary: `raw/12_preflight_summary.env`

## Production build

- Command executed with both tokens exported.
- Build exit: `0`
- Timing: `00:00:39Z` -> `00:09:00Z`
- Evidence: `raw/20_build.summary.env`, `raw/21_build.log`, `raw/67_build_log_tail.txt`

## Production deploy

- Certified deploy command executed with both tokens exported.
- Deploy exit: `0`
- Timing: `00:09:06Z` -> `00:11:29Z`
- Evidence: `raw/30_deploy.summary.env`, `raw/31_deploy.log`, `raw/68_deploy_log_tail.txt`
