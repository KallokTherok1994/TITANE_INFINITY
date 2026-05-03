# 04_DUPLICATION_CHECK

## Perimetre controle

- `.github/copilot-instructions.md`
- `.github/instructions/*`
- `src/AGENTS.md`, `src-tauri/AGENTS.md`, `e2e/AGENTS.md`, `docs/AGENTS.md`, `scripts/AGENTS.md`
- `.github/agents/*` et `.github/copilot-agents/*`
- `.github/prompts/*`
- docs de mapping/maintenance references

## Resultats

- Doctrine canonique critique (tokens PROD, vocabulaire de statut, chemin AutoHeal): **PAS de duplication active** (validator PASS).
- Duplication historique en archives/proof packs: presente mais **transitional** (hors couche active).
- Duplication harmful dans la couche active: **aucune**.

## Grille demandee

- canonical home: `.github/copilot-instructions.md`
- duplicate path: aucune duplication critique active
- harmless / harmful / transitional: `transitional` uniquement (archives/proof packs)
- patch now? yes/no: `no`
- minimal removal plan: maintien en l'etat; suppression uniquement si campagne de nettoyage archive dediee
