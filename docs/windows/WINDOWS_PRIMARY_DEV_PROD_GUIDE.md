# TITANE_INFINITY — Windows Primary DEV + PROD Guide

## 1. Authority

- Windows native is the default primary DEV rail.
- GitHub clone is the working source of truth.
- External backups are recovery-only.
- WSL2/Linux are fallback/compatibility rails.

## 2. Required Windows prerequisites

- Git (Git for Windows)
- Node.js LTS (use the repository's `.nvmrc` or the Node LTS recommended in `DEVELOPER_SETUP.md`)
- Corepack + pnpm (use `corepack` to enable `pnpm`)
- Rust stable-msvc (install via `rustup`)
- Visual Studio Build Tools 2022 (C++ workload + Windows SDK + MSVC toolchain)
- WebView2 Runtime (Edge WebView2)
- Optional: Ollama (local LLM) — see `scripts/launch/launch-ollama.ps1`

## 3. First clone (PowerShell-first)

```powershell
mkdir C:\Dev
cd C:\Dev
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY
git status --short
git branch --show-current
git log -1 --oneline
```

## 4. First Windows proof gate

Run the following checks (PowerShell):

```powershell
node -v
corepack enable
corepack pnpm -v
rustc -V
cargo -V
corepack pnpm install
corepack pnpm run gen:tauri-config
corepack pnpm run check
corepack pnpm run lint
corepack pnpm run guard:ipc-contract
corepack pnpm run verify:tauri-only
corepack pnpm run verify:tauri-configs
.\scripts\launch\launch-titane.ps1
```

Notes:
- Do not run `npm install`. Use `corepack pnpm install` only.
- Stop immediately if `pnpm-lock.yaml` changes unexpectedly.
- `jq` is not a Windows prerequisite for the Tauri-only/config gates; the validators fall back to Node JSON parsing.
- Windows Dev launchers bootstrap a user-local Dev environment automatically: `HOME` is set from the Windows profile if missing, `TITANE_DEV_AUTO_TOKEN=1` enables debug-only Dev Token creation, and `TITANE_SECRETS_PASSPHRASE` is loaded from `%APPDATA%\TITANE_INFINITY\dev\secrets-passphrase.txt`.
- The generated Dev passphrase is local runtime state only. It is not a stable/prod secret, not committed, and not written under `Program Files`.

## 5. Dev local install

After the dev rail is proved, install the user launcher without admin rights:

```powershell
corepack pnpm run windows:install-dev-shortcut
```

This creates `Titan-Dev.lnk` for the current user and points it to:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\launch\launch-titane.ps1 -Mode dev
```

The shortcut is a Dev-only entrypoint. It does not install stable/prod binaries and does not write to `Program Files`.

The frontend prebuild certifier defaults to `TITANE_CERTIFIER_RAIL=dev` on Windows. In this rail, stable-only lanes are reported as `N/A_WITH_PROOF`, while the launcher lane verifies the `Titan-Dev.lnk` shortcut. Use `TITANE_CERTIFIER_RAIL=stable` only for a deliberate stable/prod certification run.

## 6. Stoplines

- Unexpected `pnpm-lock.yaml` mutation
- Modifications de fichiers source ou runtime par erreur
- Manque MSVC, WebView2 ou toolchain Windows
- Suggestion de `npm install` ou `build:production` avant preuve

## 7. Windows production path

- Do not run production build first. Prove dev rail before any MSI/EXE build.
- Use a dedicated branch for certification: `chore/windows-native-certification`.
- MSI/EXE proof belongs to Windows native or GitHub Actions `windows-latest`.
- Windows PROD is UNKNOWN until artifact + logs exist.

## 8. WSL2 fallback

- WSL2 remains supported as a fallback only.
- Use a separate clone under WSL (`/home/<user>/dev/TITANE_INFINITY`).
- Never share the same working tree between Windows native and WSL.

## 9. Linux-native rail

- Linux remains supported for AppImage/DEB and cross-platform testing.
- Linux is no longer the default daily dev path.

## 10. Ollama boundary

- Ollama is optional for base launch proof.
- Use `scripts/launch/launch-ollama.ps1` for Windows-based Ollama operations.
- Model downloads are not part of the initial dev proof unless explicitly required.

## 11. Decision protocol

Windows proof state values:
- `UNKNOWN` — not proved
- `BLOCKED_ENV` — environment or toolchain missing
- `QUALIFIED` — enough proof to continue
- `PASS` — gate passed with verbatim proof
