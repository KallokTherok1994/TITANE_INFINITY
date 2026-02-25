# G2 NETWORK SURFACE — ONLINE-FINAL

## Backend Network Calls (Rust — reqwest)

| File | Endpoint | Condition | Timeout | Status |
|------|----------|-----------|---------|--------|
| `src-tauri/src/ai/router.rs:70` | `https://www.google.com` | Connectivity check (cache 30s) | 3s | OK — controlled surface |
| `src-tauri/src/ai/gemini.rs:75` | `https://www.google.com` | `is_available()` | implicit | OK — availability probe |
| `src-tauri/src/ai/gemini.rs:10` | `https://generativelanguage.googleapis.com/v1/...` | External AI enabled | ~20s | OK — conditional on VITE_ENABLE_EXTERNAL_AI |
| `src-tauri/src/ai/providers/openai.rs:59` | `https://api.openai.com/v1/chat/completions` | OpenAI provider selected | implicit | OK — gated |
| `src-tauri/src/ai/providers/claude.rs:59` | `https://api.anthropic.com/v1/messages` | Claude provider selected | implicit | OK — gated |
| `src-tauri/src/ai/ollama.rs` | `http://127.0.0.1:11434` | Ollama local | ~5s | OK — localhost only |
| `src-tauri/src/overdrive/chat_orchestrator.rs:676` | `https://generativelanguage.googleapis.com/...` | Gemini alternate path | 20s | OK — gated |
| `src-tauri/src/overdrive/chat_orchestrator.rs:935` | `https://api.openai.com/v1/...` | OpenAI alternate path | 20s | OK — gated |

## Frontend Network Calls (TypeScript)

| File | Target | Type | Status |
|------|--------|------|--------|
| `src/services/ai/transports/ollamaTransport.ts:88` | `localhost:11434` | `fetch()` | OK — localhost only |
| `src/utils/ollamaFallback.ts:44` | `localhost:11434` | `fetch()` | OK — localhost only |
| `src/services/tts/parlerTTSBridge.ts` | `localhost:*` | `fetch()` | OK — localhost only |
| `src/services/ai/providers/glm46v.ts:143` | `baseUrl/models` | `fetch()` @network-allowed | OK — local GLM-4.6V endpoint |
| `src/utils/aiPredictiveEngine.ts:531` | `/vite.svg` | `fetch()` HEAD @network-allowed | OK — local probe only |
| `src/utils/performanceOptimizer.ts:767` | `/api/*` | `fetch()` @network-allowed | OK — local Tauri API |
| `src/components/diagnostics/SplashWatchdog.tsx:261` | local module | `fetch()` HEAD @network-allowed | OK — local module probe |
| `src/core/http/httpClient.ts` | via tauri-plugin-http | Controlled surface | OK — tauri-plugin-http |

## Doctrine Réseau Vérifiée

✅ **Frontend** : Tous les appels réseau directs sont soit localhost, soit des wrapper IPC Tauri.
✅ **Backend** : Tous les appels cloud passent par reqwest (Rust) via Tauri backend — surface contrôlée.
✅ **Check internet** : `AIRouter::check_internet()` utilise reqwest GET google.com (3s timeout) — existe et fonctionnel.
✅ **Gating** : `VITE_ENABLE_EXTERNAL_AI` requis pour activer les providers cloud.

## Gate G2: PASS
Surface réseau contrôlée. Aucun appel externe non gouverné identifié.
