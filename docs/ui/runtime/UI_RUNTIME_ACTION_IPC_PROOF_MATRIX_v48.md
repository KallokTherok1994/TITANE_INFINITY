# UI Runtime Action / IPC Proof Matrix — v48 (Section F3)

**Mission**: `TITANE_UI_BACKEND_RUNTIME_PROOF_EXECUTION_v48`
**Generated**: 2026-05-10
**Registry**: 48 actions (IPC-backed)
**Lane**: IPC contract guard + structural checks

---

## F3.1 — IPC Contract Gate Result

**Command**: `pnpm run guard:ipc-contract`
**Result**: 1 FAIL (pre-existing) / 41 PASS

| Test | Result |
|---|---|
| All 4 oauth commands in ALLOWED_COMMANDS (security.ts) | ✅ PASS |
| oauth_facebook_initiate exists in auth/commands.rs | ✅ PASS |
| All 4 oauth commands registered in main.rs invoke_handler | ✅ PASS |
| **All 4 oauth commands in tauri.conf.json capabilities** | ❌ FAIL |
| oauthService.ts calls correct IPC command names | ✅ PASS |

**Pre-existing failure**: `oauth_facebook_initiate` not in `tauri.conf.json` capabilities.
- **Root cause**: Command exists in Rust + security.ts + main.rs, but capabilities allowlist was not updated
- **Classification**: `BLOCKED_BY_PREEXISTING_TEST_FAILURE` — existed before v48, stash-verified
- **Action**: Fix required in a separate targeted patch (out of scope for v48 route proof mission)

---

## F3.2 — Tauri-Only + Online-First Gates

| Gate | Command | Result |
|---|---|---|
| Tauri-only enforcement | `pnpm run verify:tauri-only` | ✅ PASS — 0 erreurs |
| Online-first governance | `pnpm run verify:online-first` | ✅ PASS — 0 failures, 0 warnings |

---

## F3.3 — Action Categories (48 total)

| Category | Actions | IPC Proof Status |
|---|---|---|
| Chat/Conversation | send_message, generate_response, clear_history, ... | ✅ STRUCTURAL — commands.rs + contract test |
| Memory | memory_inject, memory_retrieve, memory_store, ... | ✅ STRUCTURAL — Rust commands |
| OAuth | oauth_facebook_initiate, oauth_facebook_callback, oauth_logout, oauth_status | ⚠️ PARTIAL — capability allowlist missing |
| Ollama/AI | ollama_generate, ollama_list_models, ollama_pull, ... | ✅ STRUCTURAL |
| Orchestration | orchestration_get_state, orchestration_trigger, ... | ✅ STRUCTURAL |
| Security | security_check, capability_validate, ... | ✅ STRUCTURAL |
| File/Export | generate_file, export_docx, download_artifact, ... | ✅ STRUCTURAL |
| Config | config_read, config_write, config_reset, ... | ✅ STRUCTURAL |
| Navigation | navigate_to, tab_switch, route_change, ... | ✅ STRUCTURAL (IPC not required) |

---

## F3.4 — Desktop Runtime IPC Proof

**Status**: `BLOCKED_BY_WORKSPACE_AHEAD_OF_RUNTIME`

- Desktop E2E requires Tauri binary rebuild after `src/pages/DevPage.tsx` modification
- Once rebuilt, `pnpm run e2e:desktop` will run full IPC action proof
- 47/48 actions are structurally verified — only OAuth capability allowlist needs fix

---

## F3.5 — IPC Contract Classification

| IPC | Status |
|---|---|
| Contract guard (41 checks) | ✅ PASS |
| OAuth capability allowlist | ❌ PREEXISTING_FAIL (out of scope v48) |
| Tauri-only | ✅ PASS |
| Online-first | ✅ PASS |
| Desktop IPC proof | ⏳ PENDING (rebuild required) |
| Remote gateway | ⏳ PENDING (BLOCKED_BY_REMOTE_GATEWAY) |
