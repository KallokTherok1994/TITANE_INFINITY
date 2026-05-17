# OLLAMA DEV VS CODE RUNBOOK — TITANE_INFINITY

## Start

```bash
git status --short
ollama serve
pnpm run ollama:doctor
pnpm run verify:ollama:dev:live
pnpm run audit:agents:stack
```

## Fine-tuning probes

Use bounded overrides only for the DEV certification probes.

```bash
TITANE_OLLAMA_DEV_SMOKE_TIMEOUT_SEC=45 \
TITANE_OLLAMA_DEV_SMOKE_NUM_CTX=1536 \
TITANE_OLLAMA_DEV_PERF_NUM_CTX=3072 \
pnpm run verify:ollama:dev:stack
```

Keep the wrapper package pinned through `scripts/mcp/start-ollama-dev-mcp.sh` on `ollama-mcp@2.1.0`.
Use the generated local recommendation profile: `docs/dev/OLLAMA_DEV_LOCAL_PROFILE.md`.

## Trust MCP intentionally

- Open `.vscode/mcp.json`.
- Review the wrapper `scripts/mcp/start-ollama-dev-mcp.sh`.
- Review `ollama-dev`.
- If config changed unexpectedly, run `MCP: Reset Trust`.
- Start MCP from VS Code MCP controls.
- Confirm trust only after reviewing command, args, env.
- If server fails, use MCP output logs.
- Use the manual trust proof checklist: `docs/dev/OLLAMA_DEV_VSCODE_TRUST_CHECKLIST.md`.
- Record the decision in `docs/dev/OLLAMA_DEV_VSCODE_TRUST_RECORD_TEMPLATE.md`.

## Start AI session

Use:

- `.github/prompts/ollama-dev-session.prompt.md`
- `.github/agents/ollama-dev-chat-boundary.agent.md`

Declare:

- MODE: PLANNING or ACT
- touched surfaces
- expected proof
- rollback path

## Forbidden

- No qwen model in product runtime.
- No MCP transport in Product Chat.
- No PASS without command output.
- No shared mutation between DEV and Product surfaces.
- No credentials in prompts, logs, screenshots, or proof packs.
- No trust bypass by launching unreviewed MCP commands directly from the workspace config.

## Exit

```bash
pnpm run verify:ollama:boundary
pnpm run test -- tests/unit/scripts/ollamaDevConfig.test.ts
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
git status --short
```

## Certification exit

```bash
pnpm run verify:ollama:dev:stack
pnpm run verify:ollama:dev:tuning
pnpm run proof:ollama:dev:session
pnpm run proof:ollama:dev:hardening
```
