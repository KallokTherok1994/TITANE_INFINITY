# WINDOWS-FIRST POLICY

**Project:** TITANE_INFINITY  
**OS:** Windows 11 Home 10.0.26200  
**Shell:** PowerShell (primary), Bash (legacy fallback only)

---

## POLICY STATEMENT

All new scripts, wrappers, and automation for TITANE_INFINITY must be Windows-first.
PowerShell is the canonical command shell. Bash scripts are legacy and should be replaced with PowerShell equivalents when they block Windows execution.

## ENFORCED RULES

1. **MCP server**: must use PowerShell wrapper (`scripts/titane-dev/start-ollama-dev-mcp.ps1`).  
   Bash wrapper (`scripts/mcp/start-ollama-dev-mcp.sh`) is preserved but not the primary path.

2. **New scripts**: must be `.ps1` in `scripts/titane-dev/` for Windows-first tasks.  
   Bash `.sh` scripts in `scripts/mcp/` and `scripts/verify/` are permitted for cross-platform compatibility but must have PowerShell equivalents if they block Windows execution.

3. **pnpm**: always via `corepack pnpm`. Never `npm install`. Never bare `pnpm` without corepack prefix.

4. **Environment variables**: set via `$env:VAR = "value"` in PowerShell. Not `export VAR=value`.

5. **Path separators**: use backslash `\` in PowerShell file paths. Forward slash is acceptable in JSON/YAML config values.

6. **Line endings**: UTF-8 without BOM preferred. Avoid em dashes and non-ASCII in PS1 files (caused parse errors in Gate 3).

## GATE 3 LESSON

Original `.vscode/mcp.json` used `"command": "bash"` which fails in PowerShell terminal contexts without Git-Bash in PATH. Gate 3 replaced this with `"command": "powershell"` pointing to the new PS1 wrapper. Preflight test confirmed PASS.

## CURRENT MCP CONFIG

```json
{
  "servers": {
    "ollama-dev": {
      "type": "stdio",
      "command": "powershell",
      "args": ["-ExecutionPolicy", "Bypass", "-File", "scripts/titane-dev/start-ollama-dev-mcp.ps1"],
      "env": {
        "OLLAMA_HOST": "http://127.0.0.1:11434",
        "TITANE_OLLAMA_DEV_MODEL": "qwen3.5:9b"
      }
    }
  }
}
```
