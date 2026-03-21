# Current UI / Runtime Truth

Routes verified via App.tsx analysis (prior sessions + this session).

| Surface | Route | Status |
|---------|-------|--------|
| Chat IA | /titane (canonical), /chat redirects | PARTIAL_CHAIN — Ollama IPC proven, E2E browser-only |
| EVO | /cognitive-evolution, /evo redirects | PARTIAL_CHAIN — UI mounted, backend partial |
| Agenda | /time, redirects | STUB_PATH |
| ONE CORE | /one-core | STUB_PATH |
| Stats | /dev, /stats redirects | PARTIAL_CHAIN |
| System Center | /admin, /system-center redirects | PARTIAL_CHAIN |
| Audio Center | /experience | PARTIAL_CHAIN |
| Design Center | /design-center | PARTIAL_CHAIN |
| Governance Center | /governance-center | STUB_PATH |
| QA & Monitoring | /qa-monitoring | STUB_PATH |
| Developer Mode | /dev | PARTIAL_CHAIN |
| Orchestration Center | /orchestration-center | STUB_PATH |

## Chat IPC Chain (canonical product truth)
UI → useChat → ChatEngineOmega → memoryIntegration → orchestrator → AIRouter → ai/ollama.rs::OllamaClient → Ollama HTTP
- IPC contract: `{ ok, content, error }` — mandatory, implemented
- OLLAMA_REQUEST_TIMEOUT_SECS: 120s default, 10..300s range, proven (Session 5)
- Orphaned: src-tauri/src/ollama.rs (#[allow(dead_code)], NOT in lib.rs)
