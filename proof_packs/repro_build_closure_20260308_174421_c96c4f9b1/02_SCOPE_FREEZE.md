# Scope Freeze

## In Scope
- `scripts/gates/g6-build-reproducibility.sh`
- `proof_packs/repro_build_closure_20260308_174421_c96c4f9b1/**`
- `scripts/autoheal/autoheal_rules.jsonl` (mandatory Rule 10 append)

## Out of Scope
- Functional product features.
- Tauri capability/allowlist expansion.
- Workflow-wide refactors.
- Any unrelated dirty-tree files.

## Constraints
- One dominant root cause only.
- Minimal patch only.
- No destructive cleanup of historical evidence.
