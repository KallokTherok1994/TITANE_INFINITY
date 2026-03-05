# 03_INVARIANTS_CHECK — Scan des Invariants
**Proof Pack:** AUDIT_MODULES_2026-03-05_1433_0f7d943  
**Timestamp:** 2026-03-05T14:33:25Z

---

## 3.1 Frontend NO WEB (fetch/axios/ws directs côté UI)

### Commande
```bash
grep -rn "(fetch\(|axios\.|new WebSocket|ws://|wss://)" src/ \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir="node_modules" --exclude-dir="dist"
```

### Résultats Classifiés

| Fichier | Ligne | Pattern | Classification |
|---------|-------|---------|----------------|
| `src/services/selfHealing/selfHealingObserver.ts` | 429 | `window.fetch = async (...)` | ⚠️ RISK — monkey-patch fetch pour monitoring. Pas un appel réseau direct, mais intercepte tous les appels. Non conforme au principe "no network in UI". |
| `src/services/selfHealing/selfHealingObserver.ts` | 445 | `await originalFetch(...args)` | ⚠️ RISK — retransmet vers le fetch original. Monitoring passthrough mais crée une surface. |
| `src/core/http/httpClient.ts` | 181-215 | `fetch()` via mockHttpResponse | ✅ OK — UNIQUEMENT en mode test (isVitest). En production, lève une exception : `[HTTP] Frontend HTTP disabled by governance.` |
| `src/config/offline-first.ts` | 77 | `httpClient.head(...)` | ✅ OK — passe par le client HTTP gouverné `src/core/http/httpClient.ts` qui bloque en non-Tauri |

### Verdict 3.1
- **PASS partiel** : Pas d'appel `fetch()` ou `axios` direct en runtime production UI.
- **RISK FIX-001** : `selfHealingObserver.ts` monkey-patche `window.fetch` — acceptable pour monitoring mais à documenter explicitement avec une gate.

---

## 3.2 Network ONE DOOR (porte réseau unique backend)

### Commande
```bash
grep -rn "(reqwest::|hyper::|ureq::|OpenAI|Anthropic|Gemini)" \
  src-tauri/src/ --include="*.rs"
```

### Résultats

| Fichier | Pattern | Classification |
|---------|---------|----------------|
| `src-tauri/src/core/http_types.rs` | `pub use reqwest::...` | ✅ OK — types exportés centralement |
| `src-tauri/src/overdrive/chat_orchestrator.rs` | `build_http_client_with_timeout()` | ✅ OK — bounded timeouts (3s health, configurable via secs) |
| `src-tauri/src/engines/unified_memory/summarizer.rs` | `use http_client; HttpClient::new()` | ⚠️ RISK — utilise `http_client` module (Ring 2 engine). Vérifier si passe par le gateway |
| `src-tauri/src/engines/unified_memory/embeddings.rs` | `use http_client; HttpClient::new()` | ⚠️ RISK — même que ci-dessus |

### Analyse ONE DOOR

**Constat**: Le backend utilise reqwest via `src-tauri/src/core/http_types.rs` comme point d'exportation central. `chat_orchestrator.rs` (Ring 3 overdrive) construit ses clients avec timeouts bornés. Cependant, les engines Ring 2 (`unified_memory/summarizer.rs`, `unified_memory/embeddings.rs`) semblent accéder directement au réseau — **violation potentielle de la règle 4-Ring** (Ring 2 = no I/O).

### Verdict 3.2
- **RISK FIX-002**: `src-tauri/src/engines/unified_memory/summarizer.rs` et `embeddings.rs` créent des clients HTTP dans Ring 2 — violation I/O-in-Ring2 potentielle.

---

## 3.3 Allowlist / Capabilities

### Commande
```bash
ls src-tauri/capabilities/
cat src-tauri/capabilities/chat_ai.json
```

### Fichiers Capabilities Trouvés
```
audio_tts.json
chat_ai.json
developer_mode.json
persistence.json
self_heal.json
singularity.json
```

### Extrait chat_ai.json (sample)
```json
{
  "identifier": "chat-ai",
  "windows": ["main"],
  "permissions": ["core:default"],
  "commands": {
    "allow": [
      "chat_generate", "chat_stream_message", "conversation_generate",
      "chat_get_providers_status", "chat_set_gemini_key", ...
    ]
  },
  "remote": {
    "urls": [
      "https://generativelanguage.googleapis.com/**",
      "http://localhost:11434/**",
      "http://127.0.0.1:11434/**"
    ]
  }
}
```

### Verdict 3.3
- **PASS**: Capabilities présentes, deny-by-default par fichier JSON, remote URLs whitelistées.
- **OBSERVATION**: Les remote URLs dans `chat_ai.json` permettent accès Gemini API et Ollama local — conforme à la doctrine online-first gouverné.

---

## 3.4 IPC Canonique

### Commande
```bash
grep -rn "invoke(" src/ --include="*.ts" --include="*.tsx" \
  | grep -v "node_modules|dist|test|tauriClient|//"
```

### Résultats

| Fichier | Pattern | Classification |
|---------|---------|----------------|
| `src/lib/tauriClient.ts` | `private async invoke<T>(...)` — SEUL fichier autorisé | ✅ OK — canonical client |
| `src/os/bridge/TauriBridge.ts` | `await this.invoke('ping')` (ligne 32, 172) | ⚠️ RISK — bridge direct invoke hors tauriClient |
| `src/os/bridge/StateBridge.ts` | `await this.bridge.invoke('set_state', ...)` (lignes 84, 116, 225) | ⚠️ RISK — invoke direct via bridge |
| `src/utils/invoke.ts` | wrapper invoke avec retry/timeout | ⚠️ RISK — wrapper parallèle à tauriClient? |

### Structure Réponse IPC (sample Rust)

```rust
// src-tauri/src/commands/core_system.rs
async fn get_system_status(...) -> Result<CoreSystemStatus, String>
async fn initialize_system(...) -> Result<InitializationReport, String>
```

**Observation**: Les commandes Rust retournent `Result<T, String>` (Tauri standard), pas `{ok, content, error}` explicite. La normalisation côté TS dans `tauriClient.ts` via `TAPIError` compense.

### Verdict 3.4
- **RISK FIX-003**: `TauriBridge.ts` et `StateBridge.ts` appellent `invoke()` directement — contournement du canonical client `tauriClient.ts`.
- **RISK FIX-004**: `src/utils/invoke.ts` crée un wrapper parallèle avec retry non documenté.

---

## 3.5 Tauri-Only (pas de serveurs web internes)

### Commande
```bash
grep -rn "(express\(|fastify\(|koa\(|http\.createServer|serve\(|listen\()" \
  src/ --include="*.ts" --include="*.tsx" \
  | grep -v "node_modules|dist|test|//"
```

### Résultats
```
(aucune occurrence trouvée)
```

Vérification supplémentaire `start` dans package.json:
```
"start": "echo '🔒 TAURI-ONLY MODE: Use pnpm run dev instead' && exit 1"
"preview": "echo '🔒 TAURI-ONLY MODE' && exit 1"
```

### Verdict 3.5
- **PASS**: Aucun serveur web autonome. Mode Tauri-only enforced dans package.json.

---

## 3.6 Architecture 4-Ring (imports inversés)

### Commandes
```bash
# Ring 1 → engines/services?
grep -rn "from.*engines|from.*services" src/types/ --include="*.ts"
# Ring 2 → services?
grep -rn "from.*services" src/engines/ --include="*.ts"
```

### Résultats
```
Ring 1 → engines/services: (aucune occurrence)
Ring 2 → services: (aucune occurrence)
```

### Verdict 3.6
- **PASS** (surface): Pas d'import inversé détecté dans types/ vers engines/services, ni dans engines/ vers services/.
- **NOTE**: Audit de surface uniquement (pas d'analyse d'import transitif).

---

## 3.7 Version Alignment (bonus)

| Fichier | Version Trouvée |
|---------|-----------------|
| `package.json` | 27.2.0 |
| `src-tauri/Cargo.toml` | 27.2.0 |
| `src-tauri/tauri.conf.json` | 27.2.0 |
| `deployment/latest/MANIFEST.json` | 27.2.0 |

**PASS**: Versions alignées.

---

## Résumé Invariants

| Invariant | Statut | Gate |
|-----------|--------|------|
| Frontend NO WEB | ⚠️ RISK (FIX-001) | Monitoring fetch monkey-patch |
| Network ONE DOOR | ⚠️ RISK (FIX-002) | Ring 2 engines avec HTTP |
| Allowlist/Capabilities | ✅ PASS | Présentes + whitelistées |
| IPC Canonique | ⚠️ RISK (FIX-003, FIX-004) | Bridges + utils invoke directs |
| Tauri-Only | ✅ PASS | Aucun serveur web |
| 4-Ring Architecture | ✅ PASS (surface) | Pas d'import inversé |
| Version Sync | ✅ PASS | 27.2.0 aligné |
