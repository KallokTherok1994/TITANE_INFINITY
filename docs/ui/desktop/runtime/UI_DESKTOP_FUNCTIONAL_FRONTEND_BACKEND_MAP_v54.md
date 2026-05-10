# UI_DESKTOP_FUNCTIONAL_FRONTEND_BACKEND_MAP_v54

**Version**: TITANE_INFINITY v33.0.11  
**Date**: 2026-05-10  

---

## Frontend ↔ Backend Flow Map (Proven in v54)

| Module | Route | Frontend Entry | IPC Command(s) | Backend Service | E2E Flow Proven |
|---|---|---|---|---|---|
| TITANE Chat | /titane | src/pages/Titane/ | conversation_generate, ollama_status | conversation_engine, ollama.rs | PROVEN: provider truth, composer visible |
| TIME | /time | src/pages/TimePage.tsx | time_get_current, agenda_get_events | time engine, agenda store | PROVEN: runtime source, chat sync status |
| Memory | /memory | src/pages/Memory.tsx | memory_get_entries, memory_search | memory bridge (SQLite) | BLOCKED_E2E_INIT: ErrorBoundary in E2E |
| Experience | /experience | src/pages/ExperiencePage.tsx | experience_get_stats | experience engine | READ_ONLY: XP/level displayed |
| Doc Center | /doc-center | src/pages/DocCenter/ | doc_export_docx (guarded) | doc export service | GUARDED: export requires confirmation |
| Admin | /admin | src/pages/Admin/ | system_info, config_get | config, system | READ_ONLY: content visible |
| Dev | /dev | src/pages/DevPage.tsx | dev_health_check | dev health service | READ_ONLY: health state visible |
| Fusion | /fusion | src/pages/Fusion/ | (internal) | fusion engine | DISPLAY_ONLY: content visible |
| Research | /research | src/pages/Research/ | research_query (guarded) | research service | READ_ONLY: form visible, no query sent |
| Cloud | /cloud | src/pages/CloudCenter/ | cloud_sync_status | cloud sync | READ_ONLY: sync status visible |
| Twins | /twins | src/pages/Twins/ | (internal) | twins engine | READ_ONLY: content visible |
| Skills | /skills | src/pages/Skills/ | (internal) | skills engine | READ_ONLY: content visible |
| Knowledge | /knowledge | src/pages/Knowledge/ | (internal) | knowledge engine | READ_ONLY: content visible |
| Creation | /creation | src/pages/Creation/ | (internal) | creation engine | READ_ONLY: content visible |
| Evolution | /evolution | src/pages/Evolution/ | (internal) | evolution engine | READ_ONLY: content visible |
| Performance | /performance | src/pages/Performance/ | (internal) | perf engine | READ_ONLY: content visible |
| Hyper Center | /hyper-center | src/pages/HyperCenter/ | (internal) | hyper engine | READ_ONLY: content visible |
| Reality Center | /reality-center | src/pages/RealityCenter/ | (internal) | reality engine | READ_ONLY: content visible |
| Quantum Center | /quantum-center | src/pages/QuantumCenter/ | N/A (SIMULATED) | simulated | SIMULATED_CONFIRMED: banner displayed |
| Orchestration Center | /orchestration-center | src/pages/OrchestrationCenter/ | orchestration_status | orch service | READ_ONLY: content visible |
| Orchestration Intelligence | /orchestration-intelligence | src/pages/OrchestrationIntelligence/ | N/A (SIMULATED) | simulated | SIMULATED_CONFIRMED: banner displayed |
| Singularity | /singularity | src/pages/Singularity/ | (internal) | singularity monitor | READ_ONLY: content visible |
| Sentinel | /sentinel | src/pages/Sentinel/ | (internal) | sentinel service | READ_ONLY: content visible |
| Watchdog | /watchdog | src/pages/Watchdog/ | (internal) | watchdog service | READ_ONLY: content visible |
| SelfHeal | /selfheal | src/pages/SelfHeal/ | (internal) | selfheal engine | READ_ONLY: content visible |
| Adaptive Engine | /adaptive | src/pages/Adaptive/ | (internal) | adaptive engine | READ_ONLY: content visible |
| HTF | /htf | src/pages/HTF/ | (internal) | htf module | LIVE: tabs + historique visible |

---

## IPC Contract Compliance

- All IPC calls routed through canonical `{ ok, content, error }` contract
- No direct network calls from UI bypassing IPC (verified by verify:online-first gate PASS)
- oauth_facebook_initiate: PREEXISTING_IPC_GUARD_FAILURE (tauri.conf.json capabilities gap, not v54-introduced)
- Governed actions (export, push/pull, delete): confirmed guarded via ui-desktop-security spec PASS
