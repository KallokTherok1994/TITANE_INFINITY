# RUNTIME TAXONOMY

**Project:** TITANE_INFINITY  
**Purpose:** Define the boundary between product runtime and dev tooling runtime.

---

## PRODUCT RUNTIME

The product runtime is what end users interact with. It is governed by Tauri and must not be contaminated by dev tooling.

**Components:**
- Tauri v2 desktop shell (src-tauri/)
- React frontend (src/)
- Ollama chat pipeline: gemma2:2b (OMEGA pipeline)
- IPC commands registered in tauriCommands.ts + security.ts ALLOWED_COMMANDS
- Champion/Challenger model config: config/championChallenger.json
- Default Ollama config: src/config/ollamaDefaults.ts

**Truth hierarchy:**
```
AppImage > launcher > DOM SurfaceTruth
dist/ is not AppImage proof.
AppImage is not launcher proof.
Launcher is not DOM SurfaceTruth proof.
```

## DEV TOOLING RUNTIME

The dev tooling runtime is what Claude Code, VS Code Copilot, and dev agents use. It must never bleed into product runtime.

**Components:**
- MCP server: ollama-mcp@2.1.0 via scripts/titane-dev/start-ollama-dev-mcp.ps1
- Ollama dev models: qwen3.5:9b, qwen2.5-coder:14b, qwen2.5-coder:7b
- VS Code .vscode/mcp.json (PowerShell-first after Gate 3)
- Agent OS: .titane-dev/
- Governance docs: docs/nexus-v36/

**MCP health != product runtime health.**

## RUNTIME ADAPTER v37 (FUTURE)

The Runtime Adapter will abstract IPC and HTTP:
- titaneRuntime.call — unified interface
- tauriAdapter — wraps current IPC
- httpAdapter — future HTTP backend
- fallbackAdapter — graceful degradation
- runtimeTruth — canonical runtime state
- runtimeErrors — error taxonomy

Status: SPEC_ONLY in current phase. Implementation blocked until Kevin approval.

## BOUNDARY RULES

1. Dev models (qwen*) must never appear in product Ollama defaults.
2. MCP server runs on localhost:11434 — not exposed to product OMEGA pipeline.
3. TotalDevPage is a GATED DEV surface — not accessible in daily mode without unlock.
4. SIMULATED_UI routes are dev-only and must never be set as KEEP_DAILY without Kevin approval.
