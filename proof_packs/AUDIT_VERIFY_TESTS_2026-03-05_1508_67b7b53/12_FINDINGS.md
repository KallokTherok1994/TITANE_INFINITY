# 12_FINDINGS — Constats et Violations
**Proof Pack:** AUDIT_VERIFY_TESTS_2026-03-05_1508_67b7b53  
**Timestamp:** 2026-03-05T15:08:56Z

---

## Top 10 Constats (preuves incluses)

### Constat 1 — VIOLATION P0: Ring 2 Rust fait du réseau (I/O in R2)
**Preuve**:
```
src-tauri/src/engines/unified_memory/summarizer.rs:298  → use http_client;
src-tauri/src/engines/unified_memory/summarizer.rs:315  → let client = HttpClient::new();
src-tauri/src/engines/unified_memory/embeddings.rs:213  → use http_client;
src-tauri/src/engines/unified_memory/embeddings.rs:216  → let client = HttpClient::new();
```
**Impact**: Ring 2 (engines, logique pure) crée des connexions réseau directement → bypasse le gateway `overdrive/chat_orchestrator.rs` → violation invariant 4-Ring fondamental.
**Criticité**: P0 — FAIL

---

### Constat 2 — RISK P1: Monkey-patch window.fetch (selfHealingObserver)
**Preuve**:
```
src/services/selfHealing/selfHealingObserver.ts:431  → window.fetch = async (...args)
```
**Impact**: Intercepte TOUS les appels `fetch()` de la page, y compris ceux des tests. En runtime Tauri, le `httpClient.ts` bloque déjà le réseau frontend — ce monkey-patch est redondant et crée une surface non documentée.
**Criticité**: P1 — RISK

---

### Constat 3 — RISK P1: invoke() hors canonical (TauriBridge/StateBridge)
**Preuve**:
```
src/os/bridge/TauriBridge.ts:32    → await this.invoke('ping')
src/os/bridge/TauriBridge.ts:162   → this.invoke(cmd.name, cmd.args)
src/os/bridge/StateBridge.ts:84    → this.bridge.invoke('set_state', ...)
src/os/bridge/StateBridge.ts:116   → this.bridge.invoke('delete_state', ...)
src/os/bridge/StateBridge.ts:225   → this.bridge.invoke('set_state', ...)
```
**Impact**: Les bridges OS contournent `src/lib/tauriClient.ts` (canonical). Le contrat IPC `{ok, content, error}` peut ne pas être appliqué.
**Criticité**: P1 — SUSPICION (bridges low-level, impact limité)

---

### Constat 4 — BLOCKED: Environnement d'exécution manquant
**Preuve**:
```
$ pnpm -v → command not found
$ node_modules/.bin/vitest → No such file or directory
$ cargo check → glib-2.0 not found
```
**Impact**: 100% des tests/builds/lint BLOCKED. Impossible de valider les gates numériques.
**Criticité**: P1 — BLOCKED (infra, pas un bug code)

---

### Constat 5 — OK: Version sync parfaite (27.2.0)
**Preuve**:
```
package.json: "version": "27.2.0"
src-tauri/Cargo.toml: version = "27.2.0"
src-tauri/tauri.conf.json: "version": "27.2.0"
deployment/latest/MANIFEST.json: "version": "27.2.0"
```
**Impact**: Aucun. Alignement parfait des versions.
**Criticité**: PASS

---

### Constat 6 — OK: httpClient.ts bloque le réseau frontend en production
**Preuve**:
```
src/core/http/httpClient.ts:~200  →
  if (!shouldUseMockFetch) {
    throw new Error('[HTTP] Frontend HTTP disabled by governance. Use backend IPC network gateway.');
  }
```
**Impact**: Aucun appel réseau direct possible côté UI en production Tauri.
**Criticité**: PASS (governance enforced)

---

### Constat 7 — RISK P2: 13-14 workflows CI décoratifs
**Preuve**:
```bash
$ ls .github/workflows/ | grep -E "cosmic|multiversal|infinite|transcendence|omniscient|reality|quantum|consciousness|universal|source-reality"
→ 13 fichiers avec noms cosmiques, tous workflow_dispatch only
```
**Impact**: Pas de risque sécurité direct, mais augmente la surface de maintenance et le coût GitHub Actions si déclenchés.
**Criticité**: P2 — INFO

---

### Constat 8 — OK: Allowlist et Capabilities bien définies
**Preuve**:
```bash
$ ls src-tauri/capabilities/
audio_tts.json  chat_ai.json  developer_mode.json  persistence.json  self_heal.json  singularity.json
```
**Impact**: 6 capabilities avec permissions explicites, remote URLs whitelistées, deny par défaut.
**Criticité**: PASS

---

### Constat 9 — RISK P2: reqwest 0.11 (ancienne version)
**Preuve**:
```
src-tauri/Cargo.toml: reqwest = { version = "0.11", features = ["json", "stream"] }
# reqwest 0.12 disponible depuis 2024
```
**Impact**: reqwest 0.11 peut avoir des CVE non patchés. `cargo audit` non exécutable (GTK absent).
**Criticité**: P2 — RISK (non prouvé sans cargo audit)

---

### Constat 10 — STALE: SHA256SUMS ancienne version
**Preuve**:
```
src-tauri/SHA256SUMS_v19.5.2  ← version 19.5.2 (repo est à 27.2.0)
```
**Impact**: Checksums stales dans `src-tauri/`. Les checksums à jour sont dans `deployment/latest/` (LFS, 240MB).
**Criticité**: P2 — STALE

---

## Violations Critiques (classement)

| ID | Sévérité | Type | Fichier | Ligne |
|----|----------|------|---------|-------|
| CRIT-01 | P0 | Ring 2 I/O | `src-tauri/src/engines/unified_memory/summarizer.rs` | 298, 315 |
| CRIT-01b | P0 | Ring 2 I/O | `src-tauri/src/engines/unified_memory/embeddings.rs` | 213, 216 |
| RISK-01 | P1 | fetch monkey-patch | `src/services/selfHealing/selfHealingObserver.ts` | 431 |
| RISK-02 | P1 | invoke direct | `src/os/bridge/TauriBridge.ts` | 32, 162, 172 |
| RISK-03 | P1 | invoke direct | `src/os/bridge/StateBridge.ts` | 84, 116, 225 |

---

## Dettes Structurelles

| Dette | Description | Impact |
|-------|-------------|--------|
| Ring 2 → I/O Rust | `unified_memory` engines font du HTTP directement | Architecture compromise |
| IPC canonical drift | Bridges OS contournent tauriClient | Contrat IPC non garanti |
| Env BLOCKED | pnpm + GTK absents localement | Impossible de valider builds/tests |
| 1283 Tauri commands | Volume très élevé, risque d'inconsistance | Surface d'attaque large |
| 44 workflows CI | 13-14 décoratifs | Maintenance overhead |
| reqwest 0.11 | Version ancienne | CVE potentiels |

---

## Écart "Déclaré vs Prouvé"

| Déclaration | Statut Prouvé |
|-------------|---------------|
| "Online-first gouverné — UI zéro fetch direct" | ✅ PROUVÉ (httpClient.ts bloque) mais ⚠️ RISK (selfHealingObserver monkey-patch) |
| "One Door Network" | ❌ FAIL — Ring 2 engines contournent le gateway |
| "IPC canonique unifié" | ⚠️ PARTIELLEMENT PROUVÉ — tauriClient exist mais bridges le contournent |
| "Architecture 4-Ring strict" | ❌ FAIL — Ring 2 I/O prouvé dans Rust |
| "Tauri-only" | ✅ PROUVÉ — aucun serveur web autonome |
| "Tests x3 PASS" | ❌ NON PROUVABLE — BLOCKED (env) |
| "Build reproductible" | ❌ NON PROUVABLE — BLOCKED (env) |
