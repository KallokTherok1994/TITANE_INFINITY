# 18_RUNTIME_UNTRACKED_GOVERNANCE.md

Date (UTC): 2026-02-26

## Objet
- Qualification du dossier non suivi `src-tauri/runtime/` détecté en fin de run.

## Constat
- Entrée git status observée: `?? src-tauri/runtime/`.
- Contenu relevé:
  - `src-tauri/runtime/dev/logs/vite.log`
  - `src-tauri/runtime/memory/conversation_os_v1.db`

## Analyse gouvernée
- Ces fichiers sont des artefacts runtime locaux (logs + base de travail), non des sources applicatives.
- Leur présence non ignorée introduit du bruit opérationnel et un risque de commit accidentel.

## Décision
- **Ignorer explicitement** ces artefacts via `.gitignore`:
  - `src-tauri/runtime/dev/logs/`
  - `src-tauri/runtime/memory/*.db`

## Impact
- Arbre de travail nettoyé pour les prochains cycles.
- Aucun impact fonctionnel sur l'application.
- Aucun impact sur les preuves déjà scellées.

## Rollback
- `git restore -- .gitignore`

## Métadonnées de changement
- Ring impacté: **Governance/Repo hygiene**
- Statut: **QUALIFIED**
