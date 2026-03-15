# CONTRADICTION_MATRIX.md — Matrice des Contradictions

**Version:** 28.0.0 | **SHA:** c59e9b5b3 | **Date:** 2026-03-15T13:32:00Z
**Classification:** CANON — Append-only

---

## Contradictions Actives

### C001 — tauri.conf.json dirty : beforeBuildCommand override

| Attribut | Valeur |
|----------|--------|
| ID | C001 |
| Sévérité | **P1** (bloque build production) |
| Statut | OPEN |
| Fichier | `src-tauri/tauri.conf.json` |
| Symptôme | `beforeBuildCommand="true"` — override local intentionnel ou erreur |
| Impact | Build production impossible tant que non résolu |
| Contradiction | Documenter v28.0.0 comme "production-ready" ↔ build désactivé localement |
| Action | `git restore -- src-tauri/tauri.conf.json` OU confirmer que c'est un override local intentionnel |
| Next | Confirmer avec `git diff src-tauri/tauri.conf.json` et décision explicite |

---

### C002 — gradle.properties dirty (Android)

| Attribut | Valeur |
|----------|--------|
| ID | C002 |
| Sévérité | **P2** |
| Statut | OPEN |
| Fichier | `src-tauri/gen/android/gradle.properties` |
| Symptôme | Fichier dirty — cause non déterminée dans cette session |
| Impact | Build Android potentiellement affecté |
| Contradiction | Bootstrap Android (commit c1b5c5d23) présenté comme stable ↔ gradle.properties dirty |
| Action | `git --no-pager diff src-tauri/gen/android/gradle.properties` → inspecter + restaurer si non intentionnel |

---

### C003 — handlers.rs : macro generate_titane_handlers! (dead code — v16 legacy)

| Attribut | Valeur |
|----------|--------|
| ID | C003 |
| Sévérité | **INFO/P3** (dead code — DOWNGRADED from P1 after validation) |
| Statut | OPEN — monitoring only |
| Fichier | `src-tauri/src/handlers.rs` |
| Symptôme | handlers.rs contient un macro `generate_titane_handlers!` avec 2 blocs internes (51 + 42 cmds, v16 legacy) |
| Résultat validation | Macro **NOT invoked** from main.rs (aucun `generate_titane_handlers!()`, aucun `mod handlers`, aucun `use handlers` dans main.rs). Confirmé par grep. |
| Impact réel | AUCUN shadowing — dead code seulement |
| Contradiction | Initialement classé P1 "risque shadowing" — DOWNGRADED à INFO |
| Action | Optionnel : supprimer handlers.rs pour nettoyage. Pas bloquant. |

---

### C004 — web_research stub dans liste production

| Attribut | Valeur |
|----------|--------|
| ID | C004 |
| Sévérité | **P2** (capacité trompeuse) |
| Statut | OPEN |
| Fichier | `src-tauri/src/commands/web_research.rs` (inféré) |
| Symptôme | `web_research` registered comme commande production mais commenté "EXPERIMENTAL — stub, no network" |
| Impact | Frontend peut croire avoir une capacité réseau réelle — violation I12 (doc truth over code truth) |
| Contradiction | Commande présente dans liste production ↔ implémentation stub sans réseau réel |
| Action | Marquer explicitement dans capability_registry comme STUB, et/ou ajouter commentaire dans main.rs |

---

## Contradictions Résolues

*(Aucune dans cette session — audit initial)*

---

## Tableau de Synthèse

| ID | Sévérité | Fichier | Statut | Action immédiate |
|----|----------|---------|--------|-----------------|
| C001 | P1 | src-tauri/tauri.conf.json | OPEN | git restore |
| C002 | P2 | src-tauri/gen/android/gradle.properties | OPEN | git diff + inspect |
| C003 | INFO/P3 | src-tauri/src/handlers.rs | OPEN (monitoring) | Aucune action urgente — dead code |
| C004 | P2 | web_research_commands | OPEN | doc update |

---

*Autorité : Kevin Thibault — TITANE Team | 2026-03-15T13:32:00Z*
