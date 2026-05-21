# TITANE_INFINITY — Windows Primary Authority Map

## Canonical post-migration truth
- Windows native is the default primary DEV rail.
- Windows native is the default primary PROD packaging/certification rail for MSI/EXE.
- GitHub clone is the working source of truth.
- External-drive backups are recovery-only.
- WSL2 Ubuntu is fallback/compatibility.
- Linux native is Linux packaging/cross-platform compatibility.

## Rail matrix
| Rail | Role | Default? | Use for | Do not use for |
|---|---:|:---:|---|---|
| Windows native | Primary | YES | daily dev, WebView2 proof, PowerShell launcher, user Dev shortcut, MSI/EXE certification | Linux AppImage/DEB proof |
| WSL2 Ubuntu | Fallback | NO | Bash-only gates, Linux compatibility, emergency recovery | same working tree as Windows native |
| Linux native | Compatibility | NO | AppImage/DEB, historical continuity, Linux release proof | default daily dev |
| GitHub Actions | Release proof | CONDITIONAL | multi-OS artifact validation | replacing local proof without logs |
| External drive | Recovery | NO | offline backup restore | primary working copy |

## Verdict vocabulary
- UNKNOWN = not proved
- BLOCKED_ENV = environment/toolchain missing
- QUALIFIED = enough proof to continue
- PASS = exact gate passed
- SEALED = proof pack/build artifact exists and relevant gates passed

## Non-negotiable truth rule
Windows primary does not mean Windows SEALED.
Windows PROD remains UNKNOWN until build proof exists.

## Windows Dev local install truth
- `scripts/windows/install-dev-shortcut.ps1` is the canonical no-admin user install for Titan-Dev.
- `Titan-Dev.lnk` must call `scripts\launch\launch-titane.ps1 -Mode dev`.
- The shortcut must not target stable/prod binaries and must not require `Program Files`.
- `scripts/windows/TitaneWindowsEnv.ps1` and `scripts/launch/dev_tauri_monitor.mjs` own the Windows Dev env bootstrap.
- Dev bootstrap may create `%APPDATA%\TITANE_INFINITY\dev\secrets-passphrase.txt` and a debug-only Dev Token, but it must not mutate stable/prod runtime identity.
- `TITANE_CERTIFIER_RAIL=dev` is the Windows local build default; stable/prod certification must explicitly use `TITANE_CERTIFIER_RAIL=stable`.
