# UI_DESKTOP_BACKEND_ACTIVATION_TARGETS_v57

**Date**: 2026-05-10  
**Session**: v57 — Backend Activation Reduction  
**Objective**: Reduce degraded/guarded/simulated states via safe read-only IPC flows and honest classification

---

## Tier 1 — Primary Activation Targets

| Module | Route | v56 State | v57 Target | IPC Command |
|---|---|---|---|---|
| TITANE_CHAT | `/titane` | FUNCTIONAL_LIVE_PROVEN | BACKEND_LOCAL_PROVIDER_PROVEN | `chat_get_providers_status` |
| TIME | `/time` | FUNCTIONAL_LIVE_PROVEN | BACKEND_FLOW_PROVEN | `read_snapshot`, `get_timeline` |
| MEMORY | `/memory` | FUNCTIONAL_READ_ONLY_PROVEN | BACKEND_READ_ONLY_PROVEN | `memory_get_state` |
| ADMIN_SYSTEM | `/admin` | FUNCTIONAL_LIVE_PROVEN | BACKEND_FLOW_PROVEN | `get_system_health`, `cp_get_system_info` |
| ADMIN_CONFIG | `/admin` | FUNCTIONAL_GUARDED | BACKEND_READ_ONLY_PROVEN | `cp_get_ai_config` |
| ADMIN_GOVERNANCE | `/admin` | FUNCTIONAL_GUARDED | BACKEND_GUARDED_PROVEN | secrets masked hard assert |
| DEV_COCKPIT | `/dev` | FUNCTIONAL_GUARDED | BACKEND_FLOW_PROVEN | `get_system_health` |
| DOC_CENTER | `/doc-center` | FUNCTIONAL_GUARDED | BACKEND_GUARDED_PROVEN | export guarded (not clicked) |
| RESEARCH | `/research` | FUNCTIONAL_READ_ONLY_PROVEN | BACKEND_GUARDED_PROVEN | no uncontrolled network |
| CLOUD | `/cloud` | FUNCTIONAL_READ_ONLY_PROVEN | BACKEND_GUARDED_PROVEN | no real push/pull |
| EXPERIENCE | `/experience` | FUNCTIONAL_LIVE_PROVEN | BACKEND_FLOW_PROVEN | content/state check |
| FUSION | `/fusion` | READ_ONLY_PROVEN | BACKEND_READ_ONLY_PROVEN | page load |

## Tier 2 — Utility Activation Targets

| Module | Route | v56 State | v57 Target |
|---|---|---|---|
| SKILLS | `/skills` | READ_ONLY_PROVEN | BACKEND_READ_ONLY_PROVEN |
| KNOWLEDGE | `/knowledge` | READ_ONLY_PROVEN | BACKEND_READ_ONLY_PROVEN |
| CREATION | `/creation` | READ_ONLY_PROVEN | BACKEND_READ_ONLY_PROVEN |
| EVOLUTION | `/evolution` | READ_ONLY_PROVEN | BACKEND_READ_ONLY_PROVEN |
| PERFORMANCE | `/performance` | READ_ONLY_PROVEN | BACKEND_READ_ONLY_PROVEN |
| TWINS | `/twins` | READ_ONLY_PROVEN | BACKEND_READ_ONLY_PROVEN |

## Tier 3 — Advanced/Simulated Classification

| Module | Route | v56 State | v57 Target |
|---|---|---|---|
| HYPER_CENTER | `/hyper-center` | FUNCTIONAL_DEGRADED_EXPECTED | BACKEND_DEGRADED_EXPECTED |
| REALITY_CENTER | `/reality-center` | FUNCTIONAL_DEGRADED_EXPECTED | BACKEND_DEGRADED_EXPECTED |
| QUANTUM_CENTER | `/quantum-center` | FUNCTIONAL_SIMULATED_CONFIRMED | BACKEND_SIMULATED_CONFIRMED |
| ORCHESTRATION_CENTER | `/orchestration-center` | FUNCTIONAL_DEGRADED_EXPECTED | BACKEND_DEGRADED_EXPECTED |
| ORCHESTRATION_INTEL | `/orchestration-intelligence` | FUNCTIONAL_SIMULATED_CONFIRMED | BACKEND_SIMULATED_CONFIRMED |
| SINGULARITY | `/singularity` | FUNCTIONAL_DEGRADED_EXPECTED | BACKEND_DEGRADED_EXPECTED |
| SENTINEL | `/sentinel` | FUNCTIONAL_DEGRADED_EXPECTED | BACKEND_DEGRADED_EXPECTED |
| WATCHDOG | `/watchdog` | FUNCTIONAL_DEGRADED_EXPECTED | BACKEND_DEGRADED_EXPECTED |
| SELFHEAL | `/selfheal` | FUNCTIONAL_DEGRADED_EXPECTED | BACKEND_DEGRADED_EXPECTED |
| ADAPTIVE | `/adaptive` | FUNCTIONAL_DEGRADED_EXPECTED | BACKEND_DEGRADED_EXPECTED |

## Key Policy Constraints

- **Read-only only**: No mutations, no POST writes, no destructive commands
- **Guarded by design**: Export, secrets, real push/pull = guarded, not activated
- **No BACKEND_UNKNOWN allowed**: Every module must land in a classified state
- **BACKEND_DEGRADED_EXPECTED = PASS**: Tier 3 expected-degraded modules are classified as PASS
