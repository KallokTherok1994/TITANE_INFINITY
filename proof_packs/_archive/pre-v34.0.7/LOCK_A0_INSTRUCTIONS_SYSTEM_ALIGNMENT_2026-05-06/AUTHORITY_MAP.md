# AUTHORITY MAP — Lock A0 v5
# Date: 2026-05-06

## Layer Structure (Active)

| Layer | Path | Purpose | Always-On | Validator-Backed |
|-------|------|---------|-----------|-----------------|
| L1 | `.github/copilot-instructions.md` | Constitutional kernel | yes | `verify_instruction_layers.sh` |
| L2 | `.github/instructions/*.instructions.md` | Scoped path instructions | path-only | `verify_instruction_layers.sh` |
| L3 | `AGENTS.md`, `*/AGENTS.md` | Local directory discipline | no | `verify_agents_index.sh` |
| L4 | `.github/agents/*.agent.md` | Specialist agents | on-demand | `verify_agents_index.sh` |
| L5 | `.github/prompts/*.prompt.md` | Reusable runbooks + router | on-demand | `verify_prompt_files_index.sh` |
| L6 | `scripts/verify/*.sh`, `scripts/autoheal/` | Mechanical truth validators | gated | `verify_instructions.sh` (51 gates) |
| L7 | `docs/research/*.md` | External advisory evidence | advisory | `verify_copilot_instruction_source_map.sh` |

## L1 Kernel (Slim — 131 lines, budget 220)

Constitutional invariants:
- Authority layer order
- Status vocabulary (PASS/FAIL/BLOCKED/DONE/SEALED/BLOCKED_APPROVAL/BLOCKED_DOCTRINE)
- Proof before verdict
- Stop-the-line
- Minimal patch
- 4-Ring architecture
- Tauri-only production runtime
- One Door network
- IPC contract
- Online-first governed + mandatory local fallback
- NO_SKIPS
- AutoHeal summary
- Mapping/testing summary
- Exploration vs Durable mode
- Session continuity
- Doctrine conflict handling
- Ollama Dev / Chat boundary summary

## L5 Prompt Inventory (12 prompts)

| Prompt | autopilot_allowed |
|--------|-------------------|
| `audit-instructions` | bounded |
| `fix-instructions-drift` | bounded |
| `update-mapping` | bounded |
| `run-proof-pack` | bounded |
| `release-readiness` | no |
| `contradiction-resolution` | no |
| `simple-fast-session` | yes |
| `heavy-runtime-session` | bounded |
| `ollama-dev-session` | bounded |
| `session-router` | yes |
| `start-hybrid-memory-dispatch` | no |
| `autopilot-lock-runner` | bounded |

## L6 Validator Gates (51 PASS)

All 51 gates passing in `verify_instructions.sh`.
New gates added in v5: G_SOURCE_MAP_SCRIPT_PRESENT, G_SOURCE_MAP_PASS, G_AUTOPILOT_BOUNDS_SCRIPT_PRESENT, G_AUTOPILOT_BOUNDS_PASS.

## L7 External Evidence

`docs/research/COPILOT_INSTRUCTION_SYSTEM_SOURCE_MAP.md`:
- 6 source entries
- 3 VERIFIED (official VS Code docs on custom instructions, prompt files, agents)
- 3 TO_VERIFY (coding agent best practices, prompt governance, instruction overload prevention)
- 0 sources promoted as adopted doctrine without VERIFIED status
