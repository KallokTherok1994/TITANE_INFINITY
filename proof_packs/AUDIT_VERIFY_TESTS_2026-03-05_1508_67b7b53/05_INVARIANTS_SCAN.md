# 05_INVARIANTS_SCAN — Scans des Invariants
**Proof Pack:** AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53  
**Timestamp:** 2026-03-05T15:08:56Z

---

## 5.1 UI = NO WEB DIRECT (CRITIQUE)

### Commande
```bash
grep -rn "(fetch\(|axios\.|new WebSocket|ws://|wss://|http://|https://)" \
  src/ --include="*.ts" --include="*.tsx" \
  | grep -v "node_modules|dist|__tests__|\.test\.|//.*fetch|mock|Mock"
```

### Résultats Classifiés

#### fetch() directs:
| Fichier | Ligne | Pattern | Classification |
|---------|-------|---------|----------------|
| `src/services/selfHealing/selfHealingObserver.ts` | 431 | `window.fetch = async (...args)` | ⚠️ RISK — monkey-patch `window.fetch` pour monitoring réseau. Intercepte TOUS les appels fetch (y compris tests). |
| `src/core/http/httpClient.ts` | 24 | `const hasBrowserFetch = typeof fetch === 'function'` | ✅ OK — détection d'environnement uniquement |
| `src/core/http/httpClient.ts` | 181-215 | `fetch()` dans `mockHttpResponse` | ✅ OK — UNIQUEMENT en mode `isVitest`. En prod: `throw new Error('[HTTP] Frontend HTTP disabled by governance.')` |

#### HTTP URLs dans le code (non-fetch):
| Fichier | Ligne | Pattern | Classification |
|---------|-------|---------|----------------|
| `src/services/ai/providers/glm46v.ts` | 30 | `baseUrl: 'http://127.0.0.1:8000/v1'` | ✅ OK — config constante locale, passée à `secureInvoke` |
| `src/config/offline-first.ts` | 37-38 | `gemini: 'https://...'`, `openai: 'https://...'` | ✅ OK — constantes de config, pas d'appel direct |
| `src/types/aiModel.ts` | 67, 81, 110 | endpoints URLs | ✅ OK — constantes de type |
| `src/components/sections/ConversationSection.tsx` | 248-257 | URLs Wikipedia dans array → `target_url` IPC | ✅ OK — passé à IPC, pas de fetch direct |
| `src/pages/ResearchPage.tsx` | 83-84 | URLs Wikipedia dans array → IPC | ✅ OK — passé à IPC |
| `src/modules/dataCollector/DataCollectorEngine.ts` | 553 | `https://ollama.ai` dans string echo | ✅ OK — chaîne inerte dans message |

### Verdict 5.1
- **Status: PASS conditionnel (RISK)**
- **Proof**: `grep -rn "window.fetch\s*=" src/services/selfHealing/selfHealingObserver.ts` → ligne 431
- **Impact**: En production Tauri, `httpClient.ts` bloque le réseau frontend. Mais le monkey-patch de `selfHealingObserver.ts` intercepte tous les appels fetch potentiels, y compris les tests.
- **Next minimal fix**: Remplacer le monkey-patch `window.fetch` par un listener Tauri event ou supprimer si les erreurs réseau sont déjà capturées via l'IPC. Fichier: `src/services/selfHealing/selfHealingObserver.ts:429-480`.

---

## 5.2 ONE DOOR NETWORK (CRITIQUE)

### Commande
```bash
grep -rn "(reqwest::|hyper::|ureq::|surf::|https?://|OpenAI|Anthropic|Gemini)" \
  src-tauri/src/ --include="*.rs" \
  | grep -v "//|target|test|.test."
```

### Résultats

#### Clients HTTP Rust:
| Fichier | Localisation | Pattern | Classification |
|---------|-------------|---------|----------------|
| `src-tauri/src/core/http_types.rs` | L2 | `pub use reqwest::{...}` | ✅ OK — export centralisé (ONE DOOR type-level) |
| `src-tauri/src/overdrive/chat_orchestrator.rs` | L12, 63-73 | `use crate::core::http_types::Client; build_http_client_with_timeout()` | ✅ OK — gateway R3, bounded timeouts (3s health, 45s max) |
| `src-tauri/src/engines/unified_memory/summarizer.rs` | 298, 315 | `use http_client; HttpClient::new()` | ❌ **VIOLATION** — Ring 2 crée client HTTP directement |
| `src-tauri/src/engines/unified_memory/embeddings.rs` | 213, 216 | `use http_client; HttpClient::new()` | ❌ **VIOLATION** — Ring 2 crée client HTTP directement |

### Architecture ONE DOOR (ce qui est prouvé):
```
Ring 3: overdrive/chat_orchestrator.rs → reqwest via core/http_types → Ollama/Gemini/OpenAI
Ring 2: engines/unified_memory/*.rs → http_client DIRECTEMENT ← VIOLATION
```

### Verdict 5.2
- **Status: FAIL**
- **Proof**: `grep -n "use http_client\|HttpClient::new" src-tauri/src/engines/unified_memory/summarizer.rs` → lignes 298, 315
- **Impact**: Ring 2 contourne le gateway réseau unique → surface réseau non gouvernée dans les engines de mémoire.
- **Next minimal fix**: Extraire les appels HTTP des engines Ring 2 vers un service Ring 3 dédié (`src-tauri/src/services/embedding_service.rs` par exemple). Le Ring 2 ne doit recevoir que des paramètres, pas créer de connexions.

---

## 5.3 TAURI-ONLY (CRITIQUE)

### Commande
```bash
grep -rn "(express\(|fastify\(|koa\(|http\.createServer|serve\(|listen\()" \
  src/ --include="*.ts" --include="*.tsx" \
  | grep -v "node_modules|//|__tests__|\.test\."
```

### Résultats
```
(aucune occurrence)
```

Vérification complémentaire via package.json:
```json
"start": "echo '🔒 TAURI-ONLY MODE: Use pnpm run dev instead' && exit 1"
"preview": "echo '🔒 TAURI-ONLY MODE' && exit 1"
```

### Verdict 5.3
- **Status: PASS**
- **Proof**: `grep -rn "express\|fastify\|createServer" src/` → 0 résultats. package.json "start" = exit 1.
- **Impact**: Aucun serveur web autonome. Mode Tauri-only enforced.
- **Next minimal fix**: N/A.

---

## 5.4 IPC CANONIQUE + TIMEOUTS

### Commande
```bash
grep -rn "(invoke\(|#\[tauri::command\])" \
  src/ src-tauri/src/ --include="*.ts" --include="*.tsx" --include="*.rs" \
  | grep -v "node_modules|target|//|__tests__|\.test\."
```

### Résultats Frontend (TS)

| Fichier | Pattern | Classification |
|---------|---------|----------------|
| `src/lib/tauriClient.ts` | `private async invoke<T>(command: TauriCommand, ...)` | ✅ OK — **Seul point canonical autorisé** |
| `src/utils/invoke.ts` | `safeInvoke`, `safeInvokeWithRetry(maxRetries=3)` | ⚠️ Via `secureInvoke` → security.ts. Retry **borné** (3 fois). |
| `src/os/bridge/TauriBridge.ts:32,162,172` | `this.invoke(...)` | ⚠️ SUSPICION — bridge interne, vérifie via constructeur |
| `src/os/bridge/StateBridge.ts:84,116,225` | `this.bridge.invoke(...)` | ⚠️ SUSPICION — délègue à TauriBridge |

### Résultats Backend (Rust) — Sample Commands

```bash
$ grep -rn "#\[tauri::command\]" src-tauri/src/ | wc -l
1283  ← (1283 commandes Tauri)
```

Échantillon structures de retour:
```rust
// core_system.rs
async fn get_system_status() -> Result<CoreSystemStatus, String>
async fn initialize_system() -> Result<InitializationReport, String>
// persistent_memory.rs
async fn memory_read() -> Result<MemoryReadResponse, String>
async fn memory_get_stats() -> Result<PersistentMemoryStats, String>
```

**Observation**: Les commandes Rust utilisent `Result<T, String>` (standard Tauri v2), pas `{ok, content, error}` explicitement. Le `tauriClient.ts` normalise côté TS via `TauriError`.

### Retry Bounds (utils/invoke.ts)
```typescript
maxRetries = 3,     // BORNÉ ✅
retryDelay = 1000   // 1s délai ✅
// Boucle: for (let attempt = 1; attempt <= maxRetries; attempt++)
```

### Verdict 5.4
- **Status: PASS conditionnel (SUSPICION)**
- **Proof**: `src/lib/tauriClient.ts` = canonical client défini. `utils/invoke.ts` retry borné (max 3). 1283 commands Rust avec `Result<T, String>`.
- **Impact**: Bridges OS contournent le canonical mais utilisent peut-être la même implémentation sous-jacente.
- **Next minimal fix**: Documenter TauriBridge/StateBridge comme "low-level bridges approuvés" ou les refactoriser pour utiliser `tauriClient` comme proxy.

---

## 5.5 ALLOWLIST/CAPABILITIES DENY-BY-DEFAULT

### Fichiers Capabilities
```bash
$ ls src-tauri/capabilities/
audio_tts.json  chat_ai.json  developer_mode.json  persistence.json  self_heal.json  singularity.json
```

### Analyse par Capability

| Capability | Identifier | Windows | Commandes allow | Remote URLs | Observation |
|-----------|-----------|---------|-----------------|-------------|-------------|
| `audio_tts.json` | audio-tts | main | TTS commands | localhost:8765 | ✅ Locale |
| `chat_ai.json` | chat-ai | main | 13 AI commands | googleapis.com, localhost:11434 | ✅ Whitelist explicite |
| `developer_mode.json` | developer-mode | main | Dev commands | Aucune | ✅ |
| `persistence.json` | persistence | main | 30+ titan_* commands | Aucune | ✅ |
| `self_heal.json` | self-heal | main | 25+ autonomy_* commands | Aucune | ✅ |
| `singularity.json` | singularity | main | singularity_* commands | Aucune | ✅ |

### Allowlist Stable
```bash
$ cat src-tauri/allowlist.whitelist.stable.json | wc -c
18896 bytes — liste stable complète présente
```

### Verdict 5.5
- **Status: PASS**
- **Proof**: 6 capabilities JSON avec permissions explicites, deny par défaut sur tout le reste. Remote URLs whitelistées dans `chat_ai.json`.
- **Impact**: Surface de sécurité maîtrisée. Allowlist stable de 18KB présente.
- **Next minimal fix**: N/A. Observer que `audio_tts.json` whiteliste `localhost:8765` — vérifier si ce service est bien interne uniquement.

---

## Résumé Invariants

| Invariant | Statut | Criticité | Preuve |
|-----------|--------|-----------|--------|
| 5.1 UI NO WEB | ⚠️ RISK | P1 | selfHealingObserver.ts:431 |
| 5.2 ONE DOOR | ❌ FAIL | P0 | summarizer.rs:315, embeddings.rs:216 |
| 5.3 TAURI-ONLY | ✅ PASS | — | 0 occurrences express/fastify |
| 5.4 IPC canonical | ⚠️ SUSPICION | P1 | TauriBridge/StateBridge invoke direct |
| 5.5 ALLOWLIST | ✅ PASS | — | 6 capabilities + allowlist stable |

**INVARIANT CRITIQUE VIOLÉ**: 5.2 ONE DOOR NETWORK (FAIL)  
→ **Stop-the-line marqué, audit continué**
