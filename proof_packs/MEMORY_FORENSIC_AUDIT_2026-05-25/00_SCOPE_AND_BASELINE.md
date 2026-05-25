# 00 - Scope And Baseline

## Audit Lock
- Audit: MEMORY_FORENSIC_AUDIT_2026-05-25
- Mode: forensic maximal + certification pack
- Date: 2026-05-25
- Repo: TITANE_INFINITY
- Baseline: local workspace included, not HEAD-only

## Scope
This pack audits the complete memory chain:
- Runtime JSON memory files under `memory/`
- Default knowledge/profile memory files under `data/knowledge_base/default/`
- Frontend memory services, chat memory, prompt injection, and tests
- Backend Rust memory engines and IPC contract exposure
- Governance docs, memory maps, registries, AutoHeal, and gates
- Proof history and current blockers relevant to memory authority

## Baseline Included
The following local changes are part of the certified baseline:
- `scripts/verify/verify_memory_integrity.sh`
- `scripts/autoheal/autoheal_rules.jsonl`
- Existing untracked frontend runtime artifacts are retained and not cleaned.

## Out Of Scope
- No corrective app patch is applied in this pack.
- No runtime Tauri UI/E2E desktop proof is claimed.
- No cleanup of `artifacts/frontend-runtime-prebuild/...`.

## Evidence
- Raw worktree baseline: `raw/00_git_status_short.out.txt`
- Final worktree status should be reviewed alongside `10_FINAL_VERDICT.md`.
