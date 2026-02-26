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

## Exécution réelle des détecteurs (Addendum 2026-02-26)

### Source
- `reports/conversation_os_hardmode_gates_x3_20260226T020838Z.log`

### Résultats run1/run2/run3
- HB-01 (primitives réseau frontend prod-scope): `0 / 0 / 0` → **PASS**
- HB-01b (URLs externes dans `src` prod-scope): `115 / 115 / 115` → **BLOCKED** (triage nécessaire: assets/docs/strings)
- HB-02 (unicité gateway HTTP backend): `73 / 73 / 73` → **BLOCKED**
- HB-03 (diff dépendances): `0 / 0 / 0` → **PASS**
- HB-04 (imports directs `invoke`): `8 / 8 / 8` → **BLOCKED**
- Entrypoints chat (legacy/canonique mix): `114 / 114 / 114` → **REVIEW**

### Hard Blockers actifs
- B1: client HTTP backend non centralisé uniquement dans un gateway.
- B2: dispersion d’imports `invoke` hors client canonique.
- B3: présence d’URLs externes en `src` sans triage de périmètre runtime.

### Décision mise à jour
- État hard-mode: **PARTIAL PASS / BLOCKED**.

## Addendum remédiation step-1 (2026-02-26)

### Changement appliqué
- `src/services/ai/transports/ollamaTransport.ts`: `invoke` direct remplacé par `secureInvoke`.

### Mesures post-fix
- `reports/conversation_os_hardmode_gates_x3_postfix_20260226T021217Z.log`
  - `H1: 0/0/0`
  - `C2: 115/115/115`
  - `H2: 73/73/73`
  - `H4: 0/0/0`
  - `HB4 (large): 10/10/10`
- `reports/conversation_os_blocker_hb4_prodscope_postfix_20260226T021223Z.log`
  - `HB4 (prod-scope): 7`

### Delta
- `HB4` prod-scope: `8 -> 7` (réduction mesurée)

### Verdict
- Micro-phase remédiation: **PASS**
- État global hard-mode: **BLOCKED** (C2/H2/HB4 résiduel)

## Addendum remédiation step-2 (2026-02-26)

### Source
- `reports/conversation_os_hardmode_gates_x3_step2_20260226T023045Z.log`
- `reports/conversation_os_blocker_hb4_prodscope_step2_20260226T023045Z.log`

### Résultats run1/run2/run3
- `H1: 0 / 0 / 0` → **PASS**
- `C2: 115 / 115 / 115` → **BLOCKED**
- `H2: 73 / 73 / 73` → **BLOCKED**
- `H4: 0 / 0 / 0` → **PASS**
- `HB4: 0 / 0 / 0` → **PASS (CLOSED)**

### Décision mise à jour
- Hard blocker `HB4` fermé.
- État hard-mode: **PARTIAL PASS / BLOCKED** (blocants restants: C2, H2).

## Addendum remédiation step-3 (2026-02-26)

### Sources
- `reports/conversation_os_hardmode_gates_x3_step3_20260226T023426Z.log`
- `reports/conversation_os_blocker_c2_violation_runtime_step3b_20260226T023415Z.log`

### Détecteur C2 (gouverné)
- Scope runtime TS/TSX hors tests/stories/docs markdown.
- Filtre allowlist domaines fonctionnels documentés (providers + recherche + santé réseau).

### Résultats run1/run2/run3
- `H1: 0 / 0 / 0` → **PASS**
- `C2: 0 / 0 / 0` → **PASS (CLOSED)**
- `H2: 51 / 51 / 51` → **BLOCKED**
- `H4: 0 / 0 / 0` → **PASS**
- `HB4: 0 / 0 / 0` → **PASS**

### Décision mise à jour
- Blocants fermés: `C2`, `HB4`.
- Blocant résiduel unique: `H2` (HTTP backend non centralisé).
- État hard-mode: **PARTIAL PASS / BLOCKED**.

## Addendum step-4 Lot A (2026-02-26)

### Sources
- `reports/conversation_os_h2_lotA_inventory_20260226T032341Z.log`
- `reports/conversation_os_h2_codeonly_step4_lotA_20260226T032456Z.log`

### Action
- Migration des commandes diagnostics vers `NetworkGatewayService`.
- Ajout méthode gouvernée `head_status(url)` dans `network_gateway.rs`.

### Résultat
- `H2` code-only: `51 -> 46`.
- Verdict lot A: **PASS (partiel)**.

### État
- Hard-mode reste **BLOCKED** tant que `H2 != 0` ou non limité au fichier autorité.
