# TITANE_INFINITY — Claude Code Operating Instructions

## Mission

Claude Code is a repo-local governed operator for TITANE_INFINITY.
It must preserve proof before verdict, patch minimality, and runtime truth.

## Core rules

- Proof before verdict. No PASS without real command output, logs, or validators.
- Patch minimal over broad refactor. One defect, one fix.
- DESIGN proposes, EXEC applies, PROOF decides.
- Visible UI is not runtime proof.
- `dist/` is not AppImage proof.
- AppImage is not launcher proof.
- Launcher is not DOM SurfaceTruth proof.
- Do not claim PASS/STABLE/SEALED without exact logs, files, commands, validators, or runtime evidence.
- Classify unproven claims as UNKNOWN or BLOCKED, never PASS.

## Required bootstrap for every repo work session

Always run first:

```bash
git status --short
git rev-parse --short HEAD
git log -20 --oneline
node -p "require('./package.json').version"
```

If unrelated worktree changes exist before your edits:
output `FRONTEND_RUNTIME_PREBUILD=BLOCKED / BUILD_ALLOWED=NO / BLOCKER=UNRELATED_WORKTREE_CHANGES`
and do not modify files until worktree state is understood.

## Frontend/runtime work

For any change touching `src/**`, UI, CSS, routes, frontend build, Tauri config, launcher, stable runtime, or visible version strings:

```bash
# Full certification (required before build):
bash scripts/verify/prebuild-frontend-runtime-certifier.sh
# Fast static-only check (no Vite build — for quick feedback during dev):
bash scripts/verify/prebuild-frontend-runtime-certifier.sh --fast
```

**UI visibility root cause**: In `src/index.css`, ALL `@import` statements must precede `@config`.
PostCSS strict mode enforces W3C CSS spec — `@config` after `@import` crashes the Vite dev server.

**IPC whitelist rule**: Every new `#[tauri::command]` in Rust MUST be added to BOTH:
1. `src/lib/tauriCommands.ts` — the string value of the command
2. `ALLOWED_COMMANDS` in `src/lib/security.ts` — or it will be silently blocked at runtime
Lane 8.6 (`gate-ipc-whitelist-completeness.sh`) detects omissions before every build.

Build is allowed only if:

```
FRONTEND_RUNTIME_PREBUILD=PASS
BUILD_ALLOWED=YES
```

If any lane is FAIL, BLOCKED, BLOCKED_ENV, UNKNOWN, PARTIAL, or NARRATIVE_ONLY: BUILD_ALLOWED=NO.

## Claude Code file structure

- `.claude/rules/frontend-runtime.md` — path-scoped frontend/runtime rules (loaded on src/** touch)
- `.claude/agents/ui-runtime-auditor.md` — read-only audit subagent
- `.claude/agents/build-launcher-certifier.md` — certifier subagent
- `.claude/skills/frontend-runtime-certifier/SKILL.md` — reusable certifier workflow

## Subagent discipline

Use `ui-runtime-auditor` for broad read-only exploration (protects main context).
Use `build-launcher-certifier` for certification runs.
Do not let subagents mutate product files except in EXEC phase.

## Output discipline

- Required proof types: verbatim command output, exit codes, file hashes, validator stdout.
- Forbidden proof types: narrative PASS, screenshot-only, source-only, docs-only, historical proof.
- Blockers: `BLOCKED_ENV`, `BLOCKED_SUDO_REQUIRED`, `BLOCKED_TOOLING`, `UNKNOWN` — never silent.

## AutoHeal

For every code modification under `src/`, `src-tauri/`, `tests/`, `e2e/`, `scripts/`, `.github/`:
append one full-schema entry to `scripts/autoheal/autoheal_rules.jsonl` and run
`bash scripts/autoheal/detect_recurrence.sh` + `bash scripts/verify_instructions.sh`.
