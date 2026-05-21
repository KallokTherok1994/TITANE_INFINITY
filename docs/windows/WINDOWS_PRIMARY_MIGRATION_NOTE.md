# TITANE_INFINITY — Windows Primary Migration Note

## What changed

- Historically, Ubuntu/Linux was the primary development rail for TITANE_INFINITY.
- After the migration checkpoint, Windows native is now the canonical default for daily development and Windows production packaging (MSI/EXE).

## Why Windows is now primary

- Improved desktop packaging tooling and validation for MSI/EXE.
- Developer environment standardization on Windows for the core team.
- Better alignment with user-facing Windows installer expectations.

## What remains supported

- WSL2 Ubuntu remains a fallback and compatibility rail.
- Linux native remains supported for AppImage/DEB packaging and cross-platform verification.
- No Linux content is removed; Linux docs are demoted to fallback/packaging status.

## What must not be done

- Do not claim "Windows PROD SEALED" without artifact + logs proof.
- Do not remove Linux or WSL support.
- Do not use external-drive copies as primary working tree.
- Do not run `npm install` (use `corepack pnpm install`).

## GitHub clone as truth

- The GitHub repository is the working source of truth for code and documentation.
- External-drive copies are recovery-only.

## First proof gate (PowerShell)

```powershell
git status --short
git branch --show-current
git log -1 --oneline
node -v
corepack enable
corepack pnpm -v
corepack pnpm install
corepack pnpm run check
corepack pnpm run lint
.\scripts\launch\launch-titane.ps1
```

## Rollback of docs update

- To revert documentation changes made by this migration patch:

```powershell
git restore docs/windows/WINDOWS_PRIMARY_* docs/windows/SPINUP_WINDOWS.md README.md .github/copilot-instructions.md
```
