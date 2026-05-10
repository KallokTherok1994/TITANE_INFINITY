# UI_DESKTOP_TAURI_IPC_ALLOWLIST_v62

**Mission:** TITANE UI_DESKTOP_TAURI_IPC_PROBE_BRIDGE_v62  
**Date:** 2026-05-10 | **Version:** v33.0.12

---

## Allowlist Overview

8 safe read-only IPC commands registered in `src/e2e/desktop/e2eIpcProbeAllowlist.ts`.

| commandId | command (Rust) | Module | rusticImplemented | inSecurityAllowlist |
|-----------|----------------|--------|-------------------|---------------------|
| `system_health` | `get_system_health` | SYSTEM | true | true |
| `helios_metrics` | `get_helios_metrics` | SYSTEM | true | true |
| `helios_state` | `get_helios_state` | SYSTEM | true | true |
| `experience_state` | `experience_get_state` | EXPERIENCE | true | true |
| `memory_state` | `memory_get_state` | MEMORY | true | true |
| `memory_state_alt` | `get_memory_state` | MEMORY | true | true |
| `health_check` | `health_check` | CORE | true | true |
| `cloud_status` | `cloud_get_status` | CLOUD | true | true |

---

## Policy

- All commands are **read-only** (no mutations, no side effects)
- No destructive command patterns allowed (see `DESTRUCTIVE_PATTERNS` in bridge)
- `web_research` excluded: performs external network calls (One Door policy, Rule 5)
- RESEARCH module has no safe command → `BLOCKED_BY_MISSING_SAFE_COMMAND`

---

## Security Guards in Bridge

17 destructive patterns blocked:
- `delete`, `remove`, `drop`, `purge`, `erase`, `clear`, `reset`, `wipe`
- `write`, `set_`, `put_`, `push_`, `update`, `mutate`, `execute`, `run_`, `send_`

Any commandId matching these patterns is blocked with `COMMAND_BLOCKED_DESTRUCTIVE`.

---

## Source

- Allowlist: `src/e2e/desktop/e2eIpcProbeAllowlist.ts`
- Bridge: `src/e2e/desktop/e2eIpcProbeBridge.ts`
- Security gate: `src/lib/security.ts` ALLOWED_COMMANDS
