# Rollback

## To revert this session's patches:
git restore -- README.md REGISTRY_APPEND.jsonl
git rm -rf proof_packs/POST_PROD_TRUTH_RECONCILIATION_2026-03-21_1448_d15e2a692/

## To revert the pre-existing unpushed commit (d15e2a692):
git reset --soft HEAD~1
# Review and re-stage as needed

## Note: The unpushed commit d15e2a692 (fix(preprod-gate)) should also be pushed
## together with this session's changes.
