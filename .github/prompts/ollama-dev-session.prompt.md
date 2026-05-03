# Prompt: Ollama Dev Session

## Scope

Use this prompt when starting a development session with the MCP Ollama Dev server active.

## Pre-flight check

1. Verify Ollama is running: `curl -s http://127.0.0.1:11434/api/version`
2. Verify qwen3.5:9b is available: `ollama list | grep qwen3.5:9b`
3. Verify boundary wiring: `pnpm run verify:ollama:boundary`

## Session capabilities

- Context window: qwen3.5:9b can handle long-context analysis (up to 128K tokens)
- Reasoning: use explicit staged prompts or `/think` style requests for deep architectural decisions
- Structured actions: prefer tool-oriented and verifiable outputs when changing runtime surfaces
- Language: French or English supported without changing runtime doctrine

## Boundary invariant

The Ollama Dev MCP surface is isolated from the TITANE product runtime.
Never modify product defaults (`gemma2:2b`) during an Ollama Dev session.

## Exit criteria

- `pnpm run verify:ollama:boundary` exits 0
- No contamination of product runtime surfaces
- AutoHeal entry appended for every code modification (Rule 10)
