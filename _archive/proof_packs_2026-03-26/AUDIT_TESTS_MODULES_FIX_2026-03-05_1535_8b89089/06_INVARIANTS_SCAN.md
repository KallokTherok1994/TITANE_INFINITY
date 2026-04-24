# 06_INVARIANTS_SCAN — Scans Invariants

**Proof Pack:** AUDIT_TESTS_MODULES_FIX_2026-03-05_1535_8b89089  
**Timestamp:** 2026-03-05T15:35:28Z  
_(Consolidated depuis AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53/05_INVARIANTS_SCAN.md + nouvelles preuves)_

---

## 6.1 UI no-web direct (CRITIQUE)

### Commande

```bash
grep -rn "(fetch\(|axios\.|new WebSocket|window.fetch)" \
  src/ --include="*.ts" --include="*.tsx"
```

### Résultats

| Fichier                                            | Ligne    | Pattern                                | Verdict                       |
| -------------------------------------------------- | -------- | -------------------------------------- | ----------------------------- |
| `src/services/selfHealing/selfHealingObserver.ts`  | 431      | `window.fetch = async (...args)`       | ⚠️ RISK — monkey-patch global |
| `src/core/http/httpClient.ts`                      | 24, ~200 | `typeof fetch`, `fetch()` en test-only | ✅ OK — bloqué en prod        |
| `src/modules/dataCollector/DataCollectorEngine.ts` | 553      | URL dans string echo                   | ✅ OK — inerte                |

**Status: PASS conditionnel (RISK P1)**
**Proof:** `src/services/selfHealing/selfHealingObserver.ts:431`
**Impact:** Surface non gouvernée — intercepte tous les fetch potentiels
**Next minimal fix (R2):** Remplacer monkey-patch par listener Tauri event ou retirer si redondant avec `httpClient.ts` governance

---

## 6.2 One-door network (CRITIQUE)

### Commande

```bash
grep -rn "reqwest::\|HttpClient::new\|use http_client" \
  src-tauri/src/ --include="*.rs" | grep -v "//|target|test"
```

### Résultats

| Fichier                                              | Ligne     | Pattern                                    | Verdict                   |
| ---------------------------------------------------- | --------- | ------------------------------------------ | ------------------------- |
| `src-tauri/src/core/http_types.rs`                   | 2         | `pub use reqwest::{...}`                   | ✅ OK — export centralisé |
| `src-tauri/src/overdrive/chat_orchestrator.rs`       | 12, 63-73 | `Client = http_types::Client` avec timeout | ✅ OK — ONE DOOR gateway  |
| `src-tauri/src/engines/unified_memory/summarizer.rs` | 298, 315  | `use http_client; HttpClient::new()`       | ❌ **FAIL** — Ring 2 I/O  |
| `src-tauri/src/engines/unified_memory/embeddings.rs` | 213, 216  | `use http_client; HttpClient::new()`       | ❌ **FAIL** — Ring 2 I/O  |

**Status: FAIL ← STOP-THE-LINE**
**Proof:** `src-tauri/src/engines/unified_memory/summarizer.rs:315`
**Impact:** Ring 2 bypass gateway réseau, surface non gouvernée
**Next minimal fix (R1):** Extraire HTTP vers service Ring 3 dédié

---

## 6.3 IPC canonique + timeouts (CRITIQUE)

### Commande

```bash
grep -rn "invoke(" src/ --include="*.ts" --include="*.tsx" \
  | grep -v "node_modules|dist|tauriClient|utils/invoke|TAURI_COMMANDS|api/index|//|test"
```

### Résultats

| Fichier                        | Lignes                       | Verdict                          |
| ------------------------------ | ---------------------------- | -------------------------------- |
| `src/lib/tauriClient.ts`       | canonical `private invoke()` | ✅ OK                            |
| `src/os/bridge/TauriBridge.ts` | 32, 162, 172                 | ⚠️ SUSPICION — bridge low-level  |
| `src/os/bridge/StateBridge.ts` | 84, 116, 225                 | ⚠️ SUSPICION — délègue à bridge  |
| `src/utils/invoke.ts`          | via `secureInvoke`           | ⚠️ wrapper parallèle (borné à 3) |

**Status: PASS conditionnel (SUSPICION P1)**
**Proof:** `src/os/bridge/TauriBridge.ts:32,162,172`
**Impact:** Contrat `{ok, content, error}` non garanti sur bridges
**Next minimal fix (R3):** Documenter bridges comme exception formelle ou refactorer

---

## 6.4 Tauri-only (CRITIQUE)

### Commande

```bash
grep -rn "express(\|fastify(\|createServer\|listen(" src/ --include="*.ts"
```

### Résultats

```
(aucune occurrence)
```

Package.json: `"start": "exit 1"`, `"preview": "exit 1"`

**Status: PASS ✅**
**Proof:** 0 résultats + package.json enforced
**Impact:** Aucun — Tauri-only respecté

---

## 6.5 Allowlist/Capabilities

### Commande

```bash
ls src-tauri/capabilities/ && wc -c src-tauri/allowlist.whitelist.stable.json
```

### Résultats

```
audio_tts.json  chat_ai.json  developer_mode.json  persistence.json  self_heal.json  singularity.json
18896 bytes (allowlist.whitelist.stable.json)
```

Capabilities incluent `remote.urls` whitelistées (Gemini, Ollama local).

**Status: PASS ✅**
**Proof:** 6 capabilities JSON + allowlist 18KB
**Impact:** Deny-by-default correct

---

## Résumé Invariants

| Invariant         | Statut       | Criticité |
| ----------------- | ------------ | --------- |
| 6.1 UI no-web     | ⚠️ RISK      | P1        |
| 6.2 ONE DOOR      | ❌ FAIL      | **P0**    |
| 6.3 IPC canonical | ⚠️ SUSPICION | P1        |
| 6.4 Tauri-only    | ✅ PASS      | —         |
| 6.5 Allowlist     | ✅ PASS      | —         |
