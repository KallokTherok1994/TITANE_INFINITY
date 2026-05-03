# 09_INVARIANTS_SCAN_REPORT — Rapport Scans Invariants
**Proof Pack:** FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5  
**Timestamp:** 2026-03-05T16:01:41Z

---

## Tableau Global

| # | Invariant | Status | Criticité | Preuve | Gate |
|---|-----------|--------|-----------|--------|------|
| 1 | Tauri-only (pas de serveur web autonome) | ✅ **PASS** | P0 | `package.json` exit 1, 0 express/fastify | G_TAURI_ONLY |
| 2 | UI no-web direct (zéro fetch/axios/ws direct) | ⚠️ **RISK** | P1 | `selfHealingObserver.ts:431` monkey-patch | G_UI_NO_WEB |
| 3 | Network one-door (1 gateway backend) | ❌ **FAIL** | P0 | `summarizer.rs:315`, `embeddings.rs:216` HTTP Ring2 | G_ONE_DOOR |
| 4 | Allowlist deny-by-default justifiée | ✅ **PASS** | P0 | 6 capabilities + 18KB allowlist | G_ALLOWLIST |
| 5 | IPC canonique {ok,content,error} | ⚠️ **APPROX** | P1 | `CommandResult{success,data,error}` ≈ mais pas identique | G_IPC_CANON |
| 6 | Timeouts bornés | ⚠️ **PARTIEL** | P1 | overdrive gateway ✅ (30s), 1261 commands NON PROUVÉ | G_TIMEOUTS |
| 7 | Erreurs catégorisées | ⚠️ **PARTIEL** | P1 | TauriError {code,message} TS ✅, Rust Result<T,String> partiel | G_ERRORS |
| 8 | Fallback local obligatoire (Ollama) | ✅ **PASS** | P0 | ollamaTransport.ts + localhost:11434 capability | G_FALLBACK |
| 9 | No unbounded retries | ✅ **PASS** | P1 | redirect::Policy::limited(3), secureInvoke cap x3 | G_NO_UNBOUNDED |
| 10 | No refactor gratuit | ✅ **PASS** | P1 | Audit-only this session | G_NO_REFACTOR |
| 11 | Ring 2 zéro I/O | ❌ **FAIL** | P0 | `summarizer.rs:298,315`, `embeddings.rs:213,216` | G_RING_INTEGRITY |
| 12 | Version sync (4 manifests) | ✅ **PASS** | P1 | 27.2.0 aligné × 4 | G_VERSION_SYNC |

---

## Détails Critiques

### INV-3 — Network one-door: FAIL P0

**Preuve:**
```rust
// src-tauri/src/engines/unified_memory/summarizer.rs
:298    use http_client;
:315    let client = HttpClient::new();

// src-tauri/src/engines/unified_memory/embeddings.rs  
:213    use http_client;
:216    let client = HttpClient::new();
```

**Impact:** Ring 2 (moteurs) peut initier des requêtes HTTP indépendamment de la gateway `overdrive/chat_orchestrator.rs`. Bypass de la gouvernance réseau.

**Fix minimal (FIX-001):** Extraire les appels HTTP vers un service Ring 3 `embedding_http_service.rs` + injection de dépendance.

---

### INV-2 — UI no-web: RISK P1

**Preuve:**
```typescript
// src/services/selfHealing/selfHealingObserver.ts:431
window.fetch = async (...args: Parameters<typeof fetch>) => {
```

**Impact:** Monkey-patch global de `window.fetch` — intercepte toutes les requêtes fetch du runtime, surface non bornée.

**Fix minimal (FIX-003):** Retirer ou remplacer par un listener Tauri event borné.

---

### INV-5 — IPC canonique: APPROX P1

**Preuve Rust:**
```rust
// CommandResult {success, data, error} ≠ exactement {ok, content, error}
pub struct CommandResult<T> {
    pub success: bool,      // vs "ok"
    pub data: Option<T>,    // vs "content"
    pub error: Option<String>,
}
```

**Impact:** Légère divergence du contrat IPC. Les clients TS (`tauriClient.ts`) utilisent l'API Tauri standard qui sérialise correctement. Risque faible mais discordance documentaire.

---

## Distribution

| Status | Count | % |
|--------|-------|---|
| ✅ PASS | 6 | 50% |
| ❌ FAIL | 2 | 17% |
| ⚠️ RISK/APPROX/PARTIEL | 4 | 33% |
