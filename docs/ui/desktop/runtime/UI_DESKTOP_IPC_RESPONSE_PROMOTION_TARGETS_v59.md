# UI_DESKTOP_IPC_RESPONSE_PROMOTION_TARGETS_v59

**Date**: 2026-05-10  
**Session**: v59

---

## Tier 1 Module Promotion Plan

### 1. TITANE Chat (`/titane`)

| Field | Value |
|---|---|
| v58 proof level | PROOF_DEPTH_BLOCKED_BY_RUNTIME (IPC bridge unavailable in parallel workers) |
| v59 target | `IPC_RESPONSE_PROVEN` or `BLOCKED_BY_PROVIDER` |
| Safe command | `chat_get_providers_status` |
| Expected UI evidence | Provider status list in DOM |
| Blocker | Ollama `gemma2:2b` must be running; otherwise `BLOCKED_BY_PROVIDER` |

---

### 2. TIME (`/time`)

| Field | Value |
|---|---|
| v58 proof level | PROOF_DEPTH_BLOCKED_BY_RUNTIME |
| v59 target | `IPC_RESPONSE_PROVEN` |
| Safe command | `read_snapshot`, `get_timeline` |
| Expected UI evidence | Time content rendered in `[data-testid="page-time"]` |
| Blocker | Snapshot DB must be initialized; otherwise classified `BLOCKED_BY_MISSING_COMMAND` |

---

### 3. Memory (`/memory`)

| Field | Value |
|---|---|
| v58 proof level | PROOF_DEPTH_BLOCKED_BY_RUNTIME |
| v59 target | `IPC_RESPONSE_PROVEN` or `UI_REFLECTS_BACKEND_RESULT` |
| Safe command | `memory_get_state` |
| Expected UI evidence | Memory stats in `[data-testid="page-memory"]` |
| Blocker | None expected — command is registered |

---

### 4. Doc Center (`/doc-center`)

| Field | Value |
|---|---|
| v58 proof level | PROOF_DEPTH_GUARDED_ONLY |
| v59 target | `SANDBOXED_MUTATION_PROVEN` (temp dir export) or `GUARDED_WITH_UI_PROOF` |
| Safe command | `get_documentation_index` (read-only) |
| Expected UI evidence | Doc list rendered; export button shown but guarded |
| Blocker | Temp export dir must be configurable; if not, classify `GUARDED_WITH_UI_PROOF` |

---

### 5. Admin System (`/admin`)

| Field | Value |
|---|---|
| v58 proof level | PROOF_DEPTH_BLOCKED_BY_RUNTIME |
| v59 target | `IPC_RESPONSE_PROVEN` or `UI_REFLECTS_BACKEND_RESULT` |
| Safe commands | `get_system_health`, `cp_get_system_info`, `cp_get_ai_config` |
| Expected UI evidence | System info/config displayed in admin page |
| Blocker | None — commands registered |

---

### 6. Dev Cockpit (`/dev`)

| Field | Value |
|---|---|
| v58 proof level | PROOF_DEPTH_BLOCKED_BY_RUNTIME |
| v59 target | `IPC_RESPONSE_PROVEN` or `DEGRADED_WITH_UI_PROOF` |
| Safe command | `get_system_health` |
| Expected UI evidence | Dev cockpit shows health/log output or degraded state |
| Blocker | If command unregistered, `BLOCKED_BY_MISSING_COMMAND` |

---

### 7. Research (`/research`)

| Field | Value |
|---|---|
| v58 proof level | PROOF_DEPTH_GUARDED_ONLY |
| v59 target | `GUARDED_WITH_UI_PROOF` — One Door policy (no external network) |
| Safe command | None (guarded) |
| Expected UI evidence | Research page rendered, external search blocked by one-door |
| Blocker | One Door is intentional — classification is valid |

---

### 8. Cloud (`/cloud`)

| Field | Value |
|---|---|
| v58 proof level | PROOF_DEPTH_GUARDED_ONLY |
| v59 target | `GUARDED_WITH_UI_PROOF` |
| Safe command | None (guarded) |
| Expected UI evidence | Cloud page rendered, sync gate shown |
| Blocker | No real cloud push/pull in E2E — intentional guard |

---

### 9. Agent/Chat Context (cross-route)

| Field | Value |
|---|---|
| v58 proof level | PROOF_DEPTH_BLOCKED_BY_RUNTIME |
| v59 target | `IPC_RESPONSE_PROVEN` (context from multiple routes) |
| Safe command | `chat_get_providers_status`, `chat_get_memory_stats` |
| Expected UI evidence | Provider/memory status consistent across `/titane`, `/memory`, `/admin` |
| Blocker | IPC bridge timing in parallel workers → run in single session |
