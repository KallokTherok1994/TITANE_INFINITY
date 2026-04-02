# 02_SYSTEM_INVENTORY

## 1. Fichiers constitutionnels globaux
- path: `.github/copilot-instructions.md`
- role: constitution gouvernante globale
- layer candidate: LAYER 1 Kernel
- always-on or contextual: always-on
- duplication level: HIGH
- ambiguity level: MEDIUM
- execution cost: HIGH
- action: split + mechanize

## 2. Fichiers d instructions path-specific
- path: `.github/instructions/frontend.instructions.md`
- role: regles UI Ring4
- layer candidate: LAYER 2 Surface Rules
- always-on or contextual: contextual
- duplication level: MEDIUM
- ambiguity level: LOW
- execution cost: LOW
- action: keep + trim duplicate doctrine

- path: `.github/instructions/tauri.instructions.md`
- role: regles Tauri/capabilities/IPC
- layer candidate: LAYER 2 Surface Rules
- always-on or contextual: contextual
- duplication level: MEDIUM
- ambiguity level: LOW
- execution cost: LOW
- action: keep + trim duplicate doctrine

- path: `.github/instructions/tests-e2e.instructions.md`
- role: discipline e2e/wrapper/export
- layer candidate: LAYER 2 Surface Rules
- always-on or contextual: contextual
- duplication level: MEDIUM
- ambiguity level: LOW
- execution cost: LOW
- action: keep + mechanize exports guards

- path: `.github/instructions/docs-registry.instructions.md`
- role: discipline append-only docs/reports/proofs
- layer candidate: LAYER 2 Surface Rules
- always-on or contextual: contextual
- duplication level: LOW
- ambiguity level: LOW
- execution cost: LOW
- action: keep

- path: `.github/instructions/titane.instructions.md`
- role: doctrine transversale + fast path + prod policy
- layer candidate: LAYER 2 (surdimensionne)
- always-on or contextual: contextual
- duplication level: HIGH
- ambiguity level: MEDIUM
- execution cost: HIGH
- action: split (surface locales) + move workflows vers prompts

## 3. Fichiers AGENTS.md locaux
- path: `src/AGENTS.md`
- role: absent
- layer candidate: LAYER 3 Local Operational Authority
- always-on or contextual: contextual
- duplication level: UNKNOWN
- ambiguity level: HIGH
- execution cost: MEDIUM
- action: create

- path: `src-tauri/AGENTS.md`
- role: absent
- layer candidate: LAYER 3
- always-on or contextual: contextual
- duplication level: UNKNOWN
- ambiguity level: HIGH
- execution cost: MEDIUM
- action: create

- path: `e2e/AGENTS.md`
- role: absent
- layer candidate: LAYER 3
- always-on or contextual: contextual
- duplication level: UNKNOWN
- ambiguity level: HIGH
- execution cost: MEDIUM
- action: create

- path: `docs/AGENTS.md`
- role: absent
- layer candidate: LAYER 3
- always-on or contextual: contextual
- duplication level: UNKNOWN
- ambiguity level: MEDIUM
- execution cost: LOW
- action: create

- path: `scripts/AGENTS.md`
- role: absent
- layer candidate: LAYER 3
- always-on or contextual: contextual
- duplication level: UNKNOWN
- ambiguity level: MEDIUM
- execution cost: LOW
- action: create

## 4. Agents custom reels presents
- path: `.github/agents/*.agent.md`
- role: sous-agents operationnels (audit/implement/review/conductor)
- layer candidate: LAYER 4 Custom Specialists
- always-on or contextual: contextual
- duplication level: MEDIUM
- ambiguity level: MEDIUM
- execution cost: MEDIUM
- action: keep + normaliser missions/preuves

- path: `.github/copilot-agents/**/*.agent.md`
- role: legacy/documentation + specialisation partielle
- layer candidate: transition LAYER 4
- always-on or contextual: contextual
- duplication level: HIGH
- ambiguity level: HIGH
- execution cost: MEDIUM
- action: move/deprecate/fuse

## 5. Prompt files reels presents
- path: `.github/prompts/*.prompt.md`
- role: absent
- layer candidate: LAYER 5 Reusable Prompt Files
- always-on or contextual: contextual
- duplication level: UNKNOWN
- ambiguity level: HIGH
- execution cost: HIGH (reporte sur kernel)
- action: create

## 6. Validators / scripts de verification presents
- path: `scripts/verify_instructions.sh`
- role: gardes doc + autoheal presence
- layer candidate: LAYER 6 Mechanical Truth
- always-on or contextual: contextual
- duplication level: LOW
- ambiguity level: LOW
- execution cost: LOW
- action: keep

- path: `scripts/autoheal/detect_recurrence.sh`
- role: recurrence guard autoheal
- layer candidate: LAYER 6
- always-on or contextual: contextual
- duplication level: LOW
- ambiguity level: LOW
- execution cost: LOW
- action: keep

- path: `scripts/map_refresh.sh`
- role: validation map gates + append proofs
- layer candidate: LAYER 6
- always-on or contextual: contextual
- duplication level: LOW
- ambiguity level: LOW
- execution cost: MEDIUM
- action: keep + wire CI clearer

- path: `scripts/verify/verify-copilot-instructions.sh`
- role: pattern guard des instructions
- layer candidate: LAYER 6
- always-on or contextual: contextual
- duplication level: MEDIUM
- ambiguity level: MEDIUM
- execution cost: LOW
- action: rewrite to schema-driven checks

## 7. Systeme AutoHeal / anti-recurrence
- path: `scripts/autoheal/autoheal_rules.jsonl`
- role: registre append-only des fixes
- layer candidate: LAYER 6
- always-on or contextual: contextual
- duplication level: LOW
- ambiguity level: LOW
- execution cost: LOW
- action: keep

## 8. Systeme de cartographie / Mermaid / preuves
- path: `docs/MAP_INDEX.md`, `docs/MAP_*.md`, `reports/MAP_PROOFS.log`
- role: cartographie canonique et preuves mapping
- layer candidate: LAYER 6 (preuve mecanique) + docs support
- always-on or contextual: contextual
- duplication level: MEDIUM
- ambiguity level: LOW
- execution cost: MEDIUM
- action: keep + relier aux nouveaux validators de couches

## 9. Composants surcharges
- `.github/copilot-instructions.md` (surcharge doctrinale, procedures, gates, mappings)
- `.github/instructions/titane.instructions.md` (doctrine + workflow + policy)
- `.github/copilot-agents/**` (mix doc et pseudo-operationnel)

## 10. Composants manquants
- `.github/prompts/*.prompt.md` (8 runbooks requis)
- AGENTS locaux (`src/`, `src-tauri/`, `e2e/`, `docs/`, `scripts/`)
- validators de couche (`verify_instruction_layers.sh`, etc.)
- schemas gouvernance (`governance/statuses.yaml`, etc.)

## 11. Composants ambigus
- cohabitation `.github/agents` vs `.github/copilot-agents`
- priorite effective entre kernel global et `titane.instructions.md`
- statut operationnel reel de `copilot-routing.json`

## 12. Composants candidats a suppression
- `.github/copilot-agents/agent-factory.agent.md` (doc-only)
- `.github/copilot-agents/orchestrator.agent.md` (doc-only redondant)
- `.github/copilot-agents/agents/*.agent.md` (si non relies a runtime)

## 13. Composants candidats a fusion
- doctrine status/verdict (kernel + titane.instructions)
- doctrine online/local marker (kernel + tauri/frontend/titane)
- policy autoheal (kernel + tests-e2e + titane)

## 14. Composants candidats a deplacement
- workflows lourds depuis kernel vers `.github/prompts/*.prompt.md`
- regles binaires prose vers `scripts/verify/*.sh` + `governance/*.yaml`
