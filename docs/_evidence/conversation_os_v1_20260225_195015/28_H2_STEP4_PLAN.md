# 28_H2_STEP4_PLAN.md

## Objet
Plan d’exécution **step-4** pour fermer le blocant `H2` (usages HTTP backend hors gateway unique).

## Constat actuel
- Détecteur H2 code-only: `51` occurrences.
- Hotspots dominants:
  - `src-tauri/src/overdrive/chat_orchestrator.rs`
  - `src-tauri/src/ai/ollama.rs`
  - `src-tauri/src/commands/diagnostic_commands.rs`
  - `src-tauri/src/services/fetch_service.rs` (service gouverné mais dupliqué vis-à-vis `network_gateway.rs`)

## Objectif gouverné
- Toute requête HTTP passe via une surface gouvernée unique.
- Aucun `reqwest` direct dans les modules métiers/commands hors gateway/service autorité.

## Stratégie en lots (ordre immuable)

### Lot A — Baseline + mapping d’appels
- Commandes:
  - `rg -n "(^\s*use\s+reqwest::|reqwest::Client::|reqwest::get\(|ureq::|hyper::client|hyper::Client)" src-tauri/src`
  - `rg -n "\.get\(|\.post\(|\.send\(" src-tauri/src/overdrive src-tauri/src/ai src-tauri/src/commands`
- Preuve attendue:
  - inventaire précis des points d’accès HTTP (fichier + fonction + finalité)
- Stop condition:
  - si un point n’a pas de trajectoire de migration claire -> BLOCKED

### Lot B — Refactor hotspots critiques
- Cible 1: `src-tauri/src/ai/ollama.rs`
- Cible 2: `src-tauri/src/overdrive/chat_orchestrator.rs`
- Action:
  - remplacer appels `reqwest` directs par appels vers `NetworkGatewayService` (ou façade unifiée dédiée)
  - conserver timeout/budget/allowlist et classification d’erreur
- Tests minimum:
  - tests existants ollama/chat critiques
  - compile check ciblé module
- Stop condition:
  - requête possible sans preflight allowlist

### Lot C — Consolidation services réseau
- Cible: convergence `fetch_service.rs` ↔ `network_gateway.rs`
- Action:
  - éviter duplication de logique policy/budget
  - définir l’autorité unique (garder un service, l’autre devient façade)
- Preuve attendue:
  - matrice responsabilités mise à jour

### Lot D — Commands/diagnostics résiduels
- Cible: `src-tauri/src/commands/*` avec `reqwest::Client`
- Action:
  - migration vers service gouverné unique
- Stop condition:
  - tout nouveau usage direct reqwest en commands

### Lot E — Vérification x3 + scellement
- Commande x3:
  - détecteur H2 code-only
- Critère PASS:
  - `H2 == 0/0/0` (ou `H2` limité strictement au seul fichier autorité documenté)
- Artifacts:
  - log x3 post-step4
  - addendum gates/risks/files_touched

## Critères de Done step-4
- `H2` fermé selon critère PASS.
- Aucune régression de compile/tests ciblés.
- Preuves append-only complètes dans `reports/` et pack.

## Métadonnées
- Ring impacté: **Ring 3 (Services) + Ring 4 (Orchestration)**
- Statut changement: **EXPERIMENTAL** (devient QUALIFIED après preuves x3)
