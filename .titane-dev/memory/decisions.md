# DECISIONS LOG

**Project:** TITANE_INFINITY  
**Scope:** NEXUS v36/v37 bootstrap decisions

---

## 2026-05-28 — Gate 3 — MCP Windows-first migration

**Decision:** Replace Bash MCP wrapper with PowerShell wrapper.  
**Reason:** Windows 11 does not guarantee `bash` in PATH for PowerShell terminal sessions. PowerShell is the canonical shell for this project.  
**Action:** Created `scripts/titane-dev/start-ollama-dev-mcp.ps1`, updated `.vscode/mcp.json` from `bash` to `powershell`.  
**Rollback:** `git restore -- .vscode/mcp.json`  
**Status:** EXECUTED / PASS

---

## 2026-05-28 — Gate 2 — verify:ollama:dev:live blocked

**Decision:** Do not run `verify:ollama:dev:live` and `verify:ollama:dev:stack`.  
**Reason:** User rejected these commands during original Gate 2 execution. Classified BLOCKED_USER_STOP.  
**Status:** BLOCKED_USER_STOP — requires Kevin explicit approval to rerun.

---

## 2026-05-28 — Gate 4 — Agent OS created in .titane-dev/

**Decision:** Use `.titane-dev/` as the local Agent OS root, not `.github/agents/` (which holds production-facing agent configs).  
**Reason:** `.titane-dev/` is not product runtime. Keeps dev governance separate from CI/CD-facing agent definitions.  
**Status:** EXECUTED / PASS

---

## PENDING DECISIONS

- Surface Decision Matrix classification (Gate 5 / workflow 03)
- Runtime Adapter v37 spec approval (Gate 5 / workflow 04)
- verify:ollama:dev:live and verify:ollama:dev:stack re-execution (requires Kevin approval)
- MCP manual trust confirmation in VS Code (requires Kevin action)
