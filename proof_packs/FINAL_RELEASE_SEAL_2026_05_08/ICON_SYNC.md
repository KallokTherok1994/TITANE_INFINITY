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
