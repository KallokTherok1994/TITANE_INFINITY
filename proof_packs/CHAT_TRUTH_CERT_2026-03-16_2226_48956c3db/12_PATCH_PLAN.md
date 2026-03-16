# 12 — PATCH PLAN

## Patches identifiés par ordre de priorité

### P1 — CRITIQUE : Rust test compilation failure (p3_provider_meta_gates.rs)

**Symptôme** : `cargo test --no-run` échoue avec `missing field 'history' in initializer of ConversationRequest` (4 occurrences dans tests/p3_provider_meta_gates.rs)

**Cause** : PATCH-012 (IMPROVE-002) a ajouté `pub history: Option<Vec<String>>` à `ConversationRequest` dans types.rs, mais le test p3_provider_meta_gates.rs n'a pas été mis à jour.

**Fix minimal** : Ajouter `history: None,` dans les 4 initialisations ConversationRequest du fichier de test.

**Rollback** : `git restore -- src-tauri/tests/p3_provider_meta_gates.rs`

**Testable maintenant** : OUI — `cargo test --no-run` doit compiler sans erreur.

**Statut** : À APPLIQUER

---

### P2 — MOYEN : Feature build default risk

**Symptôme** : Build par défaut embarque `mock_commands::generate_response` (feature="mock").

**Recommandation** : Vérifier/documenter dans release CI que `--features full` est utilisé pour prod. Aucun patch code requis si CI est correct.

**Statut** : DOCUMENTATION ONLY — vérification CI externe à ce scope.

---

### P3 — FAIBLE : send_message stub non documenté dans capability

**Symptôme** : `send_message` est un stub qui retourne Err. Non exposé en capability, non accessible normalement.

**Recommandation** : Aucun patch code requis. Déjà documenté (main.rs commentaire).

**Statut** : ALREADY HANDLED

---

### P4 — OBSERVATION : LTM sans TTL/purge

**Symptôme** : SQLite croissance illimitée. Aucune politique de purge détectée.

**Recommandation** : Hors périmètre certification immédiate. À planifier en V29.

**Statut** : NOTED — hors scope

---

## Patch P1 — Détail

**Fichier** : `src-tauri/tests/p3_provider_meta_gates.rs`

**Lignes concernées** : 4 structs `ConversationRequest { ... }` sans le champ `history`

**Modification** : Ajouter `history: None,` à chacune.

**Taille du patch** : 4 lignes ajoutées.

**Risque** : Nul — `history: Option<Vec<String>>` accepte None.
