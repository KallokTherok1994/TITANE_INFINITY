# 09_DEEP_DOMAIN_AUDIT — Audit approfondi par domaine

**Session:** AUDIT360_20260304_173436 (continuation de AUDIT360_20260304_132822)
**Horodatage UTC:** 2026-03-04T17:34:36Z
**Version:** 27.2.0

---

## Domaine 1 — Architecture 4-Ring

### ✅ Conforme — Structure des rings

| Ring              | Chemin                   | I/O             | Imports entrants autorisés | Statut    |
| ----------------- | ------------------------ | --------------- | -------------------------- | --------- |
| Ring 1 — Types    | `src/types/`             | ✅ Aucun        | —                          | QUALIFIED |
| Ring 2 — Engines  | `src/engines/`           | ⚠️ 2 violations | Ring 1 seulement           | ⚠️ MINOR  |
| Ring 3 — Services | `src/services/`          | ✅ Gouverné     | Ring 1+2                   | QUALIFIED |
| Ring 4 — OS/UI    | `src/`, `src-tauri/src/` | ✅ IPC gouverné | Tous                       | QUALIFIED |

### ⛔ FINDING RV-001 — selfHealingEngine avec I/O direct (Ring 2)

**Localisation :** `src/engines/selfHealing/selfHealingEngine.ts`
**Preuve :**

```typescript
// Ligne 12
import { safeInvoke } from '@/utils/invoke';
// Ligne 251-253
const recentInvocations = await fetchRecentInvocations(); // → safeInvoke interne
const uiAnomalies = await fetchUiAnomalies(); // → safeInvoke interne
const metadata = await fetchSelfHealingMetadata(); // → safeInvoke interne
```

**Impact :** Violation constitutionnelle Ring 2 : un moteur pur ne peut pas avoir d'I/O.
**Criticité :** P1 — Dette architecturale documentée, pas d'impact runtime immédiat.
**Action :** Déplacer `selfHealingEngine.ts` vers Ring 3 (`src/services/selfHealing/`) OU extraire le sous-module I/O vers un service Ring 3 séparé.

### ⛔ FINDING RV-002 — cognitiveLayoutIntegrations avec tauriClient (Ring 2)

**Localisation :** `src/engines/cognitive/cognitiveLayoutIntegrations.ts`
**Preuve :**

```typescript
// Ligne 9
import { tauriClient } from '@/lib/tauriClient';
// Usage:
const heliosData = (await tauriClient.getHeliosState()) as {...};  // IPC call
const nexusData = (await tauriClient.engineGetNexusState()) as {...};  // IPC call
```

**Impact :** Ce module est un "intégrateur" d'I/O dans Ring 2. Le nom "Integrations" indique que c'est délibérément un connecteur.
**Criticité :** P1 — Dette architecturale, cas similaire à RV-001.
**Action :** Renommer/déplacer vers `src/services/cognitive/` (Ring 3) pour refléter le rôle de connecteur I/O.

---

## Domaine 2 — IPC / Contrat canonique

### ✅ Conforme — Discipline invoke

Le canal IPC canonique est respecté :

```
secureInvoke() → safeInvokeTauri() → @tauri-apps/api/core invoke()
```

**Vérification TauriBridge :**

```typescript
// src/os/bridge/TauriBridge.ts:48
const result = await secureInvoke<R>(command, args as Record<string, unknown>);
```

TauriBridge wraps correctement `secureInvoke` → ✅ CONFORME.

### ⚠️ FINDING IPC-CANON-001 — generate_response sans {ok, content, error}

**Localisation :** `src-tauri/src/commands/ai_chat.rs:249-256`
**Preuve :**

```rust
Ok(serde_json::json!({
    "content": balanced_response,
    "provider": format!("{:?}", response.provider),
    "tokens": response.tokens,
    "timestamp": response.timestamp,
}).to_string())
```

**Manque :** Le champ `ok` est absent. Le contrat IPC constitutionnel impose `{ ok, content, error }`.
**Impact :** Gouvernance uniquement — l'UI lit `response.content` directement. Aucun impact runtime, mais violation du contrat.
**Criticité :** P2 — Non bloquant runtime.

### ⚠️ FINDING IPC-004 (hérité) — SecureResponse.data vs content

**Impact :** 100+ callsites utilisent `.data` au lieu de `.content` dans les réponses SecureResponse.
**Statut :** DEFERRED depuis session précédente.

---

## Domaine 3 — Sécurité

### ✅ Conforme — Stack cryptographique

| Composant       | Version | Statut                       |
| --------------- | ------- | ---------------------------- |
| `argon2`        | `0.5`   | ✅ STABLE                    |
| `aes-gcm`       | `0.10`  | ✅ STABLE                    |
| `ed25519-dalek` | `2.1`   | ✅ STABLE                    |
| `zeroize`       | `1.7`   | ✅ STABLE                    |
| `lru`           | `0.16`  | ✅ RUSTSEC-2026-0002 CORRIGÉ |

### ⚠️ FINDING SEC-001 — CSP img-src avec https:

**Localisation :** `src-tauri/tauri.conf.json:66`
**Preuve :**

```json
"img-src 'self' asset: data: blob: https:"
```

**Impact :** Autorise le chargement d'images depuis n'importe quelle URL HTTPS externe. Risque potentiel de tracking via pixels distants ou de chargement de contenu externe non contrôlé.
**Criticité :** P2 — Faible (images uniquement, pas de scripts). Mais contraire au principe "deny-by-default".
**Recommandation :** Restreindre à `img-src 'self' asset: data: blob:` ou lister des domaines explicites si des images distantes sont nécessaires.

### ⚠️ FINDING SEC-002 — db_service.rs Mutex unwrap

**Localisation :** `src-tauri/src/services/db_service.rs` (9+ occurrences)
**Preuve :**

```rust
// Ligne 173, 190, 207, 223, etc.
let conn = self.conn.lock().unwrap();
```

**Impact :** Si le Mutex est "poisonné" (thread panique en tenant le lock), `.unwrap()` propagera la panique et crashera le backend Tauri.
**Criticité :** P2 — Peu probable en production normale, mais défense en profondeur recommande `.expect("msg")` ou gestion explicite.

### ✅ Conforme — CSP scripts

```
script-src 'self' 'unsafe-inline' asset: tauri:
```

L'`unsafe-inline` pour les scripts est un compromis accepté pour Tauri (pas de serveur HTTP pour les nonces). Pas d'`unsafe-eval`.

---

## Domaine 4 — Chat IA / Providers

### ✅ Stable — Flux principal

```
UI (ConversationSection) → useConversationEngine → secureInvoke('conversation_generate')
  → Rust ChatEngine → ProviderBridge → AIRouter
  → [UnifiedIA | Gemini(30s) | Ollama(60s)] → response(45s max)
  → ChatMemoryManager (3000 tokens rétention, 2048 tokens fenêtre)
  → TTS (local HybridTTS)
```

### ✅ Stable — Fallbacks

```
Ollama local → disponible sans clé API → fallback obligatoire respecté
titaneLocal.ts → offline generator → constitution respectée
```

### ✅ Conforme — Anti-silence

- `BackendDownIndicator` présent (`src/components/system/BackendDownIndicator.tsx`)
- Codes erreur IPC distincts : `IPC_TIMEOUT`, `IPC_FORBIDDEN`, `OLLAMA_IPC_ERROR`, `PROVIDER_DOWN`
- NO_LYING_FALLBACK : codes PROVIDER_DOWN ne masquent pas les erreurs IPC

### ⚠️ FINDING CHAT-01 — Textarea non désactivée pendant envoi

**Localisation :** `src/components/sections/ConversationSection.tsx`
**Impact :** Double-submit possible via Enter rapide (sendingRef.current guard présent mais textarea enabled).
**Criticité :** P2 — UX, non sécurité.

---

## Domaine 5 — Mémoire

### ✅ Stable — Architecture STM/MTM/LTM

- STM : état en mémoire (zustand store)
- MTM : cache LRU Rust `lru 0.16`
- LTM : SQLite via `rusqlite 0.37` (bundled) + tantivy indexation

### ✅ Conforme — setInterval cleanup

```typescript
// src/components/MemoryEvolution/MemoryEvolutionCenter.tsx:511
const interval = setInterval(() => { ... }, 30000);
return () => clearInterval(interval);  // ✅ cleanup présent
```

---

## Domaine 6 — Infrastructure de test

### Inventaire

| Type                    | Nombre | Localisation                        |
| ----------------------- | ------ | ----------------------------------- |
| Fichiers de test TS/TSX | 242    | `src/__tests__/`, `tests/`, `e2e/`  |
| Tests Rust              | 15+    | `src-tauri/tests/`                  |
| CI Workflows            | 43     | `.github/workflows/`                |
| Gates scripts           | ~30    | `scripts/gates/`, `scripts/verify/` |

### ✅ Infrastructure complète

- Vitest + couverture V8 configurés
- Playwright E2E avec wrapper Tauri
- Tests architecture (`test:architecture`)
- Tests compliance (`test:compliance`)
- Contrat IPC dédié (`tests/contract/tauri-ipc-contract.test.ts`)

### ⛔ BLOCKED — Exécution E2E en sandbox

`pnpm test:e2e` → nécessite runtime Tauri (GUI) → non disponible en sandbox.

---

## Résumé des findings

| ID            | Domaine             | Criticité | Statut   | Description                                     |
| ------------- | ------------------- | --------- | -------- | ----------------------------------------------- |
| RV-001        | Architecture Ring 2 | P1        | OPEN     | selfHealingEngine avec I/O (safeInvoke)         |
| RV-002        | Architecture Ring 2 | P1        | OPEN     | cognitiveLayoutIntegrations avec tauriClient    |
| IPC-004       | IPC contrat         | P1        | DEFERRED | SecureResponse.data vs content (100+ callsites) |
| IPC-CANON-001 | IPC contrat         | P2        | OPEN     | generate_response sans {ok} field               |
| SEC-001       | CSP                 | P2        | OPEN     | img-src autorise https: (images externes)       |
| SEC-002       | Rust sécurité       | P2        | OPEN     | db_service.rs Mutex unwrap                      |
| CHAT-01       | UX Chat             | P2        | OPEN     | Textarea non désactivée pendant envoi           |
| PERF-002      | Streaming           | P2        | DEFERRED | stream_response faux chunking                   |
| BLOCKED_E2E   | Infra               | INFRA     | BLOCKED  | Runtime Tauri non disponible en sandbox         |
