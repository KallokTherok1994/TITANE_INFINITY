# 01_BOOTSTRAP

## Etat reel du depot
- Commandes bootstrap executees: voir `16_COMMANDS_USED.md` et `17_TESTS_AND_CHECKS.log`.
- Git status: `## MAIN...origin/MAIN` + dossier proof-pack courant non tracke.
- SHA court: `c72d13de1`.
- Historique recent: 5 commits recents captures (dont fix e2e/ci et preuves).

## Fichiers d instructions reels presents
- `.github/copilot-instructions.md`
- `.github/instructions/docs-registry.instructions.md`
- `.github/instructions/frontend.instructions.md`
- `.github/instructions/tauri.instructions.md`
- `.github/instructions/tests-e2e.instructions.md`
- `.github/instructions/titane.instructions.md`

## Agents reels presents
- Dossier moderne: `.github/agents/` (4 agents)
- Dossier legacy/documentaire: `.github/copilot-agents/` + sous-dossier `agents/`
- Fichier roster doc: `.github/copilot-agents.md`
- Routing JSON: `.github/copilot-routing.json`

## Prompt files reels presents
- Aucune presence de `.github/prompts/*.prompt.md`.
- Statut: manque structurel confirme.

## Validateurs reels presents
- `scripts/verify_instructions.sh`
- `scripts/autoheal/detect_recurrence.sh`
- `scripts/map_refresh.sh`
- `scripts/verify/verify-copilot-instructions.sh`
- Grand ensemble de scripts `scripts/verify/**` (network-one-door, tauri-only, online-first, etc.)

## Contradictions visibles immediates
1. Marqueur `Local-first` maintenu alors que doctrine active est `Online-first governed`.
2. Presence simultanee d agents operationnels et d agents explicitement `Doc`/`documentation-only`.
3. Kernel global contient workflow detaille + gates + mapping + autoheal + progression, donc charge always-on tres elevee.
4. Aucune couche prompt files dediee, donc workflows lourds restent dans fichiers always-on.
5. Priorite de couches implicite mais non mecanisee dans un schema unique.

## Inconnus (UNKNOWN)
- UNKNOWN: Taux reel de declenchement des agents `.github/copilot-agents/**` dans runtime actuel VS Code.
- UNKNOWN: Couverture effective des verify scripts en CI sur toutes branches actives.
- UNKNOWN: Consommation contexte moyenne par session (mesure tokens absente dans repo).

## Delta entre architecture ideale et etat reel
- Ideal: kernel court 10-12 regles; Reel: kernel long multi-domaines (~22 sections normatives).
- Ideal: prompt files reutilisables; Reel: aucun prompt file dedie.
- Ideal: local AGENTS.md par zone; Reel: aucun `src/AGENTS.md`, `src-tauri/AGENTS.md`, `e2e/AGENTS.md`, `docs/AGENTS.md`, `scripts/AGENTS.md`.
- Ideal: regles binaires mecanisees; Reel: mecanisation partielle, plusieurs regles encore prose-only.
