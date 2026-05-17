# MCP LOCAL SECURITY POLICY — TITANE_INFINITY

## Scope

This policy governs local VS Code MCP usage for the Ollama Dev surface only.

## Mandatory rules

- Never expose `.env`.
- Never expose tokens, SSH keys, API keys, browser cookies, or password manager contents.
- Review MCP config before trust.
- No direct trust bypass is allowed for unreviewed MCP startup commands.
- Prefer wrapper-based MCP launch over direct `pnpm dlx` in `.vscode/mcp.json`.
- Keep the wrapper pinned to `ollama-mcp@2.1.0`; do not reintroduce `@latest`.
- Keep package provenance recorded in `reports/mcp-package-provenance/ollama-mcp-2.1.0.md`.
- Keep `.vscode/mcp.json` free of secret-bearing env vars.
- Keep proof logs free of secrets.
- MCP success is not Product Chat proof.

## Boundary

- Product Chat remains `gemma2:2b`.
- Ollama Dev MCP remains `qwen3.5:9b`.
- No shared default mutation is allowed across DEV and Product surfaces.
