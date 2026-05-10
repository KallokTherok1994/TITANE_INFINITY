# UI Desktop IPC Response — Module Matrix v59

**Session**: `TITANE_UI_DESKTOP_IPC_RESPONSE_REFLECTION_AND_REMOTE_SYNC_v59`
**Date**: 2026-05-10

---

## Module Coverage Matrix

| Module | Route | IPC Command | Proof Level v58 | Proof Level v59 | Delta |
|---|---|---|---|---|---|
| TITANE_CHAT | `/titane` | `chat_get_providers_status` | BLOCKED_BY_RUNTIME | **UI_REFLECTS_BACKEND_RESULT** | ✅ +5 |
| TITANE_CHAT | `/titane` | `chat_get_memory_stats` | BLOCKED_BY_RUNTIME | **UI_REFLECTS_BACKEND_RESULT** | ✅ +5 |
| TIME | `/time` | `read_snapshot` | BLOCKED_BY_RUNTIME | **UI_REFLECTS_BACKEND_RESULT** | ✅ +5 |
| TIME | `/time` | `get_timeline` | BLOCKED_BY_RUNTIME | BLOCKED_BY_RUNTIME | = |
| MEMORY | `/memory` | `memory_get_state` | BLOCKED_BY_RUNTIME | **UI_REFLECTS_BACKEND_RESULT** | ✅ +5 |
| EXPERIENCE | `/experience` | — | BLOCKED_BY_RUNTIME | BLOCKED_BY_RUNTIME | = |
| RESEARCH | `/research` | — | BLOCKED_BY_RUNTIME | GUARDED_ONLY | ⬆ +1 |
| CLOUD | `/cloud` | — | BLOCKED_BY_RUNTIME | GUARDED_ONLY | ⬆ +1 |
| ADMIN_SYSTEM | `/admin` | `get_system_health` | BLOCKED_BY_RUNTIME | **UI_REFLECTS_BACKEND_RESULT** | ✅ +5 |
| ADMIN_SYSTEM | `/admin` | `cp_get_system_info` | BLOCKED_BY_RUNTIME | BLOCKED_BY_RUNTIME | = |
| ADMIN_CONFIG | `/admin` | `cp_get_ai_config` | BLOCKED_BY_RUNTIME | BLOCKED_BY_RUNTIME | = |
| DEV_COCKPIT | `/dev` | `get_system_health` | BLOCKED_BY_RUNTIME | **UI_REFLECTS_BACKEND_RESULT** | ✅ +5 |
| PERFORMANCE | `/performance` | `performance_get_metrics` | BLOCKED_BY_RUNTIME | **UI_REFLECTS_BACKEND_RESULT** | ✅ +5 |
| SKILLS | `/skills` | — | BLOCKED_BY_RUNTIME | DISPLAY_ONLY_CONFIRMED | ⬆ +1 |
| KNOWLEDGE | `/knowledge` | — | BLOCKED_BY_RUNTIME | DISPLAY_ONLY_CONFIRMED | ⬆ +1 |
| CREATION | `/creation` | — | BLOCKED_BY_RUNTIME | BLOCKED_BY_RUNTIME | = |
| EVOLUTION | `/evolution` | — | BLOCKED_BY_RUNTIME | BLOCKED_BY_RUNTIME | = |
| TWINS | `/twins` | — | BLOCKED_BY_RUNTIME | BLOCKED_BY_RUNTIME | = |
| FUSION | `/fusion` | — | BLOCKED_BY_RUNTIME | BLOCKED_BY_RUNTIME | = |
| DOC_CENTER | `/doc-center` | `get_documentation_index` | BLOCKED_BY_RUNTIME | **UI_REFLECTS_BACKEND_RESULT** | ✅ +5 |
| ORCHESTRATION | `/orchestration-center` | — | BLOCKED_BY_RUNTIME | BLOCKED_BY_RUNTIME | = |
| ORCHESTRATION_INT | `/orchestration-intelligence` | — | BLOCKED_BY_RUNTIME | BLOCKED_BY_RUNTIME | = |
| AUTH | `/admin` | `oauth_facebook_get_profile` | BLOCKED_BY_RUNTIME | BLOCKED_BY_RUNTIME | = |
| SELFHEAL | `/selfheal` | — | BLOCKED_BY_RUNTIME | DISPLAY_ONLY_CONFIRMED | ⬆ +1 |
| ADAPTIVE | `/adaptive` | — | BLOCKED_BY_RUNTIME | DISPLAY_ONLY_CONFIRMED | ⬆ +1 |
| SINGULARITY | `/singularity` | — | BLOCKED_BY_RUNTIME | DISPLAY_ONLY_CONFIRMED | ⬆ +1 |
| SENTINEL | `/sentinel` | — | BLOCKED_BY_RUNTIME | GUARDED_ONLY | ⬆ +1 |
| WATCHDOG | `/watchdog` | — | BLOCKED_BY_RUNTIME | GUARDED_ONLY | ⬆ +1 |
| HYPER | `/hyper-center` | — | BLOCKED_BY_RUNTIME | GUARDED_ONLY | ⬆ +1 |
| REALITY | `/reality-center` | — | BLOCKED_BY_RUNTIME | GUARDED_ONLY | ⬆ +1 |
| QUANTUM | `/quantum-center` | — | BLOCKED_BY_RUNTIME | GUARDED_ONLY | ⬆ +1 |

---

## Level Summary

| Level | Count |
|---|---|
| UI_REFLECTS_BACKEND_RESULT | 11 |
| PROOF_DEPTH_BLOCKED_BY_RUNTIME | 39 |
| PROOF_DEPTH_GUARDED_ONLY | 10 |
| PROOF_DEPTH_DISPLAY_ONLY_CONFIRMED | 5 |

**Total routes with any promotion**: 16 out of ~30 inspected.
