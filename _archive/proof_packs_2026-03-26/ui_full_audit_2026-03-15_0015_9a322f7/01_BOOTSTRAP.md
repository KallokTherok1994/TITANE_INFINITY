# BOOTSTRAP — Phase 0

**Date:** 2026-03-15  
**SHA:** 9a322f7a9  
**Branche:** MAIN (synchronized origin/MAIN)  
**Version package:** titane-infinity@28.0.0  

## Git status

Aucun fichier dirty au départ. HEAD = 9a322f7a9.

## Runtime cible

- Production runtime: Tauri v2 (AppImage + DEB packagés)
- Dev runtime: pnpm run dev:tauri (Vite + Tauri)
- IPC bridge: `secureInvoke` → `safeInvoke` → `tauriClient.invoke()`

## Routes principales (non-redirect)

| Route | Composant |
|---|---|
| /titane | TitanePage |
| /time | TimePage |
| /admin | AdminPage |
| /dev | DevPage |
| /fusion | PerfectFusionDashboard |
| /optimization | UltimateOptimizationDashboard |
| /orchestration-intelligence | OrchestrationIntelligenceCenter |
| /orchestration-center | OrchestrationMetaCenter |
| /reality-center | RealityCenter |
| /hyper-center | HyperCenter |
| /quantum-center | QuantumCenter |
| /identity-center | IdentityCenter |
| /twins | TwinsPage |
| /memory-evolution | MemoryEvolutionPage |
| /cloud | CloudCenter |
| /knowledge | KnowledgeFusionPage |
| /experience | Experience |
| /sentinel | Sentinel |
| /watchdog | Watchdog |
| /selfheal | SelfHeal |
| /adaptive | AdaptiveEngine |
| /memory | Memory |
| /research | ResearchPage |
| /performance | PerformanceTest |

## Redirections menu actives

- /stats → /dev ✅ (DEV_STATS_FUSION v29.1)
- /design-center → /admin ✅
- /governance-center → /admin ✅
- /audio-center → /admin ✅

## Stores globaux détectés

- `useLivingEngines` (App.tsx)
- `TitanStateProvider` (persistence)
- `useConversationEngine` (chat state)
- `useEvolutionStore` (XP)
- `xpEngine` (singleton)
- `useVisionStore` (vision — partiellement utilisé)
