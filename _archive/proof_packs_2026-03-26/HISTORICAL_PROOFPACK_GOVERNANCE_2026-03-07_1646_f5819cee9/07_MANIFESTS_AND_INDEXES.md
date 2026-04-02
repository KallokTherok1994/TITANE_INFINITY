# PHASE 5 - MANIFEST / INDEX / LOCAL-ONLY NORMALIZATION

## Updated / Created Governance Artifacts

1. `registry/proofpack-index.jsonl`
- Classification: index authority.
- Scope: canonical proof-pack discoverability.
- Residue behavior: underlying residue remains local/untracked.
- Future boundary intent: no.
- Rollback: `git restore -- registry/proofpack-index.jsonl`
- Ambiguity reduction: removed missing-index gap for two historical packs.

2. `registry/heavy-artifacts-manifest.jsonl`
- Classification: heavy artifact governance.
- Scope: heavy outlier retention and pointer planning metadata.
- Residue behavior: heavy artifact remains local.
- Future boundary intent: no.
- Rollback: `git restore -- registry/heavy-artifacts-manifest.jsonl`
- Ambiguity reduction: explicit pointer-required status for heavy outlier.

3. `registry/local-only-historical-residue.jsonl`
- Classification: local-only policy registry.
- Scope: policy semantics for non-blocking local-only residue and future-boundary holds.
- Residue behavior: local retention explicit and discoverable.
- Future boundary intent: yes (for `HISTORICAL_PROOFPACK_GOVERNANCE_*`).
- Rollback: `git restore -- registry/local-only-historical-residue.jsonl`
- Ambiguity reduction: prevents silent local-only assumptions.

4. `proof_packs/HISTORICAL_RESIDUE_POLICY_2026-03-07_1651_f5819cee9.md`
- Classification: policy declaration artifact.
- Scope: lane-local policy statement.
- Residue behavior: no move/delete.
- Future boundary intent: yes.
- Rollback: remove file.

5. `proof_packs/ARCHIVE_POINTER_MANIFEST_2026-03-07_1651_f5819cee9.md`
- Classification: archive-pointer planning artifact.
- Scope: non-destructive external archive pointer placeholder.
- Residue behavior: heavy artifact kept local.
- Future boundary intent: yes.
- Rollback: remove file.

