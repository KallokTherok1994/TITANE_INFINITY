# PHASE 1 - SCOPE FREEZE

## In Scope

- Historical untracked residue under `proof_packs/**`.
- Governance registries only:
	- `registry/proofpack-index.jsonl`
	- `registry/heavy-artifacts-manifest.jsonl`
	- `registry/local-only-historical-residue.jsonl`
- Rule-10 capture:
	- `scripts/autoheal/autoheal_rules.jsonl`

## Out of Scope

- Bucket A/Bucket C tracked-boundary logic (already proven).
- Runtime/frontend/backend code.
- Destructive deletion or broad archive migration.

## Hard Constraints Applied

- No broad historical proof-pack commit.
- No destructive cleanup.
- No silent assumptions for local-only residue.
- Unknown/ambiguity would stop-the-line (none observed).

