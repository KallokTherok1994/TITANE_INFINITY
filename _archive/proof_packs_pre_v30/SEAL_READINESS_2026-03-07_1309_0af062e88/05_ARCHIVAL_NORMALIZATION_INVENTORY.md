# 05_ARCHIVAL_NORMALIZATION_INVENTORY

STATUS: DONE

UNTRACKED_PROOF_PACKS_INVENTORY:
- Total untracked proof packs: 26
- Packs with VERDICT.md + ROLLBACK.md present: 23
- Packs missing VERDICT.md or ROLLBACK.md: 3

MISSING_VERDICT_OR_ROLLBACK:
- proof_packs/PR_CI_UNBLOCK_2026-03-06_1847_5a48aa005/ (has_verdict=false, has_rollback=false)
- proof_packs/PR_MAIN_SEAL_READINESS_2026-03-06_1752_5a48aa005/ (has_verdict=false, has_rollback=false)
- proof_packs/UI_E2E_TOTAL_2026-03-06_1646_5a48aa005/ (has_verdict=false, has_rollback=false)

SIZE_OUTLIERS:
- proof_packs/DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c/: 5,304,638,959 bytes
- proof_packs/UI_E2E_TOTAL_2026-03-06_1646_5a48aa005/: 164,205,674 bytes
- proof_packs/PROD_ARTIFACT_ALIGNMENT_2026-03-07_1457_757ae4d4c9/: 88,538,972 bytes

NORMALIZATION_IMPACT:
- Archival hygiene is not normalized for full-seal declaration.
- Large outlier packs increase storage/churn risk and should be explicitly scoped.

EVIDENCE:
- raw/untracked_proof_packs_inventory.tsv
- raw/untracked_proof_packs_top10.tsv
