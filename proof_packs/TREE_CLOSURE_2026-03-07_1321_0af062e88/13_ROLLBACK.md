# PHASE 13 - ROLLBACK

## A) Objective
Provide exact rollback commands for TREE_CLOSURE lane artifacts.

## B) Rollback - Active Pack Docs
```bash
git restore -- \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/00_EXEC_SUMMARY.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/01_BOOTSTRAP.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/02_SCOPE_FREEZE.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/03_DIRTY_TREE_FULL_MAP.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/04_PROOFPACK_COMPLETENESS_AUDIT.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/05_OUTLIER_WEIGHT_CONTROL_AUDIT.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/06_ACTION_ELIGIBILITY_MATRIX.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/07_PATCHSETS_APPLIED.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/08_ARCHIVE_MANIFESTS_AND_INDEXES.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/09_RERUNS_AND_GATES.log \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/10_GLOBAL_SEAL_RECALC.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/11_COMMIT_READINESS_AND_SPLIT_PLAN.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/12_COUNTER_AUDIT.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/13_ROLLBACK.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/14_FINAL_VERDICT.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/VERDICT.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/ROLLBACK.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/ROOT_CAUSE.md \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/NEXT_ACTION.md
```

## C) Rollback - Registry Normalization
```bash
git restore -- registry/proofpack-index.jsonl registry/heavy-artifacts-manifest.jsonl registry/closure-events.jsonl
```

## D) Rollback - Historical Pack Normalization Files
```bash
git restore -- \
	proof_packs/PR_CI_UNBLOCK_2026-03-06_1847_5a48aa005/VERDICT.md \
	proof_packs/PR_CI_UNBLOCK_2026-03-06_1847_5a48aa005/ROLLBACK.md \
	proof_packs/PR_MAIN_SEAL_READINESS_2026-03-06_1752_5a48aa005/VERDICT.md \
	proof_packs/PR_MAIN_SEAL_READINESS_2026-03-06_1752_5a48aa005/ROLLBACK.md \
	proof_packs/UI_E2E_TOTAL_2026-03-06_1646_5a48aa005/VERDICT.md \
	proof_packs/UI_E2E_TOTAL_2026-03-06_1646_5a48aa005/ROLLBACK.md \
	proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/00_EXEC_SUMMARY.md \
	proof_packs/PROD_BUILD_DEPLOY_2026-03-07_1407_757ae4d4c9/00_EXEC_SUMMARY.md \
	proof_packs/PROD_BUILD_DEPLOY_RETRY_2026-03-07_1417_757ae4d4c9/00_EXEC_SUMMARY.md \
	proof_packs/DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c/ARTIFACTS_INDEX.md
```

## E) Safety Note
No `git reset --hard` or destructive deletion is required.

## F) Status
`PASS`

