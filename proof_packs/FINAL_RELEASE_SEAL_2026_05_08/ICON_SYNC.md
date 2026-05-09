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
