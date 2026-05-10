# UI_DESKTOP_BACKEND_PROOF_DEPTH_TARGETS_v58

**Date**: 2026-05-10  
**Session**: v58 — TITANE UI_DESKTOP_BACKEND_PROOF_DEPTH_AND_REMOTE_READINESS

---

## Tier 1 — Priority Modules

| Module | Route | v57 Class | Required v58 Depth | Selected Safe Flow | Required Command | Blocker if impossible |
|---|---|---|---|---|---|---|
| TITANE_CHAT | `/titane` | BACKEND_LOCAL_PROVIDER_PROVEN | IPC_RESPONSE_PROVEN or BLOCKED_BY_PROVIDER | `chat_get_providers_status` → inspect response shape | `chat_get_providers_status` | Ollama not running → BLOCKED_BY_PROVIDER |
| TIME | `/time` | BACKEND_FLOW_PROVEN | UI_REFLECTS_BACKEND_RESULT or IPC_RESPONSE_PROVEN | `read_snapshot` → verify UI shows time data | `read_snapshot`, `get_timeline` | — |
| MEMORY | `/memory` | BACKEND_READ_ONLY_PROVEN | IPC_RESPONSE_PROVEN | `memory_get_state` → inspect response | `memory_get_state` | — |
| ADMIN_SYSTEM | `/admin` | BACKEND_FLOW_PROVEN | IPC_RESPONSE_PROVEN | `get_system_health` + `cp_get_system_info` → shape check | both | — |
| DEV_COCKPIT | `/dev` | BACKEND_FLOW_PROVEN | IPC_RESPONSE_PROVEN or DEGRADED_VISIBLE | `get_system_health` → shape check | `get_system_health` | — |
| DOC_CENTER | `/doc-center` | BACKEND_GUARDED_PROVEN | GUARDED_ONLY | Export button visible, guard confirmed, no execution | none executed | Export path not configurable → GUARDED_ONLY |
| RESEARCH | `/research` | BACKEND_GUARDED_PROVEN | GUARDED_ONLY or DEGRADED_VISIBLE | No network call, page read-only | none | One Door policy |
| CLOUD | `/cloud` | BACKEND_GUARDED_PROVEN | GUARDED_ONLY | No real push/pull — assert guarded | none | One Door policy |
| AGENT_CHAT_CONTEXT | multi-route | BACKEND_FLOW_PROVEN | IPC_RESPONSE_PROVEN | Chat context cross-route navigation, IPC read | `chat_get_providers_status` | — |
| ADMIN_CONFIG | `/admin` | BACKEND_READ_ONLY_PROVEN | IPC_RESPONSE_PROVEN | `cp_get_ai_config` → shape check | `cp_get_ai_config` | — |
| ADMIN_GOVERNANCE | `/admin` | BACKEND_GUARDED_PROVEN | GUARDED_ONLY | Secrets never in DOM — hard assert | none | — |

## Tier 2 — Secondary Modules

| Module | Route | v57 Class | Required v58 Depth | Selected Flow | Blocker |
|---|---|---|---|---|---|
| EXPERIENCE | `/experience` | BACKEND_FLOW_PROVEN | IPC_RESPONSE_PROVEN | Page load + any available IPC | TBD — may be UI_ONLY |
| TWINS | `/twins` | BACKEND_READ_ONLY_PROVEN | IPC_COMMAND_PROVEN | Page load + invoke attempt | — |
| SKILLS | `/skills` | BACKEND_READ_ONLY_PROVEN | IPC_COMMAND_PROVEN | Page load | — |
| KNOWLEDGE | `/knowledge` | BACKEND_READ_ONLY_PROVEN | IPC_COMMAND_PROVEN or BLOCKED_BY_RUNTIME | `get_knowledge` if present | BLOCKED_BY_RUNTIME possible |
| CREATION | `/creation` | BACKEND_READ_ONLY_PROVEN | IPC_COMMAND_PROVEN | Page load | — |
| EVOLUTION | `/evolution` | BACKEND_READ_ONLY_PROVEN | IPC_COMMAND_PROVEN | Page load | — |
| PERFORMANCE | `/performance` | BACKEND_READ_ONLY_PROVEN | IPC_COMMAND_PROVEN or BLOCKED_BY_RUNTIME | `performance_get_metrics` | BLOCKED_BY_RUNTIME possible |
| FUSION | `/fusion` | BACKEND_READ_ONLY_PROVEN | IPC_COMMAND_PROVEN | Page load | — |

## Tier 3 — Advanced/Degraded Modules

| Module | Route | v57 Class | Required v58 Depth | Note |
|---|---|---|---|---|
| HYPER_CENTER | `/hyper-center` | BACKEND_DEGRADED_EXPECTED | DEGRADED_VISIBLE or DISPLAY_ONLY_CONFIRMED | Degraded state must be visible |
| REALITY_CENTER | `/reality-center` | BACKEND_DEGRADED_EXPECTED | DEGRADED_VISIBLE or DISPLAY_ONLY_CONFIRMED | — |
| QUANTUM_CENTER | `/quantum-center` | BACKEND_SIMULATED_CONFIRMED | DISPLAY_ONLY_CONFIRMED | Simulated — explicitly confirmed |
| ORCHESTRATION_CENTER | `/orchestration-center` | BACKEND_DEGRADED_EXPECTED | DEGRADED_VISIBLE or DISPLAY_ONLY_CONFIRMED | — |
| ORCHESTRATION_INTEL | `/orchestration-intelligence` | BACKEND_SIMULATED_CONFIRMED | DISPLAY_ONLY_CONFIRMED | Simulated — explicitly confirmed |
| SINGULARITY | `/singularity` | BACKEND_DEGRADED_EXPECTED | DEGRADED_VISIBLE or DISPLAY_ONLY_CONFIRMED | — |
| SENTINEL | `/sentinel` | BACKEND_DEGRADED_EXPECTED | DEGRADED_VISIBLE or DISPLAY_ONLY_CONFIRMED | — |
| WATCHDOG | `/watchdog` | BACKEND_DEGRADED_EXPECTED | DEGRADED_VISIBLE or DISPLAY_ONLY_CONFIRMED | — |
| SELFHEAL | `/selfheal` | BACKEND_DEGRADED_EXPECTED | DEGRADED_VISIBLE or DISPLAY_ONLY_CONFIRMED | — |
| ADAPTIVE | `/adaptive` | BACKEND_DEGRADED_EXPECTED | DEGRADED_VISIBLE or DISPLAY_ONLY_CONFIRMED | — |

## Sandbox Flows

| Module | Sandbox Action | Temp Path | Cleanup | Blocker |
|---|---|---|---|---|
| TIME | Read snapshot via IPC | N/A (read-only) | N/A | — |
| MEMORY | Read stats via IPC | N/A (read-only) | N/A | — |
| DOC_CENTER | Export (if configurable) | `/tmp/titane-e2e-test-export/` | Delete after | Path not configurable → GUARDED_ONLY |
| ADMIN_CONFIG | Read config (no apply) | N/A | N/A | — |
| CLOUD | Assert guarded | N/A | N/A | One Door policy |
| CHAT | Providers status (no AI call) | N/A | N/A | Ollama not running → BLOCKED_BY_PROVIDER |

## Proof Artifact Destination

All proof results must be written to:  
`artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl`

Each line:
```json
{
  "module": "MODULE_NAME",
  "route": "/route",
  "command": "ipc_command_name",
  "attempted": true,
  "available": true,
  "ok": true,
  "responseShape": "{ status, ... }",
  "errorKind": null,
  "latencyMs": 42,
  "proofLevel": "IPC_RESPONSE_PROVEN",
  "uiReflected": false,
  "safeToPersist": true,
  "timestamp": "2026-05-10T..."
}
```
