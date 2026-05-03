# 05_DUPLICATIONS

## D1 - Rule: Tauri-only
- canonical source: LAYER 1 kernel (`.github/copilot-instructions.md`)
- duplicate sources: `.github/instructions/tauri.instructions.md`, `.github/instructions/titane.instructions.md`, scripts verify
- duplication severity: HIGH
- usefulness: transitional
- target single source of truth: kernel + validator `enforce-tauri-only.sh`
- migration action: rewrite L2 en references courtes

## D2 - Rule: 4-Ring strict
- canonical source: kernel
- duplicate sources: `docs/MAP_ARCHITECTURE_4RING.md`, `titane.instructions.md`, tests architecture
- duplication severity: MEDIUM
- usefulness: useful in docs, harmful in repeated prose
- target single source of truth: kernel (norme) + map docs (evidence)
- migration action: separation norme vs preuve

## D3 - Rule: One Door Network
- canonical source: kernel
- duplicate sources: `tauri.instructions.md`, `MAP_SURFACES_NETWORK.md`, `scripts/verify/network-one-door.sh`
- duplication severity: MEDIUM
- usefulness: useful if scoped
- target single source of truth: kernel + validator script
- migration action: garder details techniques uniquement dans validator/doc map

## D4 - Rule: AutoHeal mandatory capture
- canonical source: kernel section AutoFix/AutoHeal
- duplicate sources: `tests-e2e.instructions.md`, `titane.instructions.md`
- duplication severity: HIGH
- usefulness: harmful (drift wording)
- target single source of truth: kernel + `detect_recurrence.sh`
- migration action: remplacer textes dupliques par lien canonique

## D5 - Rule: PASS/FAIL/BLOCKED/SEALED
- canonical source: kernel status vocabulary
- duplicate sources: multiples proof packs docs et scripts
- duplication severity: HIGH
- usefulness: harmful hors schema central
- target single source of truth: `governance/statuses.yaml`
- migration action: mechanize + lint docs/statuses

## D6 - Rule: Prod token gating
- canonical source: kernel
- duplicate sources: docs legacy/allowlist scans/readme
- duplication severity: HIGH
- usefulness: mostly harmful
- target single source of truth: kernel + release validator
- migration action: nettoiement legacy docs + verify script

## D7 - Rule: diagnose -> plan -> apply -> verify -> report
- canonical source: kernel
- duplicate sources: workflow mermaid + prompts a venir + agents docs
- duplication severity: MEDIUM
- usefulness: useful if compact
- target single source of truth: kernel phrase courte
- migration action: details runbook dans prompts

## D8 - Rule: mapping gate list
- canonical source: `docs/MAP_TESTS_GATES.md`
- duplicate sources: kernel + proof packs historiques
- duplication severity: MEDIUM
- usefulness: useful in docs, harmful in repeated narrative
- target single source of truth: `docs/MAP_TESTS_GATES.md` + `scripts/map_refresh.sh`
- migration action: kernel garde reference uniquement

## Regle critique de migration
Chaque regle importante doit avoir un seul home canonique, puis eventuellement des references courtes ailleurs sans redefinir la norme.
