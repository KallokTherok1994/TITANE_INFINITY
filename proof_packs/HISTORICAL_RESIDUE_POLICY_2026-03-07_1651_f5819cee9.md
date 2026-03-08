# HISTORICAL RESIDUE POLICY

Timestamp: 2026-03-07T16:51:00-05:00
Source lane: proof_packs/HISTORICAL_PROOFPACK_GOVERNANCE_2026-03-07_1646_f5819cee9/

## Scope

This policy governs untracked historical proof-pack residue under `proof_packs/` only.
No runtime/frontend/backend source is in scope.

## Policy Matrix

- `NON_BLOCKING_LOCAL_ONLY`: Historical proof-pack residue may remain untracked locally when indexed in `registry/proofpack-index.jsonl` and discoverable through policy/manifest registries.
- `NEEDS_GOVERNANCE_BEFORE_PUSH`: Any untracked proof-pack directory absent from index governance remains push-limiting until indexed or explicitly classified as future-boundary.
- `FUTURE_BOUNDARY_NON_BLOCKING`: In-progress governance lane directories matching `proof_packs/HISTORICAL_PROOFPACK_GOVERNANCE_*` are non-blocking for this cycle when documented in local-only policy registry.
- `GOVERNED_BUT_NOT_PUSH_READY`: Heavy artifacts can remain local-only while governed, but pointer planning must be explicit.

## Non-Destructive Rule

Historical residue is not deleted in this lane.
Governance is append-only and rollback-safe.

## Rollback

- `git restore -- registry/proofpack-index.jsonl registry/heavy-artifacts-manifest.jsonl registry/local-only-historical-residue.jsonl`
- `rm proof_packs/HISTORICAL_RESIDUE_POLICY_2026-03-07_1651_f5819cee9.md`
