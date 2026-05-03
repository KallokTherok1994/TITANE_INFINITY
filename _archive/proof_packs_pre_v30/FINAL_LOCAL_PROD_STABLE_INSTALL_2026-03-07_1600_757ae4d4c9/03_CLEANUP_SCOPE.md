# 03_CLEANUP_SCOPE

A) EXEC_MODE
- `LOCAL`

B) SCOPE_RING
- Nettoyage local minimal des pointeurs obsolètes, sans suppression destructive hors inventaire.

C) RISK
- `P0`

D) PLAN (<=7 étapes)
1. Classifier les éléments en `REMOVE_SAFE / KEEP_FOR_ROLLBACK / AMBIGUOUS_DO_NOT_TOUCH`.
2. Sauvegarder les éléments de rollback avant mutation.
3. Appliquer uniquement le cleanup minimal requis.

E) PROOFS
- Matrice scope: `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/04_cleanup_scope_matrix.txt`
- Exécution cleanup+install: `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/04_cleanup_and_install_execution.log`
- Rollback assets: `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/rollback_assets/`

F) ROLLBACK
- Restaurer desktop entries depuis `raw/rollback_assets/*.pre`.
- Restaurer binaire local depuis `~/.local/bin/titane-infinity.pre27.2.0`.

Classification:
- `REMOVE_SAFE`:
  - anciens pointeurs launcher vers `Titan-Stable_27.0.5_amd64.AppImage` (réécriture vers 27.2.0).
- `KEEP_FOR_ROLLBACK`:
  - `runtime/stable/Titan-Stable_27.0.5_amd64.AppImage`
  - `runtime/stable/Titan-Stable_27.0.5_amd64.deb`
  - `~/.local/bin/titane-infinity.pre27.2.0`
  - copies pré-changement des `.desktop`
- `AMBIGUOUS_DO_NOT_TOUCH`:
  - historiques `deployment/latest/*` hors activation locale directe.
  - fichiers non-TITANE et hors surface locale stable.
