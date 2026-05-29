# GATE 3 — MCP WINDOWS-FIRST REPORT

**Date:** 2026-05-28  
**HEAD:** 6c6aa6e01  
**Branch:** MAIN

---

## 1. Mission

Convert MCP dev server configuration from Bash-first to PowerShell-first for Windows 11 native execution.  
Create wrapper, run preflight test, update config, scan for secrets.

## 2. Prior status

- Gate 0: QUALIFIED
- Gate 1: QUALIFIED
- Gate 2: QUALIFIED
- VERDICT going into Gate 3: QUALIFIED

## 3. Current MCP config — before

```json
{
  "servers": {
    "ollama-dev": {
      "type": "stdio",
      "command": "bash",
      "args": ["scripts/mcp/start-ollama-dev-mcp.sh"],
      "env": {
        "OLLAMA_HOST": "http://127.0.0.1:11434",
        "TITANE_OLLAMA_DEV_MODEL": "qwen3.5:9b"
      }
    }
  }
}
```

```
MCP_CURRENT_COMMAND=bash
MCP_CURRENT_MODEL=qwen3.5:9b
MCP_CURRENT_HOST=http://127.0.0.1:11434
MCP_CURRENT_SECURITY=NO_SECRETS
```

## 4. Bash dependency status

Bash wrapper (`scripts/mcp/start-ollama-dev-mcp.sh`) exists and is functional on WSL/Git-Bash.  
However, on Windows 11, `bash` is not guaranteed in all terminal contexts (no Git-Bash PATH in PowerShell sessions by default).  
Decision: replace with PowerShell wrapper. Bash wrapper preserved — not deleted.

## 5. PowerShell wrapper created

File: `scripts/titane-dev/start-ollama-dev-mcp.ps1`

Behavior:
- Defaults `OLLAMA_HOST=http://127.0.0.1:11434` if unset
- Defaults `TITANE_OLLAMA_DEV_MODEL=qwen3.5:9b` if unset
- Verifies `/api/version` reachable (timeout 5s)
- Verifies `ollama list` returns model
- Diagnostics on stderr only (stdout reserved for MCP JSON-RPC)
- Launches `corepack pnpm dlx ollama-mcp@2.1.0`
- No secrets. No product mutation. No npm.

## 6. Preflight test result

File: `scripts/titane-dev/test-ollama-dev-mcp-preflight.ps1`

```
PASS: OLLAMA_API_VERSION :: http://127.0.0.1:11434/api/version reachable
PASS: MODEL_INSTALLED :: qwen3.5:9b in ollama list: True
PASS: PNPM_COREPACK :: pnpm version: 10.30.2
PASS: WRAPPER_FILE_EXISTS :: path: scripts\titane-dev\start-ollama-dev-mcp.ps1
PASS: WRAPPER_PINNED_PACKAGE :: contains ollama-mcp@2.1.0: True
PASS: WRAPPER_NO_SECRETS :: secret scan: CLEAN

MCP_PREFLIGHT=PASS  (exit code 0)
```

## 7. MCP config — updated

```json
{
  "servers": {
    "ollama-dev": {
      "type": "stdio",
      "command": "powershell",
      "args": [
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        "scripts/titane-dev/start-ollama-dev-mcp.ps1"
      ],
      "env": {
        "OLLAMA_HOST": "http://127.0.0.1:11434",
        "TITANE_OLLAMA_DEV_MODEL": "qwen3.5:9b"
      }
    }
  }
}
```

Backup at: `docs/nexus-v36/proofs/gate3_40_mcp_json_backup_before_update.txt`

## 8. MCP trust status

```
MCP_TRUST=MANUAL_REQUIRED
```

VS Code requires the user to manually accept the MCP server in the UI after config change.  
This gate does not auto-trust. Kevin must open VS Code and approve the server when prompted.  
MCP health does NOT imply product chat health.

## 9. Security scan result

All pattern matches in `test-ollama-dev-mcp-preflight.ps1` are DOC_EXAMPLE:  
the script's own `$secretPatterns` array lists the pattern names as strings to search for — no real credentials assigned.

```
MCP_SECRETS_CLASSIFICATION=DOC_EXAMPLE
MCP_SECRETS=PASS
```

No secrets in: `.vscode/mcp.json`, `.vscode/settings.json`, `start-ollama-dev-mcp.ps1`.

## 10. Dev/Product boundary note

- MCP server uses `qwen3.5:9b` exclusively
- Product chat baseline remains `gemma2:2b` (unchanged, not in scope)
- `gemma2:2b` does NOT appear in any MCP config file
- No product runtime files were touched

## 11. Files created/updated

```
CREATED: scripts/titane-dev/start-ollama-dev-mcp.ps1
CREATED: scripts/titane-dev/test-ollama-dev-mcp-preflight.ps1
UPDATED: .vscode/mcp.json   (bash -> powershell wrapper)

CREATED: docs/nexus-v36/03_MCP_WINDOWS_FIRST_REPORT.md (this file)

PROOF FILES:
  docs/nexus-v36/proofs/gate3_00_git_status_before.txt
  docs/nexus-v36/proofs/gate3_01_git_branch.txt
  docs/nexus-v36/proofs/gate3_02_git_head.txt
  docs/nexus-v36/proofs/gate3_10_mcp_json_before.txt
  docs/nexus-v36/proofs/gate3_11_vscode_settings_before.txt
  docs/nexus-v36/proofs/gate3_12_existing_bash_wrapper.txt
  docs/nexus-v36/proofs/gate3_20_ps1_wrapper_created.txt
  docs/nexus-v36/proofs/gate3_30_mcp_preflight_test.txt
  docs/nexus-v36/proofs/gate3_40_mcp_json_backup_before_update.txt
  docs/nexus-v36/proofs/gate3_41_mcp_json_after_update.txt
  docs/nexus-v36/proofs/gate3_50_mcp_security_scan.txt
  docs/nexus-v36/proofs/gate3_90_git_status_after.txt
```

## 12. Files not touched

```
src/**                   NOT TOUCHED
src-tauri/**             NOT TOUCHED
package.json             NOT TOUCHED
pnpm-lock.yaml           NOT TOUCHED
Cargo.toml               NOT TOUCHED
.github/**               NOT TOUCHED
scripts/mcp/start-ollama-dev-mcp.sh   NOT TOUCHED (preserved, not deleted)
C:\tmpcertifier_out.txt  NOT TOUCHED
```

## 13. Rollback

```powershell
git restore -- .vscode/mcp.json
Remove-Item -Force scripts\titane-dev\start-ollama-dev-mcp.ps1 -ErrorAction SilentlyContinue
Remove-Item -Force scripts\titane-dev\test-ollama-dev-mcp-preflight.ps1 -ErrorAction SilentlyContinue
```

## 14. Final Gate 3 verdict

```
MCP_WRAPPER_PS1=PASS
MCP_PREFLIGHT=PASS        (exit 0, all 6 checks PASS)
MCP_CONFIG=PASS_WINDOWS_FIRST
MCP_TRUST=MANUAL_REQUIRED (user must approve in VS Code)
MCP_SECRETS=PASS
GATE_3_VERDICT=PASS
```
