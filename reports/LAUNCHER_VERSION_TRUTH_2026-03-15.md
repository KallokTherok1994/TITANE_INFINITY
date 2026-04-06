# Launcher Version Truth - 2026-03-15

Date: 2026-03-15T22:56:12Z
Scope: scripts/update-desktop-icon.sh, titane-infinity.desktop, local desktop entries
Base commit: e91124efc

Problem:
- The desktop launcher showed TITANE∞ v28.0.0 while Exec targeted runtime/stable/Titan-Stable_27.2.0_amd64.AppImage.
- This created a user-visible version mismatch in the applications menu.

Root cause:
- scripts/update-desktop-icon.sh resolved the displayed version from canonical repo metadata instead of the binary selected for Exec.
- When the newest available AppImage was a rebuilt stable artifact carrying version 27.2.0, Name and Exec diverged.

Applied fix:
- Added artifact version extraction from the selected binary path.
- Kept canonical repo version only as fallback when the selected executable path does not expose a version.
- Regenerated titane-infinity.desktop and the local installed application entries.

Executed checks:
- bash -n scripts/update-desktop-icon.sh
- bash scripts/update-desktop-icon.sh
- rg -n '^Name=TITANE∞ v27.2.0$|^Exec=.*/Titan-Stable_27.2.0_amd64.AppImage$' titane-infinity.desktop ~/.local/share/applications/titane-infinity.desktop
- bash scripts/autoheal/detect_recurrence.sh
- bash scripts/verify_instructions.sh

Observed results:
- Launcher regeneration completed successfully.
- Tracked desktop file and installed local desktop entry both report Name=TITANE∞ v27.2.0 and Exec=runtime/stable/Titan-Stable_27.2.0_amd64.AppImage.
- AutoHeal recurrence gate passed.
- Instruction verification gate passed with FAIL=0.
