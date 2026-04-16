# AUDIT_ANTIDRIFT_2026-04-16

Date: 2026-04-16
Status: PASS

## Scope

- Consolidation des lecons issues de l'audit transversal de la serie v30.1.x.
- Propagation des regles anti-derive vers les surfaces locales `src/`, `src-tauri/`, `e2e/`, `docs/`, `scripts/`.
- Scellement d'un rappel gouverne dans la documentation et les preuves.

## Recurrent Failure Modes Captured

- Desynchronisation entre source, artefacts packages, launchers installes et runtime visible.
- Regressions UI visibles seulement sur flows secondaires: fullscreen, scroll, zoom, mobile, retour au dernier message.
- Corrections backend qualifiees trop tot sans preuve d'isolation d'environnement ni verite IPC/runtime cote UI.
- Scripts post-build ou d'installation restant dans un etat partiel a cause de `sudo` interactif.
- Tracabilite incomplete des causes racines et des rollback scopes.

## Repo-Level Prevention Added

- Doctrine anti-derive ajoutee au noyau d'instructions et au README.
- Invariant operationalise dans l'architecture et la cartographie canonique.
- Garde-fous specialises ajoutes dans les AGENTS locaux frontend, backend, e2e, docs et scripts.
- Entree AutoHeal dediee a cette consolidation.

## Validation Summary

- `bash scripts/autoheal/detect_recurrence.sh` -> PASS
- `bash scripts/verify_instructions.sh` -> PASS
- `bash scripts/verify/verify_instruction_layers.sh` -> PASS
- `bash scripts/verify/verify_no_doctrine_duplication.sh` -> PASS
- `bash scripts/verify/verify_status_vocabulary.sh` -> PASS
- `bash scripts/verify/verify_agents_index.sh` -> PASS
- `bash scripts/verify/verify_prompt_files_index.sh` -> PASS
- `bash scripts/verify/verify_local_markers_consistency.sh` -> PASS
- `bash scripts/verify/verify_kernel_budget.sh` -> PASS

## Result

L'audit anti-derive n'est plus seulement narratif: il est converti en contraintes operationnelles locales et en preuve gouvernee exploitable pour les prochaines phases.