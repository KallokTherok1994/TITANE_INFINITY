# 07_TARGET_LAYER_ARCHITECTURE

## LAYER 1 - Kernel
- purpose: noyau constitutionnel court et stable
- allowed content: 10-12 regles max (priorite, statuses, 4-Ring, One Door, Tauri-only, IPC contract, prod tokens, rollback)
- forbidden content: workflows detailes, inventaires, templates de preuve
- typical file examples: `.github/copilot-instructions.md`
- cognitive cost budget: <= 180 lignes
- expected effect on future speed: HIGH

## LAYER 2 - Surface Rules
- purpose: contraintes locales par surface
- allowed content: invariants locaux, gates locaux, preuve locale attendue, rollback local
- forbidden content: doctrine globale repetee
- typical file examples: `.github/instructions/frontend.instructions.md`, `.github/instructions/tauri.instructions.md`, `.github/instructions/tests-e2e.instructions.md`, `.github/instructions/docs-registry.instructions.md`
- cognitive cost budget: <= 80 lignes/fichier
- expected effect on future speed: HIGH

## LAYER 3 - Local Operational Authority
- purpose: gouvernance operationnelle au plus pres du code
- allowed content: conventions dossier, commandes locales, anti-drift local
- forbidden content: redefinir kernel
- typical file examples: `src/AGENTS.md`, `src-tauri/AGENTS.md`, `e2e/AGENTS.md`, `docs/AGENTS.md`, `scripts/AGENTS.md`
- cognitive cost budget: <= 60 lignes/fichier
- expected effect on future speed: MEDIUM

## LAYER 4 - Custom Specialists
- purpose: profils experts activables a la demande
- allowed content: mission, when to use, required inputs, tools, forbidden actions, proofs, escalation
- forbidden content: doctrine globale dupliquee
- typical file examples: `.github/agents/architect-guardian.agent.md`, etc.
- cognitive cost budget: <= 120 lignes/agent
- expected effect on future speed: HIGH

## LAYER 5 - Reusable Prompt Files
- purpose: externaliser workflows lourds et sessions types
- allowed content: runbooks step-by-step, checklists contextualisees, templates output
- forbidden content: invariants globaux
- typical file examples: `.github/prompts/*.prompt.md`
- cognitive cost budget: <= 200 lignes/prompt
- expected effect on future speed: HIGH

## LAYER 6 - Mechanical Truth
- purpose: verifier automatiquement ce qui est binaire
- allowed content: scripts verify, schemas YAML/JSON, gates machine-readable, map refresh
- forbidden content: assertions non testables sans fallback
- typical file examples: `scripts/verify/*.sh`, `scripts/autoheal/*`, `governance/*.yaml`, `governance/*.json`
- cognitive cost budget: N/A (execution cost budget <= 120s PATH_SIMPLE, <= 10min PATH_HEAVY)
- expected effect on future speed: HIGH
