# DESKTOP_LAUNCHER_SUDO_HOME_FIX_2026-04-19

Date: 2026-04-19
Scope: Linux system launcher actions after sudo regeneration

## Facts

- La synchronisation systeme precedente a bien aligne la version `v31.0.3` et les icones 128x128, 256x256 et 512x512 sous `/usr/share`.
- La verification post-sudo a revele une derive restante: les actions `Logs` et `Config` du launcher systeme pointaient vers `/root/.titane`.
- La cause etait double: interpolation directe de `HOME` dans les actions `.desktop` et creation du repertoire de logs sous `HOME` lors d une regeneration via sudo.

## Executed Proofs

- `runTests tests/unit/scripts/updateDesktopIconScripts.test.ts`: PASS.
- Simulation `SUDO_USER=titane-os HOME=/tmp/titane-sudo-home-sim bash scripts/update-desktop-icon.sh`: PASS, le launcher genere pointe vers `/home/titane-os/.titane` et non `/root/.titane`.
- Verification post-sudo du launcher systeme actuellement installe: la version et l icone sont bonnes, mais les actions exposent encore `/root/.titane` tant qu un rerun sudo n a pas regenere le fichier avec le correctif.

## Required Follow-up

- Reexecuter `sudo bash scripts/post-build/update-desktop-icons.sh` une fois pour regenerer `/usr/share/applications/titane-infinity.desktop` avec le home utilisateur reel.

## Verdict

PASS — Le correctif racine est implemente et prouve par test plus simulation. Le rerun sudo restant concerne l application du correctif au launcher systeme deja installe, pas la validite du code commite.