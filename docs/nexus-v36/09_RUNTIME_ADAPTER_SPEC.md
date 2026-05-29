# GATE 9 — RUNTIME ADAPTER V37 SPECIFICATION

**Project:** TITANE_INFINITY  
**Date:** 2026-05-28  
**Phase:** P1 SPEC — implementation deferred to v37 / Post-Gate 10 approval

---

## Mission

Define the Runtime Adapter abstraction that will replace direct `invoke()` calls in `src/`.  
This is a SPEC-ONLY document. Zero `src/` changes occur in Gate 9.

---

## Problem Statement

Gate 5 Runtime Adapter Scan found 9 direct `invoke()` occurrences in `src/`:
- 2 in commented-out code (ChatErrorBoundary, ErrorBoundary)
- 7 in JSDoc/comment documentation (src/services/api/index.ts, evolutionEngine/index.ts)

These are inactive (commented or documentation), so they pose no runtime risk now.  
However, the broader codebase uses `invoke()` from `@tauri-apps/api/tauri` or `@tauri-apps/api/core`  
throughout active service files. The adapter exists to:

1. Make runtime mode (Tauri vs. browser/HTTP) explicit at the call site
2. Enable browser-mode fallback without silent failures
3. Enable testability without a running Tauri backend

---

## Adapter Architecture

```
titaneRuntime.call(command, args)
    │
    ├── TauriAdapter         (Tauri desktop runtime)
    │   └── invoke(command, args)
    │
    ├── HttpAdapter          (browser HTTP fallback)
    │   └── fetch('/api/' + command, { body: JSON.stringify(args) })
    │
    └── FallbackAdapter      (test / offline mode)
        └── returns configured mock or throws BLOCKED_ENV
```

### Core Interface

```typescript
interface TitaneRuntime {
  call<T>(command: string, args?: Record<string, unknown>): Promise<T>;
  mode: 'tauri' | 'http' | 'fallback';
  isAvailable(): boolean;
}
```

### Adapter Selection Logic

```typescript
function selectAdapter(): TitaneRuntime {
  if (window.__TAURI__) return new TauriAdapter();
  if (process.env.VITE_HTTP_FALLBACK === 'true') return new HttpAdapter();
  return new FallbackAdapter();
}
```

---

## IPC Command Classification

Based on the Surface Decision Matrix backendCommands inventory:

| Category | Commands | Adapter Required |
|----------|----------|-----------------|
| AI/Chat | ai_get_response, ai_generate_local_stream, ai_send_prompt, ai_set_model, ai_check_ollama_status | TauriAdapter (no HTTP fallback — Ollama local only) |
| Agenda | agenda_load_events, agenda_save_event, agenda_delete_event | TauriAdapter + HttpAdapter |
| Memory | persistent_memory_read, persistent_memory_write_entry, persistent_memory_delete_entry, persistent_memory_get_stats | TauriAdapter + HttpAdapter |
| Cloud | cloud_get_status, cloud_sync_push, cloud_sync_pull, cloud_verify_integrity | TauriAdapter (no HTTP — cloud requires passphrase) |
| Orchestration | orchestrator_get_state, orchestrator_set_mode, orchestrator_run_cycle | TauriAdapter + FallbackAdapter |
| Reality | reality_get_state, reality_render_frame, reality_set_config | TauriAdapter + FallbackAdapter |
| Hyper | hyper_think, hyper_reason, hyper_imagine, hyper_generate_insight | TauriAdapter + FallbackAdapter |
| Snapshot | restore_snapshot, force_snapshot | TauriAdapter only (destructive) |
| Audio | audio_list_devices, analyze_audio | TauriAdapter only |
| Doc | export_docx_file | TauriAdapter only |
| Autofix | autofix_fix_all, autofix_detect_typescript_errors | TauriAdapter only |
| Research | web_research | TauriAdapter + HttpAdapter |
| Skills | list_skills, activate_skill, deactivate_skill, install_skill | TauriAdapter + FallbackAdapter |
| Engine subs | sentinel_subscribe, watchdog_subscribe, selfheal_subscribe, adaptive_subscribe | TauriAdapter + FallbackAdapter |
| Singularity | singularity_get_state, singularity_sync_state | TauriAdapter + FallbackAdapter |

---

## What Runtime Adapter v37 Does NOT Change

| Item | Status |
|------|--------|
| IPC command names | UNCHANGED — same strings |
| ALLOWED_COMMANDS whitelist in security.ts | UNCHANGED — adapter routes to same commands |
| tauriCommands.ts | UNCHANGED — adapter uses same constants |
| Product model (gemma2:2b) | UNCHANGED |
| Any visible UI behavior | UNCHANGED |

---

## v37 Pilot Candidates (see 09_RUNTIME_ADAPTER_PILOT_SELECTION.md)

The pilot selects 2–3 low-risk commands for the first adapter wrapping.  
Full rollout deferred to v37 gates.

---

## Verdict

```
RUNTIME_ADAPTER_SPEC=COMPLETE
ADAPTER_TYPES=3 (TauriAdapter, HttpAdapter, FallbackAdapter)
IPC_COMMANDS_CLASSIFIED=COMPLETE
SRC_MUTATIONS=0
GATE_9_RUNTIME_SPEC=PASS
```
