# Prompt Ownership Map

Maps every prompt to its mission, trigger, delegated agent, validators, proof artifact, rollback, and autopilot suitability.

| Prompt                         | Mission                      | Trigger                           | Agent                      | Validators                                                                    | Proof                   | Rollback                                                                              | autopilot_allowed |
| ------------------------------ | ---------------------------- | --------------------------------- | -------------------------- | ----------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------- | ----------------- |
| `audit-instructions`           | Audit L1–L6 layers           | Instruction drift suspected       | `audit-subagent`           | 10 validators                                                                 | Gate table PASS/FAIL    | `git restore -- .github governance scripts/verify`                                    | bounded           |
| `fix-instructions-drift`       | Remove drift, reach 100/100  | Scorecard < 100 or validator FAIL | (direct)                   | 11 validators                                                                 | Scorecard 100/100       | `git restore -- .github governance`                                                   | bounded           |
| `session-router`               | Classify session mode        | Every session start               | (direct)                   | `detect_recurrence.sh`                                                        | MODE declared           | `git restore -- plans/`                                                               | yes               |
| `simple-fast-session`          | PATH_SIMPLE low-risk         | Single file, local change         | (direct)                   | `detect_recurrence.sh`                                                        | Concise proof           | `git restore -- <touched>`                                                            | yes               |
| `heavy-runtime-session`        | PATH_HEAVY full discipline   | Cross-ring, IPC, E2E, release     | (direct)                   | Full suite                                                                    | Proof pack              | Explicit `git restore`                                                                | bounded           |
| `release-readiness`            | GO/NO-GO release verdict     | Pre-release                       | `release-proof`            | Version sync, CI, gates                                                       | Release evidence        | `git restore -- package.json Cargo.toml`                                              | no                |
| `run-proof-pack`               | Produce complete proof pack  | End of governed session           | (direct)                   | `detect_recurrence.sh`                                                        | 6-file proof pack       | `git restore -- proof_packs/`                                                         | bounded           |
| `temporal-modules`             | Govern TIME stack hardening  | TIME, agenda, energy, scheduler   | `temporal-modules`         | Temporal Vitest + instruction validators                                      | TIME proof bundle       | `git restore -- .github/agents .github/instructions .github/prompts src/engines/time` | bounded           |
| `contradiction-resolution`     | Resolve doctrine conflict    | Two rules diverge                 | (direct)                   | `layer_priority.yaml`                                                         | BLOCKED_DOCTRINE or fix | `git restore -- .github governance`                                                   | no                |
| `ollama-dev-session`           | Ollama Dev MCP session       | MCP Ollama Dev active             | `ollama-dev-chat-boundary` | `verify:ollama:boundary`                                                      | Boundary validator PASS | `git restore -- .vscode/mcp.json`                                                     | bounded           |
| `update-mapping`               | Refresh mapping docs         | Architecture/surface change       | (direct)                   | `map_refresh.sh`, `detect_recurrence.sh`                                      | Mapping files updated   | `git restore -- UI_SURFACE_MAP.md ARCHITECTURE.md`                                    | bounded           |
| `start-hybrid-memory-dispatch` | Launch memory program        | Hybrid memory work                | `memory-root-commander`    | `verify_agents_index.sh`                                                      | Memory program state    | `git restore -- src/engines/`                                                         | no                |
| `autopilot-lock-runner`        | Execute single governed lock | Autopilot lock execution          | `titane-conductor`         | `verify_autopilot_lock_bounds.sh`, `verify_copilot_instruction_source_map.sh` | Full proof pack         | `git revert HEAD`                                                                     | bounded           |

## Scaling Note

This table is the canonical authority once agent-driven prompts exceed 4 entries or multi-agent collisions appear. Keep it synchronized with `scripts/verify/verify_prompt_files_index.sh`.

## autopilot_allowed Legend

| Value     | Meaning                                           |
| --------- | ------------------------------------------------- |
| `yes`     | Fully automatable, low risk                       |
| `bounded` | Automatable within explicit allowlist + stoplines |
| `no`      | Requires human confirmation before execution      |
