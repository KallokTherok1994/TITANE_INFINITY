# UI_FRONTEND_BACKEND_SYNC_REPAIR v84

**Date**: 2026-05-12T13:30:09Z

---

## IPC Contract Verification

All frontend IPC calls follow the canonical One Door pattern:
`UI → tauriClient → invoke → Rust command → { ok, content, error }`

### Critical Surfaces Verified

| Surface | Command | Frontend Status | Backend Status | Sync |
|---------|---------|----------------|----------------|------|
| TIME page snapshots | `list_snapshots` | ✅ implemented | ✅ in handlers.rs | ✅ |
| TIME page stats | `get_travel_stats` | ✅ implemented | ✅ in handlers.rs | ✅ |
| Chat/Conversation | `conversation_generate` | ✅ OMEGA pipeline | ✅ gemma2:2b PROD | ✅ |
| Memory stats | `memory_get_stats` | ✅ | ✅ | ✅ |
| Agent registry | local store | ✅ | N/A | ✅ |
| Version string | `__APP_VERSION__` Vite | ✅ `33.0.17` | N/A (build-time) | ✅ |

### Capabilities (tauri.conf.json)

Both `list_snapshots` and `get_travel_stats` are registered in:
- `src-tauri/tauri.conf.json` (confirmed present)
- `src-tauri/capabilities/persistence.json` (confirmed present)
- `src/lib/security.ts` ALLOWED_COMMANDS (confirmed present)

### No UNKNOWN States

All surfaces have classified states:
- `degraded` → `HONEST_DEGRADED_DISCLOSURE` (fresh install, no snapshots yet)
- `PARTIAL` badge → `SurfaceTruthBadge` correct usage
- `EMPTY_INITIAL_STATE` → fresh install zero values, expected

## Runtime Truth vs Stub Audit

No stubbed/fake data was found in production-facing surfaces. All displayed values come from:
1. Vite-injected build-time constants (`__APP_VERSION__`)
2. IPC backend responses (with honest error handling)
3. Local engine state (AgendaEngine, EnergyEngine, PriorityEngine)

## VERDICT

`FRONTEND_BACKEND_SYNC`: **CONFIRMED — no UNKNOWN states, no fake values**  
`IPC_CONTRACT`: **INTACT — all commands follow { ok, content, error } pattern**
