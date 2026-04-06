# 02_LOCAL_INSTALL_TRUTH

A) EXEC_MODE
- `LOCAL`

B) SCOPE_RING
- Vérité locale pré-action puis vérité locale post-action.

C) RISK
- `P0`

D) PLAN (<=7 étapes)
1. Inventorier artefacts stables locaux.
2. Identifier version active locale réellement pointée.
3. Vérifier présence des versions 27.0.5 et 27.2.0.
4. Vérifier état desktop/launcher.
5. Établir l'état de départ puis d'arrivée.

E) PROOFS
- `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/02_local_install_truth.log`
- `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/03_pre_cleanup_inventory.log`
- `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/03b_launcher_text_inventory.log`
- `proof_packs/FINAL_LOCAL_PROD_STABLE_INSTALL_2026-03-07_1600_757ae4d4c9/raw/05_install_verification_raw.log`

F) ROLLBACK
- Ancien binaire local conservé (`~/.local/bin/titane-infinity.pre27.2.0`).

Constat pré-action:
- Launchers user pointaient vers `runtime/stable/Titan-Stable_27.0.5_amd64.AppImage`.
- Binaire actif shell: `~/.local/bin/titane-infinity` (ancien binaire local).
- Package `.deb` installé via dpkg: non détecté.
- AppImage cible `27.2.0` présent dans `deployment/latest/`.

Constat post-action:
- `~/.local/bin/titane-infinity` pointe vers `runtime/stable/Titan-Stable_27.2.0_amd64.AppImage`.
- Launchers user mis à jour vers `27.2.0`.
- Aucun pointeur launcher restant vers `27.0.5`.

`LOCAL_INSTALL_STATE = VERIFIED`
`CURRENT_ACTIVE_VERSION = 27.2.0`
`TARGET_VERSION = 27.2.0`
