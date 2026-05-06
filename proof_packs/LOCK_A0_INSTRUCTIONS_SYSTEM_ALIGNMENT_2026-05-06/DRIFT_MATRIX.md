# DRIFT MATRIX — Lock A0 v5
# Date: 2026-05-06

## Drift Detected and Status

| ID | File | Layer | Issue | Action | Status |
|----|------|-------|-------|--------|--------|
| D1 | `.vscode/settings.json` | runtime config | `chat.mcp.enabled: true` removed — caused G_VSCODE_AGENT_WORKFLOW_PASS + G_OLLAMA_BOUNDARY_PASS FAIL | FIXED — restored `chat.mcp.enabled: true` | RESOLVED |
| D2 | `.github/prompts/OWNERSHIP.md` | L5 | Missing `autopilot_allowed` column — v5 requirement | FIXED — added column + legend | RESOLVED |
| D3 | `scripts/verify/verify_prompt_files_index.sh` | L6 | autopilot-lock-runner not indexed | FIXED — added to required array | RESOLVED |
| D4 | `scripts/verify_instructions.sh` | L6 | Missing source map + autopilot bounds gates | FIXED — 4 new gates added | RESOLVED |
| D5 | `docs/research/` | L7 | Missing — no external evidence tracking | CREATED — source map with 6 entries | RESOLVED |
| D6 | `.github/prompts/autopilot-lock-runner.prompt.md` | L5 | Missing — no bounded Autopilot runner prompt | CREATED | RESOLVED |

## Drift NOT Found

| Check | Result |
|-------|--------|
| Kernel overload (> 220 lines) | CLEAN — 131 lines |
| Status vocabulary duplication | CLEAN |
| BUILD ALL duplication | CLEAN |
| AutoHeal schema duplication | CLEAN |
| Local-first-only doctrine | CLEAN |
| Lower layer overriding L1 | CLEAN |
| AGENTS.md redefining global rules | CLEAN |
| Unverified public claim promoted as doctrine | CLEAN |
| Autopilot prompt executing A1+ automatically | CLEAN |
| Runtime code modified | CLEAN — none |
