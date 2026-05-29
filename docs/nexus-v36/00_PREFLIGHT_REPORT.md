# GATE 0 — PREFLIGHT REPORT

**Mission:** NEXUS DEV LOCAL MULTI-AGENT BOOTSTRAP v2  
**Date:** 2026-05-28  
**Branch:** MAIN  
**HEAD:** 6c6aa6e01

---

## COMMANDS_RUN

```powershell
git status --short
git branch --show-current
git rev-parse --short HEAD
git log -5 --oneline
node --version
corepack pnpm --version
git --version
rustc --version
cargo --version
corepack pnpm run verify:os-host
corepack pnpm run verify:windows:toolchain
```

## FILES_READ

- docs/nexus-v36/proofs/00_git_status_short.txt
- docs/nexus-v36/proofs/01_git_branch.txt
- docs/nexus-v36/proofs/02_git_head.txt
- docs/nexus-v36/proofs/03_git_log5.txt
- docs/nexus-v36/proofs/10_node_version.txt
- docs/nexus-v36/proofs/11_pnpm_version.txt
- docs/nexus-v36/proofs/12_git_version.txt
- docs/nexus-v36/proofs/13_rustc_version.txt
- docs/nexus-v36/proofs/14_cargo_version.txt
- docs/nexus-v36/proofs/15_verify_os_host.txt
- docs/nexus-v36/proofs/16_verify_windows_toolchain.txt

## FILES_CREATED_OR_UPDATED

- docs/nexus-v36/ (directory)
- docs/nexus-v36/proofs/ (directory)
- .titane-dev/ (directory)
- docs/nexus-v36/00_PREFLIGHT_REPORT.md (this file)

## PROOFS

| Item | Value |
|------|-------|
| OS_HOST | WINDOWS_11_LOCAL (v10.0.26200) |
| Branch | MAIN |
| HEAD | 6c6aa6e01 |
| Node | v24.15.0 |
| pnpm | 10.30.2 (corepack) |
| Git | 2.54.0.windows.1 |
| rustc | 1.95.0 (59807616e 2026-04-14) |
| cargo | 1.95.0 (f2d3ce0bd 2026-03-21) |
| MSVC CL.EXE | PASS |
| MSVC LINK.EXE | PASS |
| WebView2 Runtime | PASS |
| VBScript | UNKNOWN_WITH_NOTE |
| verify:os-host | OS_HOST_CLASSIFICATION=PASS |
| verify:windows:toolchain | WINDOWS_11_TOOLCHAIN=PARTIAL |

Worktree untracked: `C\357\200\272tmpcertifier_out.txt` — external temp file, outside project scope. Worktree is effectively CLEAN.

## BLOCKERS

- VBSCRIPT_STATUS=UNKNOWN_WITH_NOTE → WINDOWS_11_TOOLCHAIN=PARTIAL (pre-existing; does not block dev setup)

## ROLLBACK

```powershell
Remove-Item -Recurse -Force docs\nexus-v36 -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .titane-dev -ErrorAction SilentlyContinue
```

## GATE_VERDICT

```
OS_HOST=WINDOWS_11_LOCAL
WORKTREE=DIRTY_ALLOWED  (single external untracked temp file, no product mutation)
TOOLCHAIN=QUALIFIED     (PARTIAL due to VBScript UNKNOWN_WITH_NOTE; all build-critical tools PASS)
```
