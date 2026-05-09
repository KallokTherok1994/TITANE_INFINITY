# Icon and Launcher Sync Proof

## Post-build sync command

- `bash scripts/post-build/update-desktop-icons.sh` -> EXIT 0
- output truth:
  - local launcher and user icon caches synchronized
  - system sync status: `BLOCKED_SUDO_REQUIRED`
  - warning: `/usr/bin/titane-infinity` not synchronized in non-interactive sudo context

## Launcher mapping checks

- local launcher (`~/.local/share/applications/titane-infinity.desktop`):
  - `Exec=/usr/bin/titane-infinity`
  - `Icon=titane-infinity`
- system launcher (`/usr/share/applications/titane-infinity.desktop`):
  - `Exec=/usr/bin/titane-infinity`
  - `Icon=titane-infinity`

## Constraint

- launcher entries are correct; system binary replacement requires privileged install outside this non-interactive session

## System binary drift evidence

- package metadata (non-sudo): `dpkg -s titane-infinity` -> `Version: 33.0.8`
- binary hash comparison:
  - `/usr/bin/titane-infinity` -> `456124bf5a6b592a56593db09d5b8d52c55ed6aa9ea6d363e0f017e07f67a18d`
  - `src-tauri/target/release/titane-infinity` -> `59a629aef26676789358a0cd936877add396bab0c7415bdd36dceba59ccefe05`
- conclusion: installed system binary is not yet the freshly built 33.0.9 binary

## Privileged execution attempts (GO ALL follow-up)

- `sudo -n dpkg -i src-tauri/target/release/bundle/deb/titane-infinity_33.0.9_amd64.deb`
  - result: `sudo: il est nécessaire de saisir un mot de passe`
- `sudo -n bash scripts/post-build/update-desktop-icons.sh`
  - result: `sudo: il est nécessaire de saisir un mot de passe`

Status remains `BLOCKED_SUDO_REQUIRED` until an interactive privileged run is executed.

## Interactive sudo closure (2026-05-08)

- `sudo dpkg -i src-tauri/target/release/bundle/deb/titane-infinity_33.0.9_amd64.deb`
  - result: installation completed (`titane-infinity (33.0.9)` configured)
- `sudo -n bash scripts/post-build/update-desktop-icons.sh`
  - result: `EXIT:0`
  - system sync markers: `sync système=UPDATED`, `sync binaire=UPDATED`

Post-closure verification:

- package version: `dpkg -s titane-infinity` -> `Version: 33.0.9`
- binary hash alignment:
  - `/usr/bin/titane-infinity` -> `fd16bbd3a9f86e859edb62615fdce6d6cb4bd3428a1440c8896803d560699393`
  - `src-tauri/target/release/titane-infinity` -> `fd16bbd3a9f86e859edb62615fdce6d6cb4bd3428a1440c8896803d560699393`
- launcher mapping remains aligned on local and system launchers (`Exec=/usr/bin/titane-infinity`, `Icon=titane-infinity`).
