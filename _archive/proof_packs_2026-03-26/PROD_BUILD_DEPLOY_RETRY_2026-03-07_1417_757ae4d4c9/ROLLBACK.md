# Rollback

## Security Scope Fix Rollback

- Requested rollback command:
- `git checkout scripts/security/check_forbidden_files.sh`
- Active scanner file in this repository:
- `git checkout scripts/check_forbidden_files.sh`

## Session Artifact Rollback (Optional)

- Remove this retry proof pack if needed:
- `rm -rf proof_packs/PROD_BUILD_DEPLOY_RETRY_2026-03-07_1417_757ae4d4c9`

## Operational Note

- Deploy ran and updated `deployment/latest/`; any publish rollback should be handled with a dedicated deployment metadata restore step.
