# CORE / LABS / OPS / ARCHIVE CLASSIFICATION

## CORE (materially supports the real chat-first product)

- src/services/conversationEngine.ts — Pipeline chat canonique
- src/services/ai/orchestrator.ts — Orchestrateur AI (version now aligned)
- src/services/ai/omegaModeClassifier.ts — Classification OMEGA
- src/services/ai/providers/ — 9 providers (claude, gemini, ollama, openai, fallback, titaneLocal, tauriChat, glm46v, copilot)
- src-tauri/src/conversation_engine/ — 20 Rust modules (types, commands, pipeline, memory, emotion, intent, etc.)
- src/pages/TitanePage.tsx — Coeur du produit (chat IA)
- src-tauri/src/main.rs — Entry point Tauri
- memory/ — LTM, MTM, STM, cognitive, singularity, harmonics
- config/championChallenger.json — Framework evaluation
- src/services/ai/responsePolicy.ts — RESPONSE_PROFILES
- src/services/ai/autoHealEngine.ts — Auto-heal
- src/services/ai/metricsEngine.ts — Metriques
- src/services/ai/circuitBreaker.ts — Circuit breaker
- src/services/ai/rateLimiter.ts — Rate limiting

## LABS (non certifie, a demarquer)

- RealityCenter — OPUS #19, non certifie
- HyperCenter — OPUS #20, non certifie
- QuantumCenter — OPUS #17, non certifie
- IdentityCenter — OPUS #15, non certifie
- MemoryEvolutionCenter — OPUS #14, non certifie
- CloudCenter — Cloud sync, statut inconnu
- OrchestrationIntelligenceCenter — Fusion 6 modules, non certifie
- PerfectFusionDashboard — Dashboard, statut inconnu
- UltimateOptimizationDashboard — GPU/WASM, non certifie
- titane_local_training/ — Training local experimental
- src/services/voice/ — Voice fingerprinting, statut inconnu
- src/modules/avatar/ — Avatar, statut inconnu
- src/components/aura/ — Quantum particles, aurora effects
- KnowledgeFusionPage — Knowledge fusion
- CreationStudio — Creation studio
- EvolutionMonitor — Evolution monitor
- Sentinel, Watchdog, SelfHeal, AdaptiveEngine — Engine pages

## OPS

- proof_packs/ — Preuves
- registry/ — Registry
- reports/ — Rapports
- scripts/ — Scripts validateurs
- .github/workflows/ — 33 CI workflows
- deployment/ — Deploiement
- RELEASE_*.txt — Seals de release
- PROD_*.md — Gate reports, deployment checklists, rollback plans

## ARCHIVE

- _archive/ — Archive explicite
- legacy/ — Legacy explicite
- dashboard/ — Dashboard index.html (stub?)

## SHELL OVERWEIGHT DIAGNOSTIC

src/App.tsx contains 30+ lazy-loaded "Centers" and 60+ routes (including ~40 redirections).
Many are Labs modules presented at the same level as Core product.
This dilutes product identity and confirms SHELL_OVERWEIGHT_CONFIRMED.