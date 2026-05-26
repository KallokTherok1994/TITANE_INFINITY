# OLLAMA DEV — CLINE INTEGRATION RULES

**CONSTITUTIONAL SOURCE**: `.clinerules/00-kernel.md`, `.github/copilot-instructions.md` (Rule 17)
**PURPOSE**: Enable Cline to use Ollama Dev (`qwen3.5:9b`) for local AI operations, aligned with VSCode/Copilot, Total Dev, and CLI console.
**AUTHORITY**: Operationalizes `.clinerules/00-kernel.md` — Cline mirror of Copilot kernel Rule 17.

---

## CORE CONFIGURATION

| Parameter    | Value                    | Source                                        |
| ------------ | ------------------------ | --------------------------------------------- |
| Host         | `http://127.0.0.1:11434` | `.env.ollama.example`                         |
| Model (DEV)  | `qwen3.5:9b`             | `.vscode/mcp.json`                            |
| Model (PROD) | `gemma2:2b`              | OLLAMA_RUNTIME_MAP.md                         |
| Timeout      | 90s (governed)           | E2E desktop proof truth                       |
| Transport    | IPC (Tauri backend)      | src/services/ai/transports/ollamaTransport.ts |

---

## ROUTER UNIFICATION — 4 SURFACES

| Router         | Health Check                              | Config Source                                  |
| -------------- | ----------------------------------------- | ---------------------------------------------- |
| VSCode/Copilot | `.vscode/mcp.json` → `ollama-dev` server  | `scripts/mcp/start-ollama-dev-mcp.sh`          |
| Cline          | `curl -f http://127.0.0.1:11434/api/tags` | This file (`.clinerules/50-ollama-dev.md`)     |
| Total Dev      | `GET /total-dev` → IPC `total_dev_*`      | `src-tauri/src/commands/total_dev_commands.rs` |
| Console CLI    | `ollama list`                             | `scripts/dev/ollama-dev-cli.sh`                |

---

## CLINE HOOK BEHAVIOR

### TaskStart — Context Injection

- When a task requires local AI (code generation, analysis, reasoning), inject Ollama Dev context:
  - `OLLAMA_DEV_AVAILABLE` = check curl to `http://127.0.0.1:11434/api/tags`
  - `OLLAMA_DEV_MODEL` = `qwen3.5:9b`
  - Fallback to cloud providers if Ollama Dev unavailable (no block)

### PreToolUse — Ollama Dev Readiness Check

- Before `execute_command` that requires Ollama (prompt: `ollama run`, `curl.*11434`, `generate`):
  - Check `curl -sf http://127.0.0.1:11434/api/tags > /dev/null 2>&1`
  - If DOWN: inject warning context, allow but flag degraded
- Before `execute_command` that writes to `.clinerules/` or `OLLAMA_RUNTIME_MAP.md`:
  - Warn if Ollama Dev config would be misaligned with VSCode/Total Dev

### PostToolUse — Ollama Dev Usage Logging

- Log Ollama Dev operations to `.clinerules/logs/ollama-dev.log`
- Format: `TIMESTAMP | ROUTER=cline | MODEL=qwen3.5:9b | ACTION=generate | STATUS=ok`

---

## VERIFICATION COMMANDS

```bash
# Full stack verification (all 4 routers)
pnpm run verify:ollama:dev:full-stack

# Cline-only verification
bash scripts/dev/ollama-dev-verify.sh --router=cline

# Health check
curl -sf http://127.0.0.1:11434/api/tags | jq '.models[] | select(.name | startswith("qwen3.5")) | .name'

# Live test
ollama run qwen3.5:9b "Hello, are you running?"
```

---

## DEFAULT VS CODE COPILOT MODELS

This repository's local VS Code Copilot integration is explicitly bound to Ollama Dev `qwen3.5:9b` via `.vscode/mcp.json` and the `ollama-dev` MCP server.

GitHub Copilot cloud defaults such as `sonnet-4.5`, `Sonnet 4.5`, `gpt-4.1`, and other Copilot-hosted models are considered external to this repo. They are managed by the GitHub Copilot extension and the user's GitHub account, not by TITANE_INFINITY's local repo model installation.

- Local Dev model: `qwen3.5:9b` (repo-managed Ollama Dev for VS Code/Copilot and Cline)
- Product runtime default: `gemma2:2b` (repo-managed TITANE runtime chat)
- Copilot cloud defaults: `sonnet-4.5`, `Sonnet 4.5`, `gpt-4.1`, etc. — external and not installed by this repo

Keep the boundary strict: do not migrate cloud Copilot default model names into the repo's product defaults, and do not leak `qwen3.5:9b` into runtime production defaults.

---

## BOUNDARY PROTECTION

> Dev model `qwen3.5:9b` must NEVER enter product defaults.
> Product runtime stays on `gemma2:2b`.
> No mutation of `config/championChallenger.json`, `src/config/ollamaDefaults.ts`, or `src-tauri/src/runtime_config.rs`.

---

## STATUS: CLINE_OLLAMA_DEV_ACTIVE

**Date**: 2026-05-17
**Implementation**: Hooks TaskStart, PreToolUse, PostToolUse
**Validation**: `bash scripts/dev/ollama-dev-verify.sh --router=cline`
**Integration**: `.clinerules/50-ollama-dev.md` + `scripts/dev/ollama-dev-cli.sh` + `scripts/dev/ollama-dev-verify.sh`
