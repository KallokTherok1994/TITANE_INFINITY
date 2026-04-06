# 01 Scope

## Baseline

- Branch: `MAIN`
- Head: `d859691c8`
- Pack root: `proof_packs/PROD_EXEC_TOKEN_AUTH_2026-03-07_2359_d859691c8`

## Allowed execution chain

1. `bash scripts/check_forbidden_files.sh`
2. `timeout 900 bash scripts/verify/pre-deployment-check.sh --quick`
3. `GO_FOR_PROD_BUILD__TITANE_INFINITY=GO_FOR_PROD_BUILD__TITANE_INFINITY GO_FOR_PROD_DEPLOY__TITANE_INFINITY=GO_FOR_PROD_DEPLOY__TITANE_INFINITY TITANE_BUILD_ASSUME_YES=1 ./runtime/stable/build.sh`
4. `GO_FOR_PROD_BUILD__TITANE_INFINITY=GO_FOR_PROD_BUILD__TITANE_INFINITY GO_FOR_PROD_DEPLOY__TITANE_INFINITY=GO_FOR_PROD_DEPLOY__TITANE_INFINITY ./scripts/deployment/certified-deploy.sh --target both --deploy-path deployment/latest --manifest-update`
5. Post-deploy integrity and smoke checks.

## Out of scope

- No drift reopening decision changes.
- No architecture refactor.
- No destructive cleanup.
