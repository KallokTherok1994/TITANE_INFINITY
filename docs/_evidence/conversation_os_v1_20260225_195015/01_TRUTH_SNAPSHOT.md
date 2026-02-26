# 01_TRUTH_SNAPSHOT.md

## Source de vérité
- Logs discovery: `09_PROOF_LOGS.txt`
- HEAD observé: `e8e233d6`
- Workspace: propre au moment du snapshot (`git status` clean)

## Entry points Conversation OS observés
- Orchestrateur principal: `src-tauri/src/conversation_engine/commands.rs` (`conversation_generate`)
- Pipeline Ring 2 utilisé dans l’orchestrateur:
  - `RouterEngine`
  - `PolicyEngine`
  - `ResilienceEngine`
  - `MemoryEngine`
  - `SearchEngine`
- Persistance: `persist_conversation_os_artifacts*` + `DbService`
- UI debug: `src/components/debug/TracePanel.tsx` intégré via `ChatDebugPanel.tsx`

## Surfaces réseau observées
- Surface backend gouvernée: `src-tauri/src/services/network_gateway.rs` (allowlist + budgets + timeout)
- Surface recherche: `src-tauri/src/services/search_gateway.rs`
- Existence de surfaces frontend legacy contenant `fetch/WebSocket` détectées par scan global (`src/**`)

## État des preuves/gates existants
- Campagnes x3 unitaires déjà disponibles sous `reports/` (G2..G10)
- Campagne homogène G1..G10 x3 présente: `reports/conversation_os_unified_g1_g10_x3_campaign_v2.log`

## Legacy / chemins alternatifs
- Présence de chemins legacy (`overdrive`, visual-engine WebSocket, providers frontend legacy).
- Ces surfaces existent dans le repo; toutes ne sont pas garanties hors-atteinte sans restriction de flux explicite.

## Unknown (non prouvé)
- Exhaustivité de l’inaccessibilité runtime des surfaces frontend legacy hors flux Conversation OS v1.
- Couverture E2E desktop complète hors suite `e2e/critical`.
