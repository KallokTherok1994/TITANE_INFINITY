# ROLLBACK

Confirmation:
- Aucune mutation CI/doctrine/build/deploy distant dans ce run.
- Mutations limitées à l'installation locale stable (binaires/desktop user-space + runtime/stable appimage cible).

Rollback local:
- Restaurer `~/.local/bin/titane-infinity.pre27.2.0` comme pointeur actif.
- Restaurer `~/.local/share/applications/TITANE-Infinity.desktop` et `~/.local/share/applications/titane-infinity.desktop` depuis `raw/rollback_assets/`.
- Conserver `runtime/stable/Titan-Stable_27.0.5_amd64.AppImage` comme fallback local.

Commande de rollback documentaire uniquement (suppression du pack):
- `rm -rf proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9`
