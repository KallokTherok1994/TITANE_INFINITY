# PHASE 03 - DIRTY TREE FULL MAP

## A) Objective
Produce exhaustive, bounded dirty-tree mapping used for closure decisions.

## B) Inputs
- `raw/gate_git_status_short.log`
- `raw/strict_dirty_full_map.tsv`
- `raw/strict_dirty_counts.env`
- `raw/strict_role_counts.env`
- `raw/git_diff_name_only.txt`

## C) Method
Mapped top-level dirty entries to classes and business roles with explicit safe action candidates.

## D) Results
- Class counts:
	- `dirty_class_TRACKED_MODIFIED=13`
	- `dirty_class_UNTRACKED=27`
- Role counts:
	- `role_ACTIVE_PROOF_PACK=1`
	- `role_HISTORICAL_PROOF_PACK=26`
	- `role_RUNTIME_CODE=11`
	- `role_TEST_ARTIFACT=1`
	- `role_INDEX_OR_MANIFEST=1`
- Tracked modified files (13) are listed in `raw/git_diff_name_only.txt` and include runtime/UI/config files, therefore not closure-safe to force-clean.

## E) Status
`PASS`

## F) Rollback
No rollback required for evidence mapping.

