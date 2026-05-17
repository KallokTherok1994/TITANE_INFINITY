# OLLAMA DEV VS CODE MCP TRUST CHECKLIST

## Manual proof steps

1. Open the `TITANE_INFINITY` workspace in VS Code.
2. Open `.vscode/mcp.json`.
3. Review the `ollama-dev` server:
   - command: `bash`
   - args: `scripts/mcp/start-ollama-dev-mcp.sh`
   - host: `http://127.0.0.1:11434`
   - model: `qwen3.5:9b` or approved DEV-only override
4. Review the wrapper `scripts/mcp/start-ollama-dev-mcp.sh` before trusting the server.
5. If MCP config changed unexpectedly, run `MCP: Reset Trust`.
6. Run `MCP: List Servers`.
7. Start `ollama-dev`.
8. Accept trust only after reviewing config.
9. Open MCP output logs.
10. Confirm server status is `Running`.
11. Confirm tools are discovered.
12. Do not start directly from `mcp.json` if trust prompt is required.
13. Record the result in `docs/dev/OLLAMA_DEV_VSCODE_TRUST_RECORD_TEMPLATE.md`.
14. Store the filled record and any screenshots/logs under `reports/vscode-mcp-trust/`.

## Manual proof record

- date:
- VS Code version:
- workspace:
- wrapper reviewed:
- server status:
- tools discovered:
- operator initials:
- screenshot/log path if any:
