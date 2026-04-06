# Scope

- Session: `PROD_BUILD_DEPLOY_RETRY_2026-03-07_1417_757ae4d4c9`
- Baseline expected: `757ae4d4c`
- Objective: fix P3 scan scope without weakening security, then rerun governed production build+deploy.
- Target gate/script: `scripts/check_forbidden_files.sh` (active scanner used by `runtime/stable/build.sh`).

## Execution Chain

- Security scope fix: applied.
- Build: executed via `runtime/stable/build.sh`.
- Deploy: executed via `scripts/deployment/certified-deploy.sh`.
- Post-deploy checks: executed (artifact availability, version integrity, smoke runtime).
