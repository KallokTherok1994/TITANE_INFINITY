# 00_PLAN.md

## Objectif
Mettre en place et prouver Conversation OS v1 en mode preuve stricte: discovery -> scope freeze -> validation implémentation -> campagnes x3 -> verdict.

## Séquence exécutée
1. Discovery complet (A/B/C) capturé dans `09_PROOF_LOGS.txt`.
2. Scope freeze défini (surface autorisée minimale + surfaces interdites).
3. Validation de l’implémentation existante (Types/Engines/Services/Orchestrator/UI debug).
4. Exécution d’une campagne homogène G1..G10 en x3 (`reports/conversation_os_unified_g1_g10_x3_campaign_v2.log`).
5. Consolidation des preuves et verdict.

## Stop-the-line appliqué
- Si violation d’invariant absolu détectée en discovery, verdict non-PASS.
- Aucun déploiement PROD sans tokens exacts.

## Résultat attendu de ce pack
- État réel documenté (pas de supposition).
- Gates reportés avec preuves.
- Rollback explicite.

## META-EXECUTION LAYER — Développement (Addendum 2026-02-26)

### 1) Hypothèses détectées (à ne pas présumer)
- Hypothèse H1: toutes les surfaces réseau frontend hors flux canonique sont inactives en prod.
	- Preuve requise: `rg -n "fetch\(|axios\(|XMLHttpRequest|WebSocket" src`
	- Fichier preuve: `reports/conversation_os_meta_h1_frontend_network_scan.log`
- Hypothèse H2: un seul gateway backend porte le HTTP client.
	- Preuve requise: `rg -n "reqwest|ureq|hyper" src-tauri`
	- Fichier preuve: `reports/conversation_os_meta_h2_backend_http_scan.log`
- Hypothèse H3: aucun point d’entrée chat legacy n’est appelé par l’UI canonique.
	- Preuve requise: `rg -n "chat_send_message|conversation_generate|orchestrator|invoke\(" src src-tauri`
	- Fichier preuve: `reports/conversation_os_meta_h3_chat_entrypoints.log`
- Hypothèse H4: aucune dépendance n’a dérivé depuis le scellement.
	- Preuve requise: `git diff -- package.json pnpm-lock.yaml Cargo.toml Cargo.lock`
	- Fichier preuve: `reports/conversation_os_meta_h4_dependency_diff.log`

### 2) Zones UNKNOWN explicites
- UNKNOWN-U1: exhaustivité des répertoires legacy non branchés runtime.
- UNKNOWN-U2: cartographie complète des surfaces réseau indirectes via wrappers utilitaires.
- UNKNOWN-U3: couverture complète des entrypoints chat secondaires côté UI.
- UNKNOWN-U4: stabilité déterministe du hash RouterDecision (preuve dédiée absente à cet instant).

### 3) Plan de découverte suffisant
- C1: `rg -n "fetch\(|axios\(|XMLHttpRequest|WebSocket" src`
	- Doit prouver: inventaire frontend no-web en chemin de prod.
	- Arrêt: `COUNT=0` sur périmètre prod, sinon classification + blocage documenté.
- C2: `rg -n "https?://" src`
	- Doit prouver: absence d’URL externes hardcodées en prod.
	- Arrêt: 0 match prod, sinon justification + rollback plan.
- C3: `rg -n "reqwest|ureq|hyper" src-tauri`
	- Doit prouver: unicité du gateway HTTP.
	- Arrêt: matches limités au service gateway autorisé.
- C4: `git diff -- package.json pnpm-lock.yaml Cargo.toml Cargo.lock`
	- Doit prouver: no new dependency non justifiée.
	- Arrêt: diff vide ou justification + rollback.
- C5: `rg -n "chat_send_message|conversation_generate|orchestrator" src src-tauri`
	- Doit prouver: entrypoint chat canonique unique.
	- Arrêt: aucun appel legacy actif sans garde.

### Stop-the-line appliqué
- Interdiction de commencer des modifications runtime tant que `00_PLAN.md` et `01_TRUTH_SNAPSHOT.md` ne sont pas enrichis avec hypothèses + UNKNOWN + plan de découverte.
