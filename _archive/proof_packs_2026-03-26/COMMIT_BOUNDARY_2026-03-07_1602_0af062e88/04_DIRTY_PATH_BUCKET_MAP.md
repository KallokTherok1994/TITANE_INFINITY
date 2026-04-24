# PHASE 2 - DIRTY PATH BUCKET MAP

Full inventory source:

- `raw/dirty_path_bucket_map.tsv`

Classification completeness:

- Total dirty paths at boundary classification time: `44`
- Map rows: `44`
- Omission: none

Counts:

- `MATCHES_BUCKET_EXACTLY`: `4` (TREE_CLOSURE pack path + 3 registry files)
- `MATCHES_MULTIPLE_BUCKETS`: `0`
- `MATCHES_NO_BUCKET`: `13`
- `EXPLICITLY_EXCLUDED`: `27`
- `UNKNOWN`: `0`

Commit-role allocation:

- `PROOFPACK_BUCKET`: TREE_CLOSURE (stage now), other proof packs (exclude)
- `REGISTRY_BUCKET`: closure manifests (stage now)
- `RUNTIME_BUCKET`: tracked modified runtime/frontend/config paths (block for this boundary)

Safe action resolution:

- `STAGE_NOW`: 4 boundary paths (Bucket A only)
- `EXCLUDE`: 27 non-Bucket-A proof packs
- `BLOCK`: 13 runtime/unplanned tracked paths

Outcome:

- Phase PASS for coverage and deterministic mapping.
