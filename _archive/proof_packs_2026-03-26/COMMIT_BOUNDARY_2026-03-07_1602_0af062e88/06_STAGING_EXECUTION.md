# PHASE 4 - MINIMAL EXACT STAGING EXECUTION

Bucket executed:
- Bucket A only.

Intended staged scope:
- `proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88/**`
- `registry/proofpack-index.jsonl`
- `registry/heavy-artifacts-manifest.jsonl`
- `registry/closure-events.jsonl`

Actual staged proof:
- `raw/staged_bucket_A_names.txt`

Contamination check:
- `raw/staged_bucket_A_contamination_check.txt`
- Result: `CONTAMINATION_CHECK:PASS`

Execution result:
- `raw/staging_bucket_A_result.txt` => `STAGE_BUCKET_A:PASS`

Rollback command (exact):
```bash
git restore --staged \
	proof_packs/TREE_CLOSURE_2026-03-07_1321_0af062e88 \
	registry/proofpack-index.jsonl \
	registry/heavy-artifacts-manifest.jsonl \
	registry/closure-events.jsonl
```

