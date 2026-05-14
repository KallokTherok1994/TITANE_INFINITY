# Surface Map — Inventaire Global
**Date:** 2026-03-03T20:12:50Z | **Commit:** a0a4eeb3 | **Version:** 27.2.0

---

## Domaine 1 — UI/UX/Navigation

| Surface | Chemin | Status |
|---------|--------|--------|
| App root + routing | src/App.tsx | STABLE |
| TopNav (navigation principale) | src/components/layout/TopNav.tsx | STABLE |
| MobileNav | src/components/layout/MobileNav.tsx | STABLE |
| AppShell | src/components/layout/ | STABLE |
| Pages (38 fichiers) | src/pages/ | STABLE/DEV mixed |
| Onboarding | src/components/Onboarding/ | STABLE |
| ErrorBoundary / AutoHealErrorBoundary | src/components/*.tsx | STABLE |
| Toast notifications | src/ui/components/Toast.tsx | STABLE |
| PageLoadingFallback | src/ui/components/PageLoadingFallback.tsx | STABLE |
| Design System | src/design-system/ | EXPERIMENTAL |

**Routes actives (27):** /titane, /stats, /time, /admin, /dev, /fusion, /optimization, /orchestration-intelligence, /orchestration-center, /reality-center, /hyper-center, /quantum-center, /identity-center, /memory-evolution, /cloud, /knowledge, /creation, /evolution, /singularity, /experience, /sentinel, /watchdog, /selfheal, /adaptive, /memory, /research, /performance

**Routes redirect (37):** /, /chat, /camera, /evo, /dashboard, /settings, /cognitive, etc.

---

## Domaine 2 — Chat IA / Orchestrateur

| Surface | Chemin | Status |
|---------|--------|--------|
| ConversationSection (UI principale) | src/components/sections/ConversationSection.tsx | STABLE |
| useConversationEngine | src/hooks/useConversationEngine.ts | STABLE |
| ConversationManager | src/services/ai/ConversationManager.ts | STABLE |
| Chat Orchestrator (Overdrive) | src-tauri/src/ (overdrive module) | STABLE |
| AI Router (multi-provider) | src/services/ai/ | STABLE |
| Providers: Ollama/Gemini/OpenAI/Claude/Copilot | src/services/ai/providers/ | DEV (external keys required) |
| HybridTTS | src/services/audio/ | STABLE (local) |
| ModeBuilder | src/components/chat/ | STABLE |
| Streaming | src/services/ai/transports/ | STABLE |

---

## Domaine 3 — Providers / API / Fallback

| Surface | Chemin | Status |
|---------|--------|--------|
| Ollama provider (local) | src/services/ai/providers/ollama.ts | STABLE (fallback) |
| Gemini provider | src/services/ai/providers/ | DEV (API key) |
| OpenAI provider | src/services/ai/providers/ | DEV (API key) |
| Claude/Anthropic | src/services/ai/providers/ | DEV (API key) |
| Copilot provider | src/services/ai/providers/ | DEV (API key) |
| Provider health check | chat_check_providers IPC | STABLE |
| Fallback chain | src/services/ai/transports/ollamaTransport.ts | STABLE |
| ALLOWED_COMMANDS whitelist | src/lib/security.ts | STABLE |
| Error classification | src/lib/errorClassification.ts | STABLE |

---

## Domaine 4 — Mémoire (STM/MTM/LTM)

| Surface | Chemin | Status |
|---------|--------|--------|
| Memory OS | src-tauri/src/api/memory_api.rs | STABLE |
| Memory Section (UI) | src/components/sections/MemorySection.tsx | STABLE |
| Memory Evolution Center | src/components/MemoryEvolution/ | STABLE |
| Persistence / Snapshots | src-tauri/src/persistence/ | STABLE |
| useChatMemory / useChatMemoryCache | src/hooks/useChat*.ts | STABLE |
| RAG semantic recall | src-tauri/src/ (knowledge module) | EXPERIMENTAL |

---

## Domaine 5 — IPC / Backend Commands

| Surface | Chemin | Status |
|---------|--------|--------|
| tauriClient (canonical gateway) | src/lib/tauriClient.ts | STABLE |
| secureInvoke + ALLOWED_COMMANDS | src/lib/security.ts | STABLE |
| safeInvoke wrapper | src/utils/invoke.ts | STABLE |
| tauriProtector (validation) | src/utils/tauriProtector.ts | STABLE |
| IPC error classification | src/lib/errorClassification.ts | STABLE |
| Tauri commands registry | src-tauri/src/main.rs (~300 commands) | STABLE |
| serviceInvoker | src/lib/serviceInvoker.ts | STABLE |

---

## Domaine 6 — Config / Performance

| Surface | Chemin | Status |
|---------|--------|--------|
| Runtime config | src/config/ | STABLE |
| Vite config | vite.config.ts | STABLE |
| Tauri config | src-tauri/tauri.conf.json | STABLE |
| Performance monitoring | src/services/ai/performanceMonitor.ts | STABLE |
| Adaptive FPS | src/hooks/useAdaptiveFPS.ts | EXPERIMENTAL |
| WASM optimization | src/components/optimization/ | EXPERIMENTAL |
| Bundle analysis | analyze-bundle.sh | TOOLS |

---

## Domaine 7 — Sécurité / Allowlist / Capabilities

| Surface | Chemin | Status |
|---------|--------|--------|
| Tauri capabilities | src-tauri/capabilities/ | STABLE |
| ALLOWED_COMMANDS (whitelist) | src/lib/security.ts | STABLE |
| VOID_COMMANDS | src/lib/security.ts | STABLE |
| tauriProtector (injection check) | src/utils/tauriProtector.ts | STABLE |
| SecureSettings | src/pages/SecureSettings.tsx | STABLE |
| API keys (encrypted) | src-tauri/src/commands/ (secure_commands) | STABLE |
| GitGuardian config | .gitguardian.yml | ACTIVE |
| CodeQL | .github/workflows/codeql.yml | ACTIVE |

---

## Domaine 8 — CI / Gates / Proof Packs

| Surface | Chemin | Status |
|---------|--------|--------|
| CI Unified | .github/workflows/ci-unified.yml | ACTIVE |
| Stable build | .github/workflows/stable-build.yml | ACTIVE |
| CodeQL | .github/workflows/codeql.yml | ACTIVE |
| Architecture test | src/__tests__/architecture/ | ACTIVE |
| Proof packs | proof_packs/ | ACTIVE (this + UI_MAP) |
| Registry | registry/ | ACTIVE |
| Deployment manifest | deployment/latest/ | ACTIVE |
| 43 total workflows | .github/workflows/ | MIXED (some EXPERIMENTAL) |

---

## Domaine 9 — Docs / Registry

| Surface | Chemin | Status |
|---------|--------|--------|
| README.md | / | STABLE |
| Docs map | docs/ | STABLE |
| Mermaid diagrams | docs/ | ACTIVE |
| UI events registry | registry/ui-events.jsonl | ACTIVE |
| Proof packs | proof_packs/ | ACTIVE |
| Architecture docs | docs/MAP_*.md | STABLE |

---

## Hooks UI Majeurs

| Hook | Fichier | Domaine |
|------|---------|---------|
| useConversationEngine | src/hooks/ | Chat IA |
| useChat | src/hooks/useChat.ts | Chat |
| useChatMemory | src/hooks/useChatMemory.ts | Mémoire |
| useVoiceEngine | src/hooks/ | Voice |
| useWindowControls | src/hooks/useWindowControls.ts | Window |
| useZoomControl | src/hooks/useZoomControl.ts | Window |
| useAuraOrchestrator | src/hooks/useAuraOrchestrator.ts | Aura |
| useBackendHealth | src/hooks/useBackendHealth.ts | Health |
| useAdaptiveFPS | src/hooks/useAdaptiveFPS.ts | Perf |
| useToasts | src/stores/uiStore.selectors.ts | UI |
| useLivingEngines | src/hooks/ | Engines |
| useSystemMonitor | src/hooks/useSystemMonitor.ts | Monitoring |

**Total hooks:** 92 (src/hooks/)
