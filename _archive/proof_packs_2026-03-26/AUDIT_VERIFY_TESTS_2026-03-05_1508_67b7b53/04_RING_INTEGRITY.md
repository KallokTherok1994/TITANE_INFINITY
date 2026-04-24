# 04_RING_INTEGRITY — Intégrité 4-Ring

**Proof Pack:** AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53  
**Timestamp:** 2026-03-05T15:08:56Z

---

## Méthodologie

Structure ring déduite de l'arborescence réelle (pas d'invention):

- R1: `src/types/`, `src/constants/`
- R2: `src/engines/` (TS), `src-tauri/src/engines/` (Rust)
- R3: `src/services/`, `src/lib/`, `src/core/`, `src/os/bridge/`, `src-tauri/src/overdrive/`, `src-tauri/src/services/`
- R4: `src/components/`, `src/pages/`, `src/features/`, `src/apps/`, `src-tauri/src/commands/`

Règles strictes:

- R1 → aucun import
- R2 → imports R1 uniquement, **zéro I/O**
- R3 → imports R1+R2, I/O orchestré
- R4 → peut importer tous rings

---

## 4.1 TypeScript — Imports Inversés

### R1 (types/) → R2/R3/R4 (interdit)

```bash
$ grep -rn "from.*engines\|import.*engines" src/types/ --include="*.ts"
(aucun résultat)

$ grep -rn "from.*services\|import.*services" src/types/ --include="*.ts"
(aucun résultat)

$ grep -rn "from.*components\|import.*components" src/types/ --include="*.ts"
(aucun résultat)
```

**Statut R1→Higher: ✅ OK** — Aucun import inversé dans types/

---

### R2 (engines/) → R3/R4 (interdit)

```bash
$ grep -rn "from.*services\|import.*services" src/engines/ --include="*.ts"
(aucun résultat)

$ grep -rn "from.*components\|import.*components" src/engines/ --include="*.ts"
(aucun résultat)
```

**Statut R2→Higher TS: ✅ OK** — Aucun import de services/components depuis engines/

---

### R3 (services/) — vérification imports R4 (interdit)

```bash
$ grep -rn "from.*components\|from.*pages\|from.*features" src/services/ --include="*.ts" 2>/dev/null | grep -v "//|test|mock" | head -n 5
(aucun résultat significatif)
```

**Statut R3→R4 TS: ✅ OK**

---

## 4.2 TypeScript — Violations IPC canonique

```bash
$ grep -rn "invoke(" src/ --include="*.ts" --include="*.tsx" \
  | grep -v "node_modules|dist|__tests__|\.test\.|//|tauriClient|utils/invoke|TAURI_COMMANDS|api/index|tauriChat|comment"
```

**Résultats:**

| Fichier                        | Ligne | Pattern                                   | Classification                                                            |
| ------------------------------ | ----- | ----------------------------------------- | ------------------------------------------------------------------------- |
| `src/os/bridge/TauriBridge.ts` | 32    | `await this.invoke('ping')`               | ⚠️ Suspicion — Bridge interne, utilise `@tauri-apps/api/core` directement |
| `src/os/bridge/TauriBridge.ts` | 162   | `this.invoke(cmd.name, cmd.args)`         | ⚠️ Suspicion — Batch invoke via bridge                                    |
| `src/os/bridge/TauriBridge.ts` | 172   | `await this.invoke('ping')`               | ⚠️ Suspicion — Health check                                               |
| `src/os/bridge/StateBridge.ts` | 84    | `this.bridge.invoke('set_state', ...)`    | ⚠️ Suspicion — State bridge                                               |
| `src/os/bridge/StateBridge.ts` | 116   | `this.bridge.invoke('delete_state', ...)` | ⚠️ Suspicion — State bridge                                               |
| `src/os/bridge/StateBridge.ts` | 225   | `this.bridge.invoke('set_state', ...)`    | ⚠️ Suspicion — State bridge                                               |

**Note**: `TauriBridge` et `StateBridge` sont des bridges OS de bas niveau dans `src/os/bridge/`. Ils n'importent pas `@tauri-apps/api/core` directement s'ils passent par `this.invoke` — à vérifier si `this` est une instance dérivée de tauriClient. Statut: **⚠️ SUSPICION** (pas de violation prouvée sans lecture complète du constructeur).

**Vérification partielle:**

```bash
$ head -30 src/os/bridge/TauriBridge.ts
# TauriBridge.invoke est défini dans la classe elle-même,
# qui importe de @tauri-apps/api/core directement
```

**Classification mise à jour:** ❌ **VIOLATION POTENTIELLE** — TauriBridge/StateBridge contournent le canonical `src/lib/tauriClient.ts`.

---

## 4.3 TypeScript — utils/invoke.ts (Wrapper Parallèle)

```bash
$ cat src/utils/invoke.ts | head -15
# Importe secureInvoke depuis @/lib/security
# Donc: utils/invoke → security → @tauri-apps/api
```

**Statut**: ⚠️ SUSPICION — `utils/invoke.ts` utilise `secureInvoke` (qui est un wrapper de sécurité), pas `invoke()` direct. Cependant, crée une surface parallèle non documentée comme exception officielle.

---

## 4.4 Rust — Ring 2 I/O (CRITIQUE)

```bash
$ grep -rn "use http_client\|HttpClient::new\|reqwest::Client" src-tauri/src/ \
  | grep -v "target|//|test"
```

**Résultats:**

| Fichier                                              | Ligne | Pattern                           | Classification                                       |
| ---------------------------------------------------- | ----- | --------------------------------- | ---------------------------------------------------- |
| `src-tauri/src/engines/unified_memory/summarizer.rs` | 298   | `use http_client;`                | ❌ **VIOLATION** — Ring 2 engine importe http_client |
| `src-tauri/src/engines/unified_memory/summarizer.rs` | 315   | `let client = HttpClient::new();` | ❌ **VIOLATION** — Ring 2 crée un client HTTP        |
| `src-tauri/src/engines/unified_memory/embeddings.rs` | 213   | `use http_client;`                | ❌ **VIOLATION** — Ring 2 engine importe http_client |
| `src-tauri/src/engines/unified_memory/embeddings.rs` | 216   | `let client = HttpClient::new();` | ❌ **VIOLATION** — Ring 2 crée un client HTTP        |

**Impact**: Ring 2 (engines = logique pure, zéro I/O) fait du réseau directement.
**Preuve**: `src-tauri/src/engines/unified_memory/{summarizer,embeddings}.rs` lignes 298, 315, 213, 216.

---

## 4.5 Rust — One Door (Gateway)

```bash
$ grep -rn "reqwest\b" src-tauri/src/ | grep -v "//|target|pub use|http_types|mod " | head -20
```

**Résultats**: Seul `src-tauri/src/core/http_types.rs` exporte reqwest publiquement.
`src-tauri/src/overdrive/chat_orchestrator.rs` utilise `crate::core::http_types::Client` avec `build_http_client_with_timeout()`.

**Observation**: Le gateway `overdrive/chat_orchestrator.rs` est la porte unique réseau pour Ring 3+4. Le problème est dans Ring 2 (engines) qui bypass ce gateway.

---

## Récapitulatif Ring Integrity

| Zone               | Statut       | Violations                                    |
| ------------------ | ------------ | --------------------------------------------- |
| R1 → Higher (TS)   | ✅ PASS      | Aucune                                        |
| R2 → Higher (TS)   | ✅ PASS      | Aucune                                        |
| R3 → R4 (TS)       | ✅ PASS      | Aucune                                        |
| IPC canonical (TS) | ⚠️ SUSPICION | TauriBridge/StateBridge (FIX-003)             |
| R2 I/O (Rust)      | ❌ **FAIL**  | summarizer.rs:298,315 + embeddings.rs:213,216 |
| R3 Réseau (Rust)   | ✅ PASS      | overdrive gateway avec timeouts               |

**G_RING_INTEGRITY: FAIL** (violation R2 I/O Rust prouvée)
