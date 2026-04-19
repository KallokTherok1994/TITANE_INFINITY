# DESKTOP_ICON_DOCK_REFRESH_2026-04-19

Date: 2026-04-19
Scope: Linux menu and dock icon refresh truth

## Facts

- Le launcher utilisateur local etait deja canonique, mais le flux d icones ne publiait qu une seule resolution 128x128.
- Les environnements de bureau pouvant choisir une taille plus grande pour le dock, le shell pouvait conserver une icone stale ou sous-dimensionnee.
- Le script post-build appelait `update-icon-caches`, commande non canonique ici; le refresh passe maintenant par `gtk-update-icon-cache`.

## Executed Proofs

- `runTests tests/unit/scripts/updateDesktopIconScripts.test.ts`: PASS.
- `bash scripts/update-desktop-icon.sh`: PASS, launcher local regenere et caches GTK rafraichis.
- Verification locale des assets: PASS, icones presentes en 128x128, 256x256 et 512x512 sous `~/.local/share/icons/hicolor`.
- Verification launcher local: PASS, `Name=TITANE∞ v31.0.3`, `Exec=/usr/bin/titane-infinity`, `Icon=titane-infinity`.

## Limits

- La replication systeme sous `/usr/share/applications` et `/usr/share/icons/hicolor` reste `BLOCKED_SUDO_REQUIRED` tant que sudo interactif n est pas disponible.

## Verdict

PASS — La couche utilisateur du menu et du dock est rafraichie avec les resolutions d icone utiles, et le flux canonique est corrige pour les prochains refresh locaux/systeme.