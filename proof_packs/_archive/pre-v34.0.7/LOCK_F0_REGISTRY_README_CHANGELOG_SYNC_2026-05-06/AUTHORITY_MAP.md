# F0 Authority Map

**Lock:** F0  
**Date:** 2026-05-06

| Layer | Authority | Files |
|-------|-----------|-------|
| L1 Kernel | .github/copilot-instructions.md | Rules 1–19 — docs-only F0 stays Rule 1 (minimal patch) |
| L3 Repo-AGENTS | AGENTS.md | F0 = docs-registry agent + QA agent |
| L4 Agent | titane-conductor | Primary executor |
| L5 Validators | verify_readme_changelog_registry_sync.sh, verify_intelligence_seal_prereqs.sh | F0-specific gates |
| L6 Truth | Git HEAD 9a8df5507 (E0), this F0 commit | Runtime proof anchor |

## Agent Used

`titane-conductor` — orchestrateur principal, doc sync scope

## No Runtime Change

F0 is documentation-only. No Rust code, no Tauri capabilities, no IPC commands, no frontend components were modified.

## Scope Boundaries

- IN: docs/, README.md, CHANGELOG.md, RELEASE_SURFACE_INVENTORY.md, scripts/verify/ (new validators), proof_packs/, scripts/autoheal/autoheal_rules.jsonl
- OUT: src/, src-tauri/, e2e/ (no touch), tests/ (no touch), package.json (no version bump)
