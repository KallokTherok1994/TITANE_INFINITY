# 02_LATEST_CHANGES_SCOPE

## Delta since last preprod gate seal (LOCAL_PROD_GATE_SEAL at a3212d6fb)

### Commit 1: 51efc2536 — TWINS menu fusion (v29.2)
- src/pages/TitanePage.tsx (+24 lines): symbiose tab (TabId, handlers, JSX, TwinEvolutionPanel)
- src/App.tsx (-22 +4 lines): remove TWIN from topNavSections; /twins /twin → /titane redirect; remove TwinsPage lazy import
- scripts/autoheal/autoheal_rules.jsonl: AH-2026-03-21-TWINS-FUSION
- proof_packs/TITANE_TWINS_MENU_FUSION_2026-03-21_0310_a3212d6fb/ (16 files)
- **Missing at commit time**: registry/ui-events.jsonl entry, proofpack-index.jsonl entry, CHANGELOG entry

### Commit 2: d7f59dbf5 — preprod seal / validator fix
- scripts/verify/verify-capabilities-coverage.sh: rewrote to use python3 identifier extraction + known-dead baseline
- proof_packs/PREPROD_TO_PROD_SEAL_2026-03-20_2319_51efc2536/ (19 files)
- scripts/autoheal/autoheal_rules.jsonl: minor append

## Files with persistent drift (vs origin)
| File | Status | Risk |
|------|--------|------|
| registry/ui-events.jsonl | MISSING TWINS FUSION ENTRY → FIXED ✅ | REGISTRY_DRIFT |
| registry/proofpack-index.jsonl | MISSING TWINS PROOF PACK → FIXED ✅ | REGISTRY_DRIFT |
| CHANGELOG.md | MISSING v29.2 NAV SECTION → FIXED ✅ | DOC_RUNTIME_DRIFT |
| README.md | Contains native freshness gate doc (new, valid) | OK |
| docs/README.md | Build command doc update (valid) | OK |
