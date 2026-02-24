# G1 CLASSIFICATION — ONLINE-FINAL

## Gate G1 — Classification des références réseau/offline/remote

### Légende
- **DOC_ONLY** : documentation, commentaires
- **RUNTIME_BE** : code runtime backend (Rust)
- **RUNTIME_FE** : code runtime frontend (TypeScript/React)
- **TEST** : fichier de test
- **SCRIPT/CI** : scripts bash/CI
- **CONFIG** : configuration

---

## Violations P0 identifiées

| File | Line | Snippet | Classe | Risque | Action |
|------|------|---------|--------|--------|--------|
| `src-tauri/src/conversation_engine/commands.rs` | 101 | `"mode": "REMOTE"` avec `"network_used": false` | RUNTIME_BE | **P0** | **FIX: mode → "LOCAL"** |
| `src-tauri/src/conversation_engine/commands.rs` | 103 | `"network_used": false` (backend gate blocked) | RUNTIME_BE | **P0** | Couvert par fix ci-dessus |

## Issues P1

| File | Line | Snippet | Classe | Risque | Action |
|------|------|---------|--------|--------|--------|
| `src/services/conversationEngine.ts` | 291-307 | `mode: 'REMOTE'` + `network_used: false` | RUNTIME_FE | P1 | **ALREADY FIXED** (session précédente) |
| `src/hooks/useConversationEngine.ts` | 312-320 | Pas de guard REMOTE+!network_used | RUNTIME_FE | P1 | **ALREADY FIXED** (guard ajouté) |

## Items P2 (OK, pas de correction requise)

| File | Line | Snippet | Classe | Risque | Action |
|------|------|---------|--------|--------|--------|
| `src-tauri/src/ai/router.rs` | 67-71 | `check_internet()` — reqwest GET google.com (3s timeout) | RUNTIME_BE | P2 | OK: check réseau existant et fonctionnel |
| `src-tauri/src/ai/router.rs` | 250 | `if self.check_internet().await` avant Gemini | RUNTIME_BE | P2 | OK: correct (réseau vérifié avant appel) |
| `src-tauri/src/conversation_engine/meta_accumulator.rs` | 140-175 | `build_timeout_meta(network_available)` | RUNTIME_BE | P2 | OK: NO_LYING_FALLBACK conforme |
| `src/types/providerMeta.ts` | 3,31,43 | Mode/network_used types | RUNTIME_FE | P2 | OK: types corrects |
| `src/types/providerDecisionMeta.ts` | all | validateProviderDecisionMeta | RUNTIME_FE | P2 | OK: guards en place |
| `src/config/featureFlags.ts` | 35-41 | `ENABLE_EXTERNAL_AI` gate | CONFIG | P2 | OK: gouvernance build+runtime |
| `src/services/ai/providers/glm46v.ts` | 143 | `fetch(...baseUrl/models)` | RUNTIME_FE | P2 | OK: @network-allowed, localhost GLM-4 |
| `src/utils/performanceOptimizer.ts` | 767 | `fetch('/api/health')` | RUNTIME_FE | P2 | OK: /api/* local Tauri |
| `src/utils/ollamaFallback.ts` | 44 | `fetch(ollamaEndpoint)` | RUNTIME_FE | P2 | OK: localhost Ollama |
| `src/services/ai/transports/ollamaTransport.ts` | 88 | `fetch(url)` | RUNTIME_FE | P2 | OK: localhost Ollama |
| `src/services/tts/parlerTTSBridge.ts` | multiple | `fetch(url)` | RUNTIME_FE | P2 | OK: localhost TTS bridge |
| `src-tauri/src/ai/providers/openai.rs` | 59 | `post("https://api.openai.com/...")` | RUNTIME_BE | P2 | OK: controlled surface via reqwest |
| `src-tauri/src/ai/providers/claude.rs` | 59 | `post("https://api.anthropic.com/...")` | RUNTIME_BE | P2 | OK: controlled surface via reqwest |
| `src-tauri/src/ai/gemini.rs` | 10,75 | `googleapis.com` endpoint | RUNTIME_BE | P2 | OK: controlled surface |

## Gate G1: PASS
Classification complète. 1 violation P0 identifiée dans Rust backend (commands.rs:101). Action minimale définie.
