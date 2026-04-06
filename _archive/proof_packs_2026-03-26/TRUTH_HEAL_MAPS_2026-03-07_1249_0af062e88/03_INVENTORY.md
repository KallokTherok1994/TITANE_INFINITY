Status: PASS

Inventory evidence:
- `raw/scan_governance_keywords_sample.txt`
- `raw/scan_governance_file_tree.txt`
- `raw/scan_registry_keywords.txt`
- `raw/scan_mermaid_keywords.txt`
- `raw/scan_validation_keywords.txt`
- `raw/canon_*_list.txt`
- `raw/canon_counts_clean.env`

Category classification:

Instruction surfaces:
- EXISTS: `.github/instructions/*.instructions.md` (5 files), `*.github/copilot-instructions.md`, `*/AGENTS.md`.
- STALE_SUSPECTED: legacy prompt/instruction docs under archive/proof packs.

Mapping surfaces:
- EXISTS: multiple `MAP`, `INDEX`, `MATRIX` docs in `docs/**` and `proof_packs/**`.
- CONFLICTING: many historical maps claim completeness at different dates.

Mermaid surfaces:
- EXISTS: `.github/copilot-workflow.mermaid`, `docs/diagrams/sources/*.mmd`, `docs/ui/IA_FLOW.mmd`.
- ARCHIVED: many mermaid mentions in old proof packs.

Registry surfaces:
- EXISTS: `registry/*.jsonl`, `scripts/autoheal/autoheal_rules.jsonl`.
- DUPLICATE (by role): two AutoHeal registries (`scripts/autoheal/*` and `registry/autofix-autoheal-rules.jsonl`) with different schemas.

Validation surfaces:
- EXISTS: 100+ files under `scripts/verify`, `scripts/gates`, `scripts/checks`.
- ORPHAN_SUSPECTED: validators referencing archived proof/legacy docs.

Runtime representation surfaces:
- EXISTS: governance/status terms in `src/**`, `src-tauri/**`, `e2e/**`.
- UNKNOWN: full runtime truth for all references not re-executed in this scope.
