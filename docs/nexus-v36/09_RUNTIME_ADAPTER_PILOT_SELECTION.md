# GATE 9 — RUNTIME ADAPTER PILOT SELECTION

**Project:** TITANE_INFINITY  
**Date:** 2026-05-28  
**Phase:** P1 SPEC — pilot implementation deferred to v37

---

## Pilot Objective

Select 2–3 IPC commands for the first Runtime Adapter wrapping.  
The pilot proves the adapter pattern before full rollout.  
Pilot criteria:
1. Low risk: read-only, no destructive side effects
2. Has mock fallback: `MOCK_EMPTY` or `MOCK_DEFAULT`
3. Single service file: isolated rollback
4. Not an AI/Ollama command: no model boundary implications

---

## Pilot Selection

### PILOT-01 — `persistent_memory_get_stats`

| Property | Value |
|----------|-------|
| Command | `persistent_memory_get_stats` |
| Route | `/memory` |
| Current call site | `src/pages/Memory.tsx` (or Memory service) |
| Adapter target | TauriAdapter (primary), FallbackAdapter (MOCK_ZERO) |
| Fallback behavior | Returns `{ total: 0, entries: 0 }` |
| Risk | LOW — read-only stats, zero destructive potential |
| Rollback | Revert service file, 1 file only |

**Why selected:** Cleanest read-only command with trivial mock. Perfect pilot candidate.

### PILOT-02 — `orchestrator_get_state`

| Property | Value |
|----------|-------|
| Command | `orchestrator_get_state` |
| Route | `/orchestration-center` |
| Current call site | `src/pages/OrchestrationMetaCenter.tsx` |
| Adapter target | TauriAdapter (primary), FallbackAdapter (MOCK_DEFAULT) |
| Fallback behavior | Returns default orchestrator state object |
| Risk | LOW — read-only state fetch |
| Rollback | Revert OrchestrationMetaCenter, 1 file |

**Why selected:** Well-isolated, KEEP_SYSTEM route, no daily user impact.

### PILOT-03 — `singularity_get_state`

| Property | Value |
|----------|-------|
| Command | `singularity_get_state` |
| Route | `/singularity` |
| Current call site | `src/pages/SingularityMonitor.tsx` |
| Adapter target | TauriAdapter (primary), FallbackAdapter (MOCK_DEFAULT) |
| Fallback behavior | Returns empty singularity state |
| Risk | LOW — read-only monitoring |
| Rollback | Revert SingularityMonitor, 1 file |

**Why selected:** Isolated KEEP_SYSTEM monitor; zero daily user impact.

---

## Pilot Exclusions

| Command | Reason Excluded |
|---------|----------------|
| `ai_get_response` | Ollama AI — Tauri-only, no mock allowed |
| `cloud_sync_push` | Destructive, no fallback allowed |
| `restore_snapshot` | Destructive, no fallback allowed |
| `agenda_save_event` | Write action, requires confirmation |

---

## Pilot Rollout Plan (v37)

1. **Create adapter infrastructure** (P36-09: `src/lib/titaneRuntime.ts`)
2. **Wrap PILOT-01** in Memory service
3. **Run certifier** — must PASS before proceeding
4. **Wrap PILOT-02** in OrchestrationMetaCenter
5. **Run certifier** — must PASS
6. **Wrap PILOT-03** in SingularityMonitor
7. **Run certifier** — must PASS
8. **Write test coverage** for adapter with FallbackAdapter
9. **Full adapter rollout** deferred to v37 remaining gates

---

## Verdict

```
PILOT_CANDIDATES_SELECTED=3
PILOT_01=persistent_memory_get_stats (MEMORY)
PILOT_02=orchestrator_get_state (ORCHESTRATION_CENTER)
PILOT_03=singularity_get_state (SINGULARITY)
ALL_PILOTS_READ_ONLY=YES
ALL_PILOTS_HAVE_MOCK=YES
RUNTIME_ADAPTER_PILOT_SELECTION=COMPLETE
```
