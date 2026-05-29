# FORBIDDEN ACTIONS

**Authority:** 00_scope_sentinel.md + nexus_phase_lock.md  
**Enforcement:** Any agent violating this list must be immediately stopped and reported to Kevin.

---

## STRUCTURAL FORBIDDEN (all phases)

- No NexusPage before Surface Decision Matrix PASS.
- No route delete before Surface Decision Matrix PASS.
- No route rename before Surface Decision Matrix PASS.
- No src/ mutation during Agent OS Setup (Gate 4).
- No src-tauri/ mutation during Agent OS Setup (Gate 4).
- No package.json mutation without a separate explicit proposal reviewed by Kevin.
- No pnpm-lock.yaml mutation without Kevin approval.
- No Cargo.toml mutation beyond spec-required additions.
- No .github/workflows/** mutation without Kevin approval.
- No .env or .env.* creation or modification.
- No release/** or deployment/** changes.

## MODEL BOUNDARY FORBIDDEN

- No qwen model in product chat defaults (product_chat_default must remain gemma2:2b).
- No qwen3.5:9b, qwen2.5-coder:*, or deepseek-coder-v2:16b in ollamaDefaults.ts or championChallenger.json.
- No dev model in Tauri OMEGA pipeline.
- No qwen2.5-coder:32b pull without Kevin explicit approval.
- No deepseek-coder-v2:16b pull without Kevin explicit approval.

## SECURITY FORBIDDEN

- No secrets, API keys, or tokens in any committed file.
- No VITE_OPENAI, VITE_GEMINI, VITE_ANTHROPIC, or similar env vars with real values in any file.
- No hardcoded cloud service credentials.

## UI FORBIDDEN

- No SIMULATED_UI in daily mode without Kevin explicit approval.
- No Time Agenda feature unless explicitly requested.
- No route mutation without Surface Decision Matrix.

## PROCESS FORBIDDEN

- No PASS verdict without verifiable proof (command output, file hash, validator output).
- No npm install (use corepack pnpm).
- No git push without Kevin instruction.
- No git clean, git reset --hard, or destructive git operations without Kevin instruction.
- No build / tauri build / release during governance phases.
- No MCP health used as product runtime health proxy.

## RUNTIME ADAPTER FORBIDDEN

- No Runtime Adapter implementation before spec is approved by Kevin.
- No HTTP route before v37 approval.
- No IPC command registration without security guard sign-off.
- No Tauri allowlist mutation without security guard sign-off.

## DISABLED AGENTS FORBIDDEN

- Agent 06 (frontend_refactor) cannot execute until Surface Decision Matrix + Kevin approval.
- Agent 07 (backend_http_rust) cannot execute until Runtime Adapter Spec + Kevin approval.
