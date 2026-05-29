# GATE 9 — TAURI / HTTP FALLBACK TAXONOMY

**Project:** TITANE_INFINITY  
**Date:** 2026-05-28  
**Phase:** P1 SPEC

---

## Taxonomy Purpose

Define which IPC commands can safely use each adapter type,  
and what behavior is expected when the preferred adapter is unavailable.

---

## Adapter Taxonomy Table

| Command | TauriAdapter | HttpAdapter | FallbackAdapter | Notes |
|---------|-------------|------------|----------------|-------|
| `ai_get_response` | PRIMARY | NO | BLOCKED_ENV | Ollama local-only; no HTTP fallback |
| `ai_generate_local_stream` | PRIMARY | NO | BLOCKED_ENV | Streaming Ollama; no HTTP |
| `ai_send_prompt` | PRIMARY | NO | BLOCKED_ENV | Ollama local-only |
| `ai_set_model` | PRIMARY | NO | BLOCKED_ENV | Model config; Ollama local |
| `ai_check_ollama_status` | PRIMARY | NO | MOCK_OFFLINE | Can mock as offline without risk |
| `agenda_load_events` | PRIMARY | FALLBACK | MOCK_EMPTY | Load is safe to mock empty |
| `agenda_save_event` | PRIMARY | FALLBACK | BLOCKED_ENV | Writes require runtime |
| `agenda_delete_event` | PRIMARY | FALLBACK | BLOCKED_ENV | Deletes require runtime |
| `read_time_runtime_context` | PRIMARY | FALLBACK | MOCK_STATIC | Static time mock safe |
| `persistent_memory_read` | PRIMARY | FALLBACK | MOCK_EMPTY | Read can return empty |
| `persistent_memory_write_entry` | PRIMARY | FALLBACK | BLOCKED_ENV | Writes require runtime |
| `persistent_memory_delete_entry` | PRIMARY | NO | BLOCKED_ENV | Destructive; no HTTP |
| `persistent_memory_get_stats` | PRIMARY | FALLBACK | MOCK_ZERO | Stats mock safe |
| `cloud_get_status` | PRIMARY | NO | BLOCKED_ENV | Requires passphrase |
| `cloud_sync_push` | PRIMARY | NO | BLOCKED_ENV | Destructive; no fallback |
| `cloud_sync_pull` | PRIMARY | NO | BLOCKED_ENV | Destructive; no fallback |
| `cloud_verify_integrity` | PRIMARY | NO | BLOCKED_ENV | Requires passphrase |
| `orchestrator_get_state` | PRIMARY | FALLBACK | MOCK_DEFAULT | State mock safe |
| `orchestrator_set_mode` | PRIMARY | FALLBACK | BLOCKED_ENV | Mode change requires runtime |
| `orchestrator_run_cycle` | PRIMARY | FALLBACK | BLOCKED_ENV | Cycle requires runtime |
| `reality_get_state` | PRIMARY | FALLBACK | MOCK_DEFAULT | State mock safe |
| `reality_render_frame` | PRIMARY | FALLBACK | BLOCKED_ENV | Rendering requires GPU |
| `reality_set_config` | PRIMARY | FALLBACK | BLOCKED_ENV | Config write requires runtime |
| `hyper_think` | PRIMARY | FALLBACK | MOCK_STATIC | Static think mock safe |
| `hyper_reason` | PRIMARY | FALLBACK | MOCK_STATIC | Static reason mock safe |
| `hyper_imagine` | PRIMARY | FALLBACK | MOCK_STATIC | Static imagine mock safe |
| `hyper_generate_insight` | PRIMARY | FALLBACK | MOCK_STATIC | Static insight mock safe |
| `restore_snapshot` | PRIMARY | NO | BLOCKED_ENV | Destructive; Tauri only |
| `force_snapshot` | PRIMARY | NO | BLOCKED_ENV | Destructive; Tauri only |
| `audio_list_devices` | PRIMARY | NO | MOCK_EMPTY | Device list mock safe |
| `analyze_audio` | PRIMARY | NO | BLOCKED_ENV | Requires audio hardware |
| `export_docx_file` | PRIMARY | NO | BLOCKED_ENV | File system required |
| `autofix_fix_all` | PRIMARY | NO | BLOCKED_ENV | FS mutation |
| `autofix_detect_typescript_errors` | PRIMARY | NO | MOCK_EMPTY | Error list mock safe |
| `web_research` | PRIMARY | FALLBACK | BLOCKED_ENV | Requires network access |
| `list_skills` | PRIMARY | FALLBACK | MOCK_EMPTY | Empty list safe |
| `activate_skill` | PRIMARY | FALLBACK | BLOCKED_ENV | State mutation |
| `deactivate_skill` | PRIMARY | FALLBACK | BLOCKED_ENV | State mutation |
| `install_skill` | PRIMARY | NO | BLOCKED_ENV | File system required |
| `sentinel_subscribe` | PRIMARY | NO | MOCK_INACTIVE | Subscription mock safe |
| `watchdog_subscribe` | PRIMARY | NO | MOCK_INACTIVE | Subscription mock safe |
| `selfheal_subscribe` | PRIMARY | NO | MOCK_INACTIVE | Subscription mock safe |
| `adaptive_subscribe` | PRIMARY | NO | MOCK_INACTIVE | Subscription mock safe |
| `adaptive_get_profile` | PRIMARY | FALLBACK | MOCK_DEFAULT | Profile mock safe |
| `adaptive_get_summary` | PRIMARY | FALLBACK | MOCK_DEFAULT | Summary mock safe |
| `singularity_get_state` | PRIMARY | FALLBACK | MOCK_DEFAULT | State mock safe |
| `singularity_sync_state` | PRIMARY | FALLBACK | BLOCKED_ENV | Sync requires runtime |

---

## Fallback Behavior Codes

| Code | Meaning |
|------|---------|
| `BLOCKED_ENV` | Throw `TitaneRuntimeError('BLOCKED_ENV')` — caller must handle |
| `MOCK_EMPTY` | Return empty array/object — safe for reads |
| `MOCK_ZERO` | Return zero stats — safe for display |
| `MOCK_DEFAULT` | Return configured default state object |
| `MOCK_STATIC` | Return pre-configured static response |
| `MOCK_OFFLINE` | Return `{ status: 'offline' }` — known safe state |
| `MOCK_INACTIVE` | Return subscription handle that never fires events |

---

## AI Commands — Special Rule

All Ollama AI commands (`ai_*`) are **Tauri-only with no HTTP fallback**.  
Reason: Ollama runs locally at `http://127.0.0.1:11434`.  
The Tauri backend handles the Ollama connection; the adapter does NOT bypass Tauri to call Ollama directly from the frontend.

This is enforced by `guard-model-boundary.mjs` and the MCP boundary in `ollama-dev-chat-boundary.agent.md`.

---

## Verdict

```
COMMANDS_CLASSIFIED=47
TAURI_PRIMARY=47
HTTP_FALLBACK_ALLOWED=18
FALLBACK_MOCK_ALLOWED=24
BLOCKED_ENV_COMMANDS=20
AI_COMMANDS_TAURI_ONLY=ENFORCED
TAURI_HTTP_FALLBACK_TAXONOMY=COMPLETE
```
