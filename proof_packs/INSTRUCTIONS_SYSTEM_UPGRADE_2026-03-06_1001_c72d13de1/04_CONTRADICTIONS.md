# 04_CONTRADICTIONS

## C1 - Local-first marker vs online-first doctrine
- fichiers: `.github/copilot-instructions.md` (ligne 10, 94-95), `.github/instructions/titane.instructions.md` (ligne 115-122)
- conflit: marqueur local-first maintenu alors que doctrine active est online-first governed
- layer qui gagne: LAYER 1 Kernel
- fix minimal: conserver "Local-first" uniquement comme compat marker et interdire toute interpretation "offline-by-default"
- action: rewrite (phrasing) + mechanize (`verify_local_markers_consistency.sh`)
- risque si non resolu: drift de policy reseau
- rollback: `git restore -- .github/copilot-instructions.md .github/instructions/titane.instructions.md`

## C2 - Reports/proof-pack location mismatch potentiel
- fichiers: `.github/instructions/docs-registry.instructions.md`, workflow proof packs sous `proof_packs/**`
- conflit: phrase "Proofs live under reports/" vs execution moderne qui produit aussi `proof_packs/**`
- layer qui gagne: LAYER 1 Kernel + LAYER 2 docs-registry
- fix minimal: expliciter dual-home: reports (logs append-only) + proof_packs (session packs)
- action: rewrite
- risque: classification FAIL artificielle sur preuves valides
- rollback: `git restore -- .github/instructions/docs-registry.instructions.md`

## C3 - Doc-only policy vs governance executable
- fichiers: `.github/instructions/titane.instructions.md` (Mode doc-only), `.github/copilot-instructions.md` (execution complete)
- conflit: doc-only peut bloquer execution de checks obligatoires
- layer qui gagne: LAYER 1 Kernel
- fix minimal: doc-only uniquement pour demandes explicitement documentaires
- action: rewrite
- risque: BLOCKED_DOCTRINE sur taches runtime
- rollback: `git restore -- .github/instructions/titane.instructions.md`

## C4 - Runtime proofs requises vs agents doc-only
- fichiers: `.github/copilot-agents.md`, `.github/copilot-agents/*.agent.md`, `.github/agents/*.agent.md`
- conflit: roster doc-only coexiste avec exigences de preuve executable
- layer qui gagne: LAYER 4 Custom Specialists operationnels
- fix minimal: deprecier agents doc-only ou marquer "non executable" strict
- action: move/delete
- risque: faux sentiment de couverture agent
- rollback: `git restore -- .github/copilot-agents.md .github/copilot-agents`

## C5 - Drift DONE/PASS/SEALED/BLOCKED
- fichiers: kernel + docs legacy/proof packs historiques
- conflit: vocabulaire et seuils parfois differents selon document
- layer qui gagne: LAYER 1 Kernel status vocabulary unique
- fix minimal: schema `governance/statuses.yaml` + validator `verify_status_vocabulary.sh`
- action: mechanize
- risque: verdicts non comparables
- rollback: `git restore -- governance/statuses.yaml scripts/verify/verify_status_vocabulary.sh`

## C6 - Prohibition PROD vs readiness wording
- fichiers: `.github/instructions/titane.instructions.md` (interdit build prod), kernel (tokens exacts prod)
- conflit: message possible "jamais" vs "autorise sous token"
- layer qui gagne: LAYER 1 Kernel
- fix minimal: policy unique "PROD strictement token-gated"
- action: rewrite
- risque: blocage inutile ou action prod non conforme
- rollback: `git restore -- .github/instructions/titane.instructions.md .github/copilot-instructions.md`

## C7 - Agent roster doc vs implementation reelle
- fichiers: `.github/copilot-routing.json`, `.github/copilot-agents.md`, `.github/agents/*.agent.md`
- conflit: noms routing (`systems_architect`, etc.) ne mappent pas clairement sur agents actifs
- layer qui gagne: LAYER 4 + routing operational index
- fix minimal: index agents unique (`verify_agents_index.sh`)
- action: mechanize + move
- risque: handoff non deterministe
- rollback: `git restore -- .github/copilot-routing.json .github/agents .github/copilot-agents`

## C8 - Mapping obligations vs preuves effectives
- fichiers: kernel section mapping, `docs/MAP_*.md`, `reports/MAP_PROOFS.log`
- conflit: obligations fortes; preuves presentes mais pas toujours reliees a tache courante
- layer qui gagne: LAYER 6 Mechanical Truth
- fix minimal: gate map executee automatiquement en PATH_HEAVY seulement
- action: mechanize
- risque: faux FAIL sur taches locales simples
- rollback: `git restore -- scripts/map_refresh.sh`

## C9 - Prompt-like workflows dans always-on files
- fichiers: kernel + titane.instructions + agents docs
- conflit: runbooks volumineux en contexte permanent
- layer qui gagne: LAYER 5 Prompt Files
- fix minimal: extraire workflows vers `.github/prompts/*.prompt.md`
- action: move
- risque: lenteur systematique
- rollback: `git restore -- .github/copilot-instructions.md .github/instructions/titane.instructions.md`

## C10 - References validators manquants
- fichiers: design cible vs scripts existants
- conflit: verify_* mentionnes dans mission mais non presents (`verify_instruction_layers.sh`, etc.)
- layer qui gagne: LAYER 6
- fix minimal: creer scripts + schema gouvernance
- action: create
- risque: doctrine non testable
- rollback: `git restore -- scripts/verify governance`

## C11 - Drift bilingue
- fichiers: `.github/copilot-instructions.md`
- conflit: lignes FR/EN dupliquees peuvent diverger
- layer qui gagne: LAYER 1 version canonique unique + alias traductions
- fix minimal: bloc "canonical phrasing" unique + traduction referencee
- action: rewrite
- risque: interpretation differente selon langue
- rollback: `git restore -- .github/copilot-instructions.md`

## Decision doctrine
- Aucune contradiction critique non patchable minimalement dans ce run.
- Classification globale: pas de `BLOCKED_DOCTRINE` au stade plan.
