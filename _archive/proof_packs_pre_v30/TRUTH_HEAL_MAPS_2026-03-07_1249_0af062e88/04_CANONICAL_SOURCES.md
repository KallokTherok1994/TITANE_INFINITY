Status: PASS

Canonical source selection:

Instructions:
- CANON: `.github/copilot-instructions.md` + `.github/instructions/*.instructions.md`.
- SUPPORTING: `src/AGENTS.md`, `src-tauri/AGENTS.md`, `e2e/AGENTS.md`, `scripts/AGENTS.md`.
- LEGACY: archived instruction proof packs in `proof_packs/*`.

Maps:
- CANON: active docs in `docs/**` plus this session proof pack maps.
- SUPPORTING: historical map docs in prior proof packs.
- ARCHIVE: `docs/archive/**`, `docs/backup_*`.

Mermaid:
- CANON: `.github/copilot-workflow.mermaid`, `docs/diagrams/sources/*.mmd`.
- SUPPORTING: mermaid governance scripts under `scripts/verify/*mermaid*`.
- ARCHIVE: mermaid blocks embedded in old proof packs.

Registries:
- CANON: `scripts/autoheal/autoheal_rules.jsonl` (operational canonical path by governance rule), `registry/*.jsonl` event registries.
- SUPPORTING: `registry/autofix-autoheal-rules.jsonl` (cross-check schema registry).

Validators:
- CANON: `scripts/verify_instructions.sh`, `scripts/autoheal/detect_recurrence.sh`, `scripts/qa/check_autofix_autoheal_registry.mjs`, `scripts/verify/verify-mermaid-diagrams.sh`, `scripts/verify/mermaid-status-report.sh --check`.
- SUPPORTING: `scripts/gates/*`, `scripts/checks/*`.

Verdict docs:
- CANON (this session): `16_FINAL_VERDICT.md`, `VERDICT.md` in this proof pack.
- LEGACY: previous proof pack verdict files.

Unknown canon blocks:
- None within the scoped governance lane.
