# 08_LOCAL_ROLLBACK_PLAN

A) EXEC_MODE
- `LOCAL`

B) SCOPE_RING
- Rollback strictement local de l'installation stable.

C) RISK
- `P0`

D) PLAN (<=7 étapes)
1. Restaurer binaire local précédent.
2. Restaurer desktop entries pré-changement.
3. Revalider le pointeur local.

E) PROOFS
- Backup binaire: `~/.local/bin/titane-infinity.pre27.2.0`
- Backup desktop: `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/rollback_assets/TITANE-Infinity.desktop.pre`
- Backup desktop: `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/rollback_assets/titane-infinity.desktop.pre`
- Hash ancien appimage: `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/rollback_assets/Titan-Stable_27.0.5_amd64.AppImage.sha256`

F) ROLLBACK
- Commandes:
```bash
ln -sfn "$HOME/.local/bin/titane-infinity.pre27.2.0" "$HOME/.local/bin/titane-infinity"
cp -f "proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/rollback_assets/TITANE-Infinity.desktop.pre" "$HOME/.local/share/applications/TITANE-Infinity.desktop"
cp -f "proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/rollback_assets/titane-infinity.desktop.pre" "$HOME/.local/share/applications/titane-infinity.desktop"
```

Trigger de rollback:
- échec de lancement stable local.
- mismatch version locale impossible à corriger sans retour arrière.
