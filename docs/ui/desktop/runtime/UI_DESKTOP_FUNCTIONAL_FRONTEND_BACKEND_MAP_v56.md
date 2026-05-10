# UI_DESKTOP_FUNCTIONAL_FRONTEND_BACKEND_MAP_v56

**Date**: 2026-05-10

---

## Frontend → Backend Dependency Map (v56 Proven)

| Module | Route | IPC Commands Used | Backend Dependency | E2E State |
|---|---|---|---|---|
| TITANE_CHAT | /titane | `conversation_generate`, `get_ollama_models` | Ollama gemma2:2b | FUNCTIONAL_LIVE_PROVEN |
| TIME | /time | `get_runtime_snapshots`, `get_system_context` | Tauri IPC, snapshots | FUNCTIONAL_LIVE_PROVEN |
| MEMORY | /memory | `get_memory_items`, `search_memory` | Local memory DB | FUNCTIONAL_READ_ONLY_PROVEN |
| EXPERIENCE | /experience | `get_xp_data`, `get_level_data` | Tauri IPC + localStorage | FUNCTIONAL_LIVE_PROVEN |
| DOC_CENTER | /doc-center | `export_doc` (guarded) | File system | FUNCTIONAL_GUARDED |
| ADMIN_SYSTEM | /admin | `get_system_info` | System info | FUNCTIONAL_LIVE_PROVEN |
| ADMIN_CONFIG | /admin (config tab) | `get_app_config` | Config store | FUNCTIONAL_READ_ONLY_PROVEN |
| ADMIN_AUDIO | /admin (audio tab) | `get_audio_devices` | Audio system | FUNCTIONAL_READ_ONLY_PROVEN |
| ADMIN_GOVERNANCE | /admin (governance tab) | Keys/secrets display | Secrets store (masked) | FUNCTIONAL_GUARDED |
| DEV_COCKPIT | /total-dev | `get_dev_state`, `refresh_dev_health` | Dev state | FUNCTIONAL_GUARDED |
| CLOUD | /cloud | `sync_cloud` | Cloud provider | FUNCTIONAL_READ_ONLY_PROVEN |
| FUSION | /fusion | `get_fusion_data` | Fusion service | FUNCTIONAL_READ_ONLY_PROVEN |
| TWINS | /twins | `get_twins_data` | Twins service | FUNCTIONAL_READ_ONLY_PROVEN |
| RESEARCH | /research | `research_query` | Local index + web | FUNCTIONAL_READ_ONLY_PROVEN |
| KNOWLEDGE | /knowledge | `get_knowledge_items` | Knowledge DB | FUNCTIONAL_READ_ONLY_PROVEN |
| SKILLS | /skills | `get_skills_data` | Skills service | FUNCTIONAL_READ_ONLY_PROVEN |
| CREATION | /creation | `generate_creation` | Creation engine | FUNCTIONAL_READ_ONLY_PROVEN |
| EVOLUTION | /evolution | `get_evolution_data` | Evolution monitor | FUNCTIONAL_READ_ONLY_PROVEN |
| PERFORMANCE | /performance | `get_perf_data` | Performance service | FUNCTIONAL_READ_ONLY_PROVEN |
| SINGULARITY | /singularity | AI cognitive engine | Ollama (offline in E2E) | FUNCTIONAL_DEGRADED_EXPECTED |
| HYPER_CENTER | /hyper-center | AI cluster | Ollama (offline in E2E) | FUNCTIONAL_DEGRADED_EXPECTED |
| REALITY_CENTER | /reality-center | Reality engine | Backend (offline in E2E) | FUNCTIONAL_DEGRADED_EXPECTED |
| ORCHESTRATION_CENTER | /orchestration | Orchestrator | Backend (offline in E2E) | FUNCTIONAL_DEGRADED_EXPECTED |
| ORCHESTRATION_INTEL | /orchestration-intelligence | Orchestrator + SIMULATED | Simulated disclosure active | FUNCTIONAL_SIMULATED_CONFIRMED |
| QUANTUM_CENTER | /quantum-center | Quantum engine + SIMULATED | Simulated disclosure active | FUNCTIONAL_SIMULATED_CONFIRMED |
| SENTINEL | /sentinel | Security monitoring | Backend (offline in E2E) | FUNCTIONAL_DEGRADED_EXPECTED |
| WATCHDOG | /watchdog | Watchdog service | Backend (offline in E2E) | FUNCTIONAL_DEGRADED_EXPECTED |
| SELFHEAL | /selfheal | AutoHeal engine | Backend (offline in E2E) | FUNCTIONAL_DEGRADED_EXPECTED |
| ADAPTIVE | /adaptive | Adaptive engine | Backend (offline in E2E) | FUNCTIONAL_DEGRADED_EXPECTED |

## Backend IPC Contract

All Tauri IPC commands follow the canonical contract: `{ ok: boolean, content: T | null, error: string | null }`.  
No silent failures. Zero uncontrolled UI direct network access.
