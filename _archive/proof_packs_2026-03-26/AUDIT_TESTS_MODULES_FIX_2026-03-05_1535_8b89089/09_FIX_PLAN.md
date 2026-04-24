# 09_FIX_PLAN — Plan de Correction Minimal

**Proof Pack:** AUDIT_TESTS_MODULES_FIX_2026-03-05_1535_8b89089  
**Timestamp:** 2026-03-05T15:35:28Z  
**Mode: PLAN ONLY — Implémentation nécessite env opérationnel (pnpm + GTK)**

---

## FIX-001 — Extraire HTTP Ring 2 Rust → Ring 3 [P0]

**Ring:** R2 → R3 (Rust)
**Module(s):** `src-tauri/src/engines/unified_memory/summarizer.rs`, `embeddings.rs`
**Problème:**

```
summarizer.rs:298  → use http_client;
summarizer.rs:315  → let client = HttpClient::new();
embeddings.rs:213  → use http_client;
embeddings.rs:216  → let client = HttpClient::new();
```

**Cause probable:** Ring 2 engine créé avant la règle "zéro I/O Ring 2" ne vérifie pas les HTTP calls.
**Correction minimale:**

1. Créer `src-tauri/src/services/embedding_http_service.rs` (Ring 3) avec les appels HTTP
2. Injecter ce service en paramètre dans les fonctions qui en ont besoin (dependency injection)
3. Retirer `use http_client` des fichiers Ring 2

**Preuve DONE:**

```bash
grep -n "use http_client\|HttpClient::new()" \
  src-tauri/src/engines/unified_memory/summarizer.rs \
  src-tauri/src/engines/unified_memory/embeddings.rs
# → 0 occurrences
cargo check  # PASS
```

**Rollback:** `git restore -- src-tauri/src/engines/unified_memory/summarizer.rs src-tauri/src/engines/unified_memory/embeddings.rs`
**Risk:** ÉLEVÉ — casse pipeline mémoire unifiée si mal fait. Tester unitairement.

---

## FIX-002 — Ajouter test Ring 2 no-I/O Rust [P0 support]

**Ring:** R2 (Rust)
**Module(s):** `src-tauri/tests/unified_memory_tests.rs`
**Problème:** Aucun test automatique ne détecte l'I/O dans Ring 2 Rust. La violation FIX-001 n'est pas couverte.
**Cause probable:** Tests unitaires valident la logique mais pas la gouvernance réseau.
**Correction minimale:**

1. Ajouter dans `src-tauri/tests/unified_memory_tests.rs` un test qui vérifie que `summarizer` et `embeddings` n'ont PAS de dépendance directe à `http_client` (scan statique ou test de compilation sans feature réseau).
2. Alternative: ajouter `#[cfg(not(feature = "network"))]` guards sur les fonctions impactées.

**Preuve DONE:**

```bash
cargo test --test unified_memory_tests ring2_no_http_dependency
# → PASS
```

**Rollback:** `git restore -- src-tauri/tests/unified_memory_tests.rs`
**Risk:** FAIBLE — ajout test uniquement.

---

## FIX-003 — Supprimer/remplacer window.fetch monkey-patch [P1]

**Ring:** R3 Services TS
**Module(s):** `src/services/selfHealing/selfHealingObserver.ts:431`
**Problème:**

```
src/services/selfHealing/selfHealingObserver.ts:431
→ window.fetch = async (...args: Parameters<typeof fetch>) => {
```

**Cause probable:** Ajouté pour monitorer les erreurs réseau côté UI, mais redondant avec la gouvernance `httpClient.ts`.
**Correction minimale:**

1. Vérifier si ce monkey-patch est réellement utilisé en production (pas juste dans les tests)
2. Si redondant: retirer les lignes 429-480 de `selfHealingObserver.ts`
3. Si nécessaire: remplacer par `listen('network_error', handler)` Tauri event

**Preuve DONE:**

```bash
grep -n "window.fetch\s*=" src/services/selfHealing/selfHealingObserver.ts
# → 0 occurrences
pnpm test src/services/selfHealing/__tests__/selfHealing.test.ts
# → PASS
```

**Rollback:** `git restore -- src/services/selfHealing/selfHealingObserver.ts`
**Risk:** MOYEN — peut réduire monitoring réseau. Vérifier tests.

---

## FIX-004 — Documenter TauriBridge/StateBridge comme exceptions IPC [P1]

**Ring:** R3/R4 Bridges
**Module(s):** `src/os/bridge/TauriBridge.ts`, `src/os/bridge/StateBridge.ts`
**Problème:** Appellent `invoke()` directement, hors canonical `tauriClient.ts`.
**Cause probable:** Bridges low-level créés avant la canonical IPC policy.
**Correction minimale (Option B — moins risquée):**

1. Ajouter dans `scripts/verify/enforce-ipc-canonical.sh` une section qui exemptant explicitement `TauriBridge.ts` et `StateBridge.ts` avec justification
2. Documenter dans `docs/MAP_IPC_COMMANDS.md` que ces bridges sont des exceptions approuvées

**Preuve DONE:**

```bash
grep -n "TauriBridge\|StateBridge" scripts/verify/enforce-ipc-canonical.sh
# → Exception documentée
```

**Rollback:** `git restore -- scripts/verify/enforce-ipc-canonical.sh docs/MAP_IPC_COMMANDS.md`
**Risk:** FAIBLE — documentation + guard update uniquement.

---

## FIX-005 — Créer test architecture Ring 2 Rust [lane-proof]

**Ring:** R2 (Rust, nouvelle gate)
**Module(s):** Nouveau fichier `src-tauri/tests/ring2_architecture_test.rs`
**Problème:** L'architecture test Ring 2 existe pour TS (`engine-isolation.test.ts`) mais **pas pour Rust**.
**Correction minimale:**

1. Créer `src-tauri/tests/ring2_architecture_test.rs` qui scanne statiquement les imports des fichiers Rust dans `src-tauri/src/engines/` et vérifie l'absence de `http_client`, `reqwest`, `hyper`, `surf`
2. Enregistrer ce test dans `src-tauri/Cargo.toml` (integration tests)

**Preuve DONE:**

```bash
cargo test --test ring2_architecture_test
# → PASS
```

**Rollback:** `git restore -- src-tauri/tests/ring2_architecture_test.rs src-tauri/Cargo.toml`
**Risk:** FAIBLE — nouveau test uniquement.

---

## FIX-006 — Débloquer l'environnement dev [P1 infra]

**Ring:** CI/Infra
**Module(s):** README.md, `scripts/setup/`
**Problème:** pnpm + GTK absents → 0 test/lint/build exécutable localement.
**Correction minimale:**

1. Créer `scripts/setup/setup-dev.sh` avec toutes les commandes d'installation
2. Ajouter section "Dev Setup" dans README.md

**Preuve DONE:**

```bash
bash scripts/setup/setup-dev.sh && pnpm test  # PASS
```

**Rollback:** `git restore -- scripts/setup/setup-dev.sh README.md`
**Risk:** FAIBLE.

---

## Ordre de Priorité

```
FIX-006 (env) → FIX-001 (P0 Ring 2 I/O) → FIX-002 (test gate R2) →
FIX-003 (P1 fetch) → FIX-004 (P1 doc bridges) → FIX-005 (architecture test Rust)
```

**Lane:**

- FIX-004, FIX-006: `lane-ui/` (docs + scripts)
- FIX-001, FIX-002, FIX-003, FIX-005: `lane-proof/`
