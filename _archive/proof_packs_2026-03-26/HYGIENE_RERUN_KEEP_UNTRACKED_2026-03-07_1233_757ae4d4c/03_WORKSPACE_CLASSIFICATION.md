# 03_WORKSPACE_CLASSIFICATION

A) EXEC_MODE: `LOCAL`

B) SCOPE_RING: `workspace path classification under KEEP_UNTRACKED`

C) RISK: `P1`

D) PLAN (<=7 etapes):
1. Classify all tracked drift paths.
2. Classify all untracked proof paths.
3. Classify all untracked non-proof paths.
4. Produce full per-path table and counts.
5. Determine `WORKSPACE_STATUS`.

E) PROOFS:
- Full table by path:
  - `raw/workspace_classification_full.tsv` (297 lines, header included)
- Class files:
  - `raw/classified_tracked_drift.tsv`
  - `raw/classified_untracked_proof_allowed.tsv`
  - `raw/classified_untracked_nonproof.tsv`
- Counts:
  - `raw/workspace_classification_counts.txt`
  - `tracked_drift_count=0`
  - `untracked_proof_allowed_count=296`
  - `untracked_nonproof_count=0`

Class synthesis:
1. `PROOF_UNTRACKED_ALLOWED`: 296 paths (all under `proof_packs/`).
2. `TRACKED_DRIFT_FORBIDDEN`: 0 paths.
3. `UNTRACKED_PRODUCT_FORBIDDEN`: 0 paths.
4. `UNTRACKED_AMBIGUOUS`: 0 paths (no untracked outside `proof_packs/`).

WORKSPACE_STATUS: `CLEAN_BY_DOCTRINE`

F) ROLLBACK:
- Classification artifacts are read-derived files under this pack only.
