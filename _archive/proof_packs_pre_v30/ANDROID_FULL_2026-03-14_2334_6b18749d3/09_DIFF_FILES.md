# 09_DIFF_FILES.md

## Changements de cette session

### LOT_GUARD_DEVOPS (STOPLINE #4)

#### src-tauri/src/main.rs
- Ajout de `#[cfg(not(target_os = "android"))]` sur `mod devops_commands`
- RING: R3 (Services)
- IMPACT réseau: aucun
- IMPACT IPC: aucun (commandes non enregistrées dans generate_handler!)
- IMPACT storage: aucun
- IMPACT permissions: aucun
- ROLLBACK: `git restore -- src-tauri/src/main.rs`

#### src-tauri/src/commands/devops.rs
- Remplacement de la constante hardcodée `WORKSPACE_DIR` par une fonction `workspace_dir()`
- Utilise `std::env::var("TITANE_WORKSPACE_DIR")` avec fallback sur la valeur précédente
- RING: R3 (Services desktop-only)
- IMPACT réseau: aucun
- IMPACT IPC: aucun
- IMPACT storage: aucun (chemin desktop uniquement)
- IMPACT permissions: aucun
- ROLLBACK: `git restore -- src-tauri/src/commands/devops.rs`

### Proof pack (append-only)
#### proof_packs/ANDROID_FULL_2026-03-14_2334_6b18749d3/
- Nouveaux fichiers de preuve (append-only, non modifiés après écriture)
