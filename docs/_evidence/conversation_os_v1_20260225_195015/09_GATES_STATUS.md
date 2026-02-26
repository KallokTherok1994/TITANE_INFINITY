# 09_GATES_STATUS.md

## Hard Blockers

### HB-01 Front-end no web
- Règle: aucun appel réseau direct non gouverné sur chemins de prod.
- Méthode de détection: scan primitives HTTP + URLs externes.
- Commandes:
  - `rg -n "fetch\(|axios\(" src`
  - `rg -n "https?://" src`
- Résultat attendu: aucun appel externe en chemin de prod.

### HB-02 Network gateway unique
- Règle: un seul service backend contient le client HTTP.
- Méthode de détection: scan crates HTTP backend.
- Commande:
  - `rg -n "reqwest|ureq|hyper" src-tauri`
- Résultat attendu: matches uniquement dans `network_gateway` (ou équivalent gouverné).

### HB-03 No new dependency
- Règle: aucune dépendance ajoutée sans justification + rollback.
- Méthode de détection: diff des manifests/locks.
- Commande:
  - `git diff -- package.json pnpm-lock.yaml Cargo.toml Cargo.lock`
- Résultat attendu: diff vide ou justification explicite documentée.

### HB-04 No direct invoke dispersion
- Règle: pas d’invoke brut dispersé hors client canonique.
- Méthode de détection: scan `invoke(` côté frontend.
- Commande:
  - `rg -n "invoke\(" src`
- Résultat attendu: usages limités au client canonique TS↔Tauri.

## Gate System (FULL HARD MODE)

### Format imposé (run1/run2/run3)
- Définition
- Commande(s)
- Résultat run1 / run2 / run3
- Verdict

### G1 FRONTEND_NO_WEB
- Définition: UI sans appels web directs non gouvernés.
- Commandes:
  - `rg -n "fetch\(|axios\(|XMLHttpRequest|WebSocket" src`
- Résultats run1/run2/run3: `0 / 0 / 0` (preuve historique consolidée)
- Verdict: **PASS**

### G2 GATEWAY_ALLOWLIST_ONLY
- Définition: toute requête backend passe par allowlist.
- Commande:
  - `cargo test --manifest-path src-tauri/Cargo.toml engines::conversation_os::policy::tests::test_endpoint_allowlist -- --nocapture`
- Résultats run1/run2/run3: `0 / 0 / 0`
- Verdict: **PASS**

### G3 NO_SILENT_FALLBACK
- Définition: pas de fallback qui masque la cause racine.
- Commande:
  - `cargo test --manifest-path src-tauri/Cargo.toml no_silent_fallback_keeps_root_cause_offline -- --nocapture`
- Résultats run1/run2/run3: `0 / 0 / 0`
- Verdict: **PASS**

### G4 NETSTATE_TRANSITIONS_VALID
- Définition: transitions résilience stables.
- Commande:
  - `cargo test --manifest-path src-tauri/Cargo.toml engines::conversation_os::resilience::tests::test_circuit_breaker_recovery -- --nocapture`
- Résultats run1/run2/run3: `0 / 0 / 0`
- Verdict: **PASS**

### G5 RATE_LIMIT_AWARE
- Définition: gestion rate-limit bornée.
- Commande:
  - `cargo test --manifest-path src-tauri/Cargo.toml engines::conversation_os::resilience::tests::test_rate_limiter_consume -- --nocapture`
- Résultats run1/run2/run3: `0 / 0 / 0`
- Verdict: **PASS**

### G6 SOURCES_STORED_AND_CITABLE
- Définition: persistance de sources traçables.
- Commande:
  - `cargo test --manifest-path src-tauri/Cargo.toml conversation_os_persistence_stores_events_and_sources -- --nocapture`
- Résultats run1/run2/run3: `0 / 0 / 0`
- Verdict: **PASS**

### G7 DB_APPEND_ONLY_HASH
- Définition: append-only + hash stable.
- Commandes:
  - `cargo test --manifest-path src-tauri/Cargo.toml test_append_only_no_update -- --nocapture`
  - `cargo test --manifest-path src-tauri/Cargo.toml test_sha256_computation -- --nocapture`
- Résultats run1/run2/run3: `0 / 0 / 0`
- Verdict: **PASS**

### G8 OFFLINE_STRICT
- Définition: mode offline strict sans dérive provider.
- Commande:
  - `cargo test --manifest-path src-tauri/Cargo.toml engines::conversation_os::policy::tests::test_offline_state_local_only -- --nocapture`
- Résultats run1/run2/run3: `0 / 0 / 0`
- Verdict: **PASS**

### G9 E2E_DESKTOP
- Définition: parcours critique desktop stable.
- Commande:
  - `pnpm exec playwright test e2e/critical --project=chromium`
- Résultats run1/run2/run3: `0 / 0 / 0`
- Verdict: **PASS**

### G10 REPRODUCIBLE_META
- Définition: métadonnées reproductibles sur mêmes entrées.
- Commande:
  - `cargo test --manifest-path src-tauri/Cargo.toml reproducible_meta_same_input_same_output -- --nocapture`
- Résultats run1/run2/run3: `0 / 0 / 0`
- Verdict: **PASS**

## Décision
- Tous les invariants listés ont une méthode de détection + commande.
- État actuel: **QUALIFIED**
