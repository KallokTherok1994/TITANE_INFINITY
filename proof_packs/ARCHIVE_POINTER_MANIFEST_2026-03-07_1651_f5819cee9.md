# ARCHIVE POINTER MANIFEST

Timestamp: 2026-03-07T16:51:00-05:00
Source lane: proof_packs/HISTORICAL_PROOFPACK_GOVERNANCE_2026-03-07_1646_f5819cee9/

## Candidate

- `pack_path`: `proof_packs/DOCTRINE_RESOLUTION_PROOF_PACKS_2026-03-07_1225_757ae4d4c/`
- `reason`: Contains one outlier raw artifact above 100 MB; local evidence retained non-destructively.
- `current_policy`: KEEP_LOCAL_AND_PREPARE_EXTERNAL_ARCHIVE_POINTER
- `archive_pointer_status`: POINTER_MANIFEST_REQUIRED
- `hash_status`: NOT_COMPUTED

## Constraint

No external move or deletion is performed in this lane.
This document is a governance pointer placeholder only.

## Rollback

- `git restore -- registry/heavy-artifacts-manifest.jsonl`
- `rm proof_packs/ARCHIVE_POINTER_MANIFEST_2026-03-07_1651_f5819cee9.md`
