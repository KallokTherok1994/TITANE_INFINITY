# 18_FIX_PLAN_DETAILED — Plan Détaillé Corrections
**Proof Pack:** FINAL_AUDIT_VERDICT_2026-03-05_1601_9aa61d5  
**Timestamp:** 2026-03-05T16:01:41Z

---

## P0 — Sécurité/Surfaces (réseau/allowlist/IPC)

### FIX-001 — Ring 2 Rust I/O extraction [P0 | lane-proof]

**Ring:** R2 → R3 (Rust)  
**Module(s):** `src-tauri/src/engines/unified_memory/summarizer.rs`, `embeddings.rs`

**Problème + preuve:**
```rust
// summarizer.rs:298,315
use http_client;
let client = HttpClient::new();

// embeddings.rs:213,216  
use http_client;
let client = HttpClient::new();
```
Ring 2 initie des appels HTTP directement, bypass gateway `overdrive/`.

**Correction minimale:**
1. Créer `src-tauri/src/services/unified_memory_http.rs` (Ring 3) encapsulant les calls HTTP avec timeout borné
2. Modifier `summarizer.rs` et `embeddings.rs` pour accepter le service en paramètre (dependency injection)
3. Retirer `use http_client` des deux fichiers Ring 2

**Tests/Gates requis x3:**
```bash
grep -n "use http_client|HttpClient::new()" \
  src-tauri/src/engines/unified_memory/summarizer.rs \
  src-tauri/src/engines/unified_memory/embeddings.rs
# → 0 occurrences

cargo check  # PASS
cargo test --test unified_memory_tests  # PASS
```

**Preuve de DONE:**
- `grep` = 0 occurrences
- `cargo check` PASS
- `unified_memory_tests` PASS

**Rollback:**
```bash
git restore -- src-tauri/src/engines/unified_memory/summarizer.rs
git restore -- src-tauri/src/engines/unified_memory/embeddings.rs
git rm src-tauri/src/services/unified_memory_http.rs 2>/dev/null || true
```

**Statut: PROPOSED**
**Risque: ÉLEVÉ** — pipeline mémoire critique. Tester complètement avant merge.

---

### FIX-002 — Test gate Ring 2 Rust no-I/O [P0 support | lane-proof]

**Ring:** R2 (test CI)  
**Module(s):** `src-tauri/tests/unified_memory_tests.rs` (new test)

**Problème:** Aucun test automatique ne détecte les imports HTTP dans Ring 2 Rust.

**Correction minimale:**
1. Créer `src-tauri/tests/ring2_architecture_test.rs` qui scanne statiquement les engines Rust
2. Le test vérifie l'absence de `use http_client`, `use reqwest`, `use hyper`, `use surf`

**Tests/Gates requis x3:**
```bash
cargo test --test ring2_architecture_test
```

**Preuve de DONE:** `cargo test --test ring2_architecture_test` → PASS

**Rollback:**
```bash
git restore -- src-tauri/tests/ring2_architecture_test.rs
```

**Statut: PROPOSED**
**Risque: FAIBLE** — test uniquement.

---

### FIX-003 — Supprimer window.fetch monkey-patch [P1 | lane-proof]

**Ring:** R3 Services TS  
**Module(s):** `src/services/selfHealing/selfHealingObserver.ts`

**Problème + preuve:**
```typescript
// selfHealingObserver.ts:431
window.fetch = async (...args: Parameters<typeof fetch>) => {
  // Surface non gouvernée — intercepte TOUS les fetch
```

**Correction minimale:**
1. Vérifier si le monitoring réseau est nécessaire en prod (grep usage)
2. Si oui: remplacer par `listen('network_error', handler)` event Tauri
3. Si non: retirer les lignes 429-480

**Tests/Gates requis x3:**
```bash
grep -n "window.fetch\s*=" src/services/selfHealing/selfHealingObserver.ts
# → 0 occurrences

pnpm test src/services/selfHealing/__tests__/selfHealing.test.ts
```

**Preuve de DONE:**
- `grep` = 0 occurrences
- selfHealing tests PASS

**Rollback:**
```bash
git restore -- src/services/selfHealing/selfHealingObserver.ts
```

**Statut: PROPOSED**
**Risque: MOYEN** — peut réduire monitoring réseau.

---

### FIX-004 — Formaliser exceptions TauriBridge/StateBridge [P1 | lane-ui]

**Ring:** R3/R4 Bridges  
**Module(s):** `src/os/bridge/TauriBridge.ts`, `StateBridge.ts`, `docs/MAP_IPC_COMMANDS.md`

**Problème:**
```typescript
// TauriBridge.ts:32,162,172 — invoke() direct
// StateBridge.ts:84,116,225 — this.bridge.invoke() direct
```
IPC direct hors canonical `tauriClient.ts`, non documenté comme exception.

**Correction minimale:**
1. Ajouter section "Exceptions IPC approuvées" dans `docs/MAP_IPC_COMMANDS.md`
2. Si `scripts/verify/enforce-ipc-canonical.sh` existe: ajouter exemptions documentées
3. Ajouter JSDoc sur chaque bridge expliquant l'exception

**Tests/Gates requis x3:**
```bash
grep -n "TauriBridge\|StateBridge" docs/MAP_IPC_COMMANDS.md
# → exceptions documentées
```

**Preuve de DONE:** Exceptions documentées dans MAP_IPC_COMMANDS.md.

**Rollback:**
```bash
git restore -- docs/MAP_IPC_COMMANDS.md
```

**Statut: PROPOSED**
**Risque: FAIBLE** — documentation uniquement.

---

## P1 — Stabilité/Build/Repro

### FIX-005 — Test architecture Ring 2 Rust [P1 | lane-proof]

**Ring:** R2 CI  
**Module(s):** nouveau `src-tauri/tests/ring2_architecture_test.rs`

**Problème:** Test `engine-isolation.test.ts` (TS) n'a pas d'équivalent Rust.

**Correction minimale:**
1. Créer `ring2_architecture_test.rs` (scanner statique imports HTTP)
2. Intégrer dans `Cargo.toml` comme test d'intégration

**Preuve de DONE:** `cargo test --test ring2_architecture_test` PASS.

**Rollback:** `git restore -- src-tauri/tests/ring2_architecture_test.rs`

**Statut: PROPOSED**  
**Risque: FAIBLE**

---

### FIX-006 — Setup env dev [P1 | lane-ui]

**Ring:** CI/Infra  
**Module(s):** `scripts/setup/setup-dev.sh`, `README.md`

**Problème:** `pnpm` + `libgtk-3-dev` absents — 0 test/lint/build exécutable en CI Copilot.

**Correction minimale:**
1. Créer `scripts/setup/setup-dev.sh` avec toutes les commandes
2. Documenter dans README.md section "Dev Setup"

**Preuve de DONE:**
```bash
bash scripts/setup/setup-dev.sh
pnpm test  # PASS
```

**Rollback:** `rm scripts/setup/setup-dev.sh`

**Statut: PROPOSED**  
**Risque: FAIBLE**

---

## P2 — Qualité/Perfectionnement

### FIX-007 — Harmoniser CommandResult → {ok,content,error} [P2 | lane-proof]

**Ring:** R3/R4 Rust commands  
**Module(s):** `src-tauri/src/commands/ia_context_commands.rs` + clients TS

**Problème:** `CommandResult {success,data,error}` diverge légèrement du contrat documenté `{ok,content,error}`.

**Correction minimale:**
1. Ajouter aliases dans CommandResult: `pub fn ok(...)` ✅ (déjà présent)
2. Mettre à jour la documentation pour accepter officiellement `{success,data,error}` comme forme Rust valide

**Preuve de DONE:** Documentation mise à jour dans `docs/MAP_IPC_COMMANDS.md`.

**Rollback:** `git restore -- docs/MAP_IPC_COMMANDS.md`

**Statut: PROPOSED**  
**Risque: TRÈS FAIBLE**

---

## Ordre d'Exécution

```
FIX-006 → FIX-001 → FIX-002 → FIX-003 → FIX-004 → FIX-005 → FIX-007
  infra     P0        test      P1 risk    P1 doc    test arch   P2 doc
```
