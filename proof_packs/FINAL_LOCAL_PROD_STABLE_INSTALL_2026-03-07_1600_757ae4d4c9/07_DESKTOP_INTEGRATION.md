# 07_DESKTOP_INTEGRATION

A) EXEC_MODE
- `LOCAL`

B) SCOPE_RING
- Intégration desktop utilisateur locale.

C) RISK
- `P0`

D) PLAN (<=7 étapes)
1. Vérifier Name/Exec des desktop entries TITANE.
2. Vérifier absence de référence 27.0.5.
3. Rafraîchir base desktop locale si disponible.

E) PROOFS
- `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/05_install_verification_raw.log`
- `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/07_desktop_database_update.log`
- `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/07_desktop_database_update.exitcode`

F) ROLLBACK
- Restaurer les `.desktop` pré-changement depuis `raw/rollback_assets/`.

Résultat:
- `DESKTOP_INTEGRATION = PASS`
- Exec desktop entries alignés sur `Titan-Stable_27.2.0_amd64.AppImage`.
