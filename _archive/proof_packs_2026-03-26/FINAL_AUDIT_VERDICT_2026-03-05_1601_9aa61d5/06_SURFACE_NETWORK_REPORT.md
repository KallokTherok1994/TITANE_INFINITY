# 06_SURFACE_NETWORK_REPORT — Rapport Surface Réseau
**Proof Pack:** FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5  
**Timestamp:** 2026-03-05T16:01:41Z

---

## 1. UI No-Web Direct (CRITIQUE)

### Commande
```bash
grep -rn "fetch(\|axios\.\|new WebSocket\|window\.fetch\s*=" \
  src/ --include="*.ts" --include="*.tsx" | grep -v "test|spec|mock"
```

### Résultats

| Fichier | Ligne | Pattern | Verdict |
|---------|-------|---------|---------|
| `src/services/selfHealing/selfHealingObserver.ts` | 431 | `window.fetch = async (...args) =>` | ⚠️ **RISK P1** — monkey-patch global |
| `src/core/http/httpClient.ts` | ~24 | `typeof fetch`, `fetch()` | ✅ OK — bloqué en prod (`throw` si !tauri) |

**Status: RISK P1** (pas de violation P0 directe côté UI mais monkey-patch risqué)

### Détail selfHealingObserver.ts:431

```typescript
// selfHealingObserver.ts:431
window.fetch = async (...args: Parameters<typeof fetch>) => {
  // intercept réseau — non gouverné
```

**Impact:** Toutes les requêtes fetch de l'application passent par cet intercepteur, y compris d'éventuels appels de bibliothèques. Surface non bornée.
**Fix minimal:** Retirer le monkey-patch ou le remplacer par un listener `Tauri event('network_error')` borné.

---

## 2. ONE DOOR Network (CRITIQUE)

### Commande
```bash
grep -rn "use reqwest|HttpClient::new" \
  src-tauri/src/ --include="*.rs" | grep -v target
```

### Résultats Backend (Rust)

| Fichier | Ligne | Pattern | Verdict |
|---------|-------|---------|---------|
| `src-tauri/src/core/http_types.rs` | 2 | `pub use reqwest::{...}` | ✅ OK — export centralisé (gateway) |
| `src-tauri/src/overdrive/chat_orchestrator.rs` | 12 | `use crate::core::http_types::Client` avec timeout | ✅ OK — ONE DOOR |
| `src-tauri/src/overdrive/api_bridge.rs` | 226 | `// let client = HttpClient::new();` | ✅ OK — commenté/inactif |
| `engines/unified_memory/summarizer.rs` | 298, 315 | `use http_client; let client = HttpClient::new()` | ❌ **FAIL P0** — Ring 2 bypass |
| `engines/unified_memory/embeddings.rs` | 213, 216 | `use http_client; let client = HttpClient::new()` | ❌ **FAIL P0** — Ring 2 bypass |

**Status: FAIL P0 — STOP-THE-LINE**

### Références Externes (QUALIFIED)

| Fichier | Référence | Verdict |
|---------|-----------|---------|
| `src-tauri/src/gemini_provider_extensions.rs` | `Gemini API call` — via gateway | ✅ OK |
| `src-tauri/src/multi_agents/permissions.rs` | `OpenAIOnly`, `GeminiOnly` — permissions enum | ✅ OK (pas d'appel réseau direct) |
| `src-tauri/src/selfheal/monitor.rs` | Références "Gemini", "Ollama" — monitoring only | ✅ OK |

---

## 3. Gateway Cible (ONE DOOR prouvé)

```
UI → IPC (tauriClient.ts) → src-tauri commands → overdrive/chat_orchestrator.rs → réseau
```

`chat_orchestrator.rs` utilise `http_types::Client` avec:
- `timeout = Duration::from_secs(30)` (borné)
- `redirect::Policy::limited(3)` (borné)
- Erreurs catégorisées

**DOOR UNIQUE VÉRIFIÉ** pour le flux principal.
**VIOLATION** pour `engines/unified_memory/` qui créent leur propre client HTTP.

---

## Résumé Surface Réseau

| Surface | Status | Criticité |
|---------|--------|-----------|
| UI no-web direct | ⚠️ RISK (monkey-patch) | P1 |
| ONE DOOR backend | ❌ FAIL (Ring 2 HTTP) | P0 |
| Gateway overdrive | ✅ PASS | — |
| Providers (Gemini/OpenAI/Ollama) | ✅ PASS (via gateway) | — |
| httpClient.ts (prod) | ✅ PASS | — |
