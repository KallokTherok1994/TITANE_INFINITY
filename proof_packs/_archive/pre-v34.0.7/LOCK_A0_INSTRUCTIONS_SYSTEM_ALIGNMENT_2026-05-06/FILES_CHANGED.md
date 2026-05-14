# FILES CHANGED — Lock A0 v5
# Date: 2026-05-06

## Regression Fix (1 file)

| File | Action | Reason |
|------|--------|--------|
| `.vscode/settings.json` | FIXED | Added back `chat.mcp.enabled: true` (regression: was removed, caused FAIL=2) |

## v5 New Files (6 files)

| File | Action | Layer | Purpose |
|------|--------|-------|---------|
| `docs/research/COPILOT_INSTRUCTION_SYSTEM_SOURCE_MAP.md` | CREATED | L7 | External source tracking, advisory only |
| `.github/prompts/autopilot-lock-runner.prompt.md` | CREATED | L5 | Single-lock Autopilot runner with boundary contract |
| `scripts/verify/verify_copilot_instruction_source_map.sh` | CREATED | L6 | Validates source map structure + adoption rules |
| `scripts/verify/verify_autopilot_lock_bounds.sh` | CREATED | L6 | Validates Autopilot prompt boundaries |
| `proof_packs/LOCK_A0_INSTRUCTIONS_SYSTEM_ALIGNMENT_2026-05-06/` | CREATED | evidence | Full v5 proof pack (this directory) |
| `docs/roadmap/TITANE_ADVANCED_INTELLIGENCE_PROGRAM_STATUS.md` | CREATED | L7 | Lock program status tracking |

## Updated Files (3 files)

| File | Action | Change |
|------|--------|--------|
| `scripts/verify/verify_prompt_files_index.sh` | UPDATED | Added `autopilot-lock-runner.prompt.md` (12 entries, was 11) |
| `.github/prompts/OWNERSHIP.md` | UPDATED | Added `autopilot_allowed` column + autopilot-lock-runner row + legend |
| `scripts/verify_instructions.sh` | UPDATED | Added 4 new gates (G_SOURCE_MAP_SCRIPT_PRESENT, G_SOURCE_MAP_PASS, G_AUTOPILOT_BOUNDS_SCRIPT_PRESENT, G_AUTOPILOT_BOUNDS_PASS) |

## Total: 10 files changed (under 20 limit)

## Files NOT Modified (confirmed clean)

```
src/**          — untouched
src-tauri/src/** — untouched
tests/**        — untouched
e2e/**          — untouched
package.json    — untouched
Cargo.toml      — untouched
Cargo.lock      — untouched
pnpm-lock.yaml  — untouched
README.md       — untouched
CHANGELOG.md    — untouched
deployment/**   — untouched
```
