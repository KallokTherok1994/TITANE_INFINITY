# GATE REPORT

- `source "$HOME/.nvm/nvm.sh" && nvm use && pnpm run tauri build` -> PASS
- `source "$HOME/.nvm/nvm.sh" && nvm use && pnpm run android:build:full` -> PASS
- `source "$HOME/.nvm/nvm.sh" && nvm use && pnpm run android:artifact:check` -> PASS
- `source "$HOME/.nvm/nvm.sh" && nvm use && pnpm run verify:tauri-configs` -> PASS
- `deployment/latest/MANIFEST.json` + `CHECKSUMS*` + `SIZES.txt` -> PASS for desktop 30.1.23
- `dpkg -s titane-infinity` -> `30.1.22`
- `sudo dpkg -i 'src-tauri/target/release/bundle/deb/TITANE Infinity_30.1.23_amd64.deb'` -> BLOCKED by interactive sudo password
- `bash scripts/update-desktop-icon.sh` -> PASS (local launcher regeneration only)
- `which -a titane-infinity` -> `/usr/bin/titane-infinity`, `/bin/titane-infinity`
- `grep -E '^(Name|Exec|Icon|StartupWMClass)=' titane-infinity.desktop ~/.local/share/applications/titane-infinity.desktop ~/.local/share/applications/TITANE-Infinity.desktop` -> shows `Name=TITANE∞ v30.1.23` and `Exec=/usr/bin/titane-infinity`
- `bash scripts/post-build/update-desktop-icons.sh` -> BLOCKED because it requires sudo to replace `/usr/bin/titane-infinity` and system desktop entries