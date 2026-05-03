# PHASE 2 - FULL HISTORICAL RESIDUE CLASSIFICATION

## Zero-Omission Dataset

- Canonical map (all current untracked paths): `raw/final_historical_untracked_map.tsv`
- Counter-audit completeness:
	- `raw/counter_audit_stats.env`
	- `raw/counter_audit_untracked_not_mapped.txt`
	- `raw/counter_audit_mapped_not_untracked.txt`

## Required Coverage Status

- `untracked_total=1070`
- `mapped_total=1070`
- `untracked_not_mapped=0`
- `mapped_not_untracked=0`
- `unknown_count=0`
- `multi_role_count=0`

## Class Totals

- `LOCAL_ONLY_HISTORICAL=966`
- `FUTURE_BOUNDARY_RESIDUE=101`
- `EXCLUDED_BY_POLICY=2`
- `CANDIDATE_FOR_EXTERNAL_ARCHIVE_POINTER=1`
- `NEEDS_INDEX=0`
- `NEEDS_MANIFEST=0`

## Role Totals

See `raw/final_role_counts.env`.

## Required Per-Path Fields

Every path row in `raw/final_historical_untracked_map.tsv` contains:

- `path`
- `size_bytes`
- `classification`
- `role`
- `reason`
- `authority_source`
- `safe_action`
- `role_reason`
- `top_pack_dir`

