# PHASE 05 - OUTLIER WEIGHT CONTROL AUDIT

## A) Objective
Govern heavy proof artifacts without destructive deletion.

## B) Inputs
- `raw/strict_proofpack_outliers.postpatch.tsv`
- `raw/strict_proofpack_outlier_topfiles.tsv`
- `registry/heavy-artifacts-manifest.jsonl`

## C) Method
Detected outliers in strict scope, indexed them, and applied policy `KEEP_AND_INDEX`.

## D) Results
- Outlier #1:
	- `proof_packs/DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c/`
	- `5304639554` bytes
	- Dominant file: `raw/source_scan_rg.txt` (`5304496482` bytes)
- Outlier #2:
	- `proof_packs/UI_E2E_TOTAL_2026-03-06_1646_5a48aa005/`
	- `164206093` bytes
	- Dominant file: `bootstrap_raw.log` (`154097416` bytes)
- Decision for both: retain local evidence and govern with manifest entries.

## E) Status
`PASS`

## F) Rollback
`git restore -- registry/heavy-artifacts-manifest.jsonl`

