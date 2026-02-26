# 10_TEST_RUNS_X3.md

## Determinism Enforcement — RouterDecision x3

### Objectif
À entrée identique (message, memory snapshot hash, flags, netstate), `RouterDecision` doit être identique.

### Protocole x3
- Entrée figée: même payload message.
- Memory snapshot: hash identique pré-calculé.
- Flags: identiques.
- Netstate: identique.

### Méthode de preuve (commande)
- `cargo test --manifest-path src-tauri/Cargo.toml reproducible_meta_same_input_same_output -- --nocapture`
- Extraction hash JSON de `RouterDecision` depuis logs, puis SHA256:
  - `jq -c '.router_decision' <trace.json | sha256sum`

### Journal attendu
- run1: `router_decision_sha256=<hash>`
- run2: `router_decision_sha256=<hash>`
- run3: `router_decision_sha256=<hash>`

### Critère PASS
- `hash_run1 == hash_run2 == hash_run3`

### Stop-the-line
- Variation de hash entre runs => **FAIL**.

### Statut actuel
- Preuve de reproductibilité méta: PASS (G10 historique)
- Preuve explicite hash `RouterDecision` x3: **BLOCKED (à instrumenter dans logs de trace)**
- Ring impacté: **Ring 2 (Engines)**
- Statut changement: **EXPERIMENTAL**
