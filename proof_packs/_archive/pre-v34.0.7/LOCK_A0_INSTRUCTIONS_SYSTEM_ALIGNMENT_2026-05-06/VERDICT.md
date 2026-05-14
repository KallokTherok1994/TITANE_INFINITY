# VERDICT — Lock A0 v5 — Instruction System Alignment + Bounded Research + Autopilot Boundary
# Date: 2026-05-06
# Proof Pack: proof_packs/LOCK_A0_INSTRUCTIONS_SYSTEM_ALIGNMENT_2026-05-06/

```
VERDICT: SEALED
LOCK_ID: A0
LOCK_NAME: Instruction System Alignment + Bounded Research Validation + Autopilot Boundary
MODE: DURABLE
EXEC_MODE: AUTOPILOT_SINGLE_LOCK
MUTATIONS: DRIFT_FOUND_FIXED + V5_ADDITIONS
BRANCH: MAIN
```

## Summary

Lock A0 v5 executed on top of the prior SEALED state (2026-05-06 phases A–P, PASS=47).

**Regressions detected and fixed (2 → 0 FAIL):**
- `G_VSCODE_AGENT_WORKFLOW_PASS`: `.vscode/settings.json` missing `chat.mcp.enabled: true` → restored
- `G_OLLAMA_BOUNDARY_PASS`: same root cause → restored

**v5 additions (6 new items, 4 new gates):**
- `docs/research/COPILOT_INSTRUCTION_SYSTEM_SOURCE_MAP.md` — L7 source map (6 entries, 3 VERIFIED, 3 TO_VERIFY)
- `.github/prompts/autopilot-lock-runner.prompt.md` — Single-lock Autopilot runner prompt
- `scripts/verify/verify_copilot_instruction_source_map.sh` — L7 source map validator
- `scripts/verify/verify_autopilot_lock_bounds.sh` — Autopilot boundary validator
- `scripts/verify/verify_prompt_files_index.sh` — updated (12 prompts, was 11)
- `.github/prompts/OWNERSHIP.md` — updated (added `autopilot_allowed` column + autopilot-lock-runner row)
- `scripts/verify_instructions.sh` — 4 new gates wired (G_SOURCE_MAP_SCRIPT_PRESENT, G_SOURCE_MAP_PASS, G_AUTOPILOT_BOUNDS_SCRIPT_PRESENT, G_AUTOPILOT_BOUNDS_PASS)

## Final Validator Results

| Validator | Result | FAIL | Exit |
|-----------|--------|------|------|
| `verify_instructions.sh` (master) | **PASS=51** | 0 | 0 |
| `verify_kernel_budget.sh` | PASS | 0 | 0 |
| `verify_instruction_layers.sh` | PASS | 0 | 0 |
| `verify_no_doctrine_duplication.sh` | PASS | 0 | 0 |
| `verify_status_vocabulary.sh` | PASS | 0 | 0 |
| `verify_agents_index.sh` | PASS (27/27) | 0 | 0 |
| `verify_prompt_files_index.sh` | PASS (12/12) | 0 | 0 |
| `verify_local_markers_consistency.sh` | PASS | 0 | 0 |
| `scorecard-instructions.sh` | 100/100 | 0 | 0 |
| `detect_recurrence.sh` | PASS (1640 entries) | 0 | 0 |
| `verify-ollama-copilot-boundary.sh` | PASS | 0 | 0 |
| `verify-vscode-agent-workflow.sh` | PASS (FAIL=0) | 0 | 0 |
| `verify-advanced-agents.sh` | PASS | 0 | 0 |
| `verify-agent-tooling.sh` | PASS | 0 | 0 |
| `verify_copilot_instruction_source_map.sh` | **NEW — PASS** | 0 | 0 |
| `verify_autopilot_lock_bounds.sh` | **NEW — PASS** | 0 | 0 |

Prior PASS: 47 → Current PASS: **51** (+4 new gates)

## Autopilot Boundary

`autopilot-lock-runner.prompt.md` created with:
- `AUTOPILOT_SINGLE_LOCK` declared
- Next-lock execution forbidden
- Mutation allowlist defined
- Stoplines defined
- Proof pack requirement defined
- `RETURN_CONTROL_AFTER_LOCK: true` declared

`verify_autopilot_lock_bounds.sh` validates all 10 checks — PASS.

## Research Status

`COPILOT_INSTRUCTION_SYSTEM_SOURCE_MAP.md` created with 6 entries:
- 3 VERIFIED (S001, S002, S003 — official VS Code docs)
- 3 TO_VERIFY (S004, S005, S006)
- No TO_VERIFY source promoted as doctrine
- Adoption rules section present

## Files Changed

See FILES_CHANGED.md

## Rollback

See ROLLBACK.md

## Next Lock

A1 — Version / Release / Proof Authority Alignment
See NEXT_LOCKS.md
