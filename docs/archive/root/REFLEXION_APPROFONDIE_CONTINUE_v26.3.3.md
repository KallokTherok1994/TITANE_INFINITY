# 🧠 RÉFLEXION APPROFONDIE & CONTINUE v26.3.3 — STABILITÉ PROD (SILENT-BY-DEFAULT)

**Date:** 18 décembre 2025  
**Cadre:** Pré-déploiement business • Tauri/desktop local-first • Zéro “bruit” non sollicité en production  
**Axe de cette réflexion:** WebSockets / polling / timers de fond • stabilité • auditabilité • hygiène de release

---

## 🎯 Intention (ce que “continue” veut dire ici)

- **Approfondie**: remonter aux causes racines (boucles, timers, reconnect storms, polling implicite), puis formaliser des garde-fous simples.
- **Continue**: chaque amélioration doit être **vérifiable** (tests/build/scan), **documentée** (audit), et **réversible** (opt-in explicite) sans dégrader l’ergonomie dev.

---

## ✅ Décision centrale (non négociable): Silent-by-default en production

Objectif: en production/Tauri, le runtime ne doit pas exécuter de:

- polling interval (HTTP/localhost probes)
- boucles de santé/metrics récurrentes
- timers de reconnexion agressifs

…sauf si l’utilisateur ou l’opérateur **l’active explicitement** (env/localStorage).

Conséquence architecturale: **les “watchers” deviennent des outils de dev** ou des fonctionnalités activables, pas des comportements implicites.

---

## 🧩 WebSockets & Polling — état concret et posture de risque

### 1) Où sont les WebSockets

Les sites WebSocket identifiés sont concentrés dans la couche Visual Engine:

- [src/visual-engine/TitaneVisualEngine.ts](src/visual-engine/TitaneVisualEngine.ts)
- [src/visual-engine/TitaneVisualEngineV21.ts](src/visual-engine/TitaneVisualEngineV21.ts)
- [src/visual-engine/OSIntegrationBridge.ts](src/visual-engine/OSIntegrationBridge.ts)

Cela réduit fortement la surface de risque (pas de WS “cachés” dans des hooks métier).

### 2) Risque principal: fallback polling implicite

Le danger historique n’est pas le WebSocket en lui-même, mais:

- un **fallback automatique** vers du polling (interval) quand une URL n’est pas `ws://`
- un comportement implicite en production (donc silencieux et difficile à tracer)

Ce pattern est un “footgun” typique: il fonctionne “jusqu’au jour où” (CPU, logs, flakiness, dégradation UX, bruit réseau local).

### 3) Contre-mesure: polling prod explicitement bloqué

Dans le bridge OS:

- Dev: polling autorisé (ergonomie)
- Prod: polling **refusé** sans opt-in explicite

Opt-ins supportés:

- Env: `VITE_TITANE_OS_POLLING_ENABLED=1` (ou `VITE_OS_POLLING_ENABLED=1`)
- LocalStorage: `titane_os_polling_enabled=true` (ou `1`)

Documentation associée:

- [docs/VISUAL_ENGINE_README.md](docs/VISUAL_ENGINE_README.md)
- [docs/current/audits/AUDIT_WEBSOCKETS_POLLING_v26.2.md](docs/current/audits/AUDIT_WEBSOCKETS_POLLING_v26.2.md)

---

## 🔁 WebSocket robustness — ce qui compte vraiment

Le vrai sujet côté WebSocket n’est pas “connecter”, mais **ne pas se dupliquer**:

- Une seule socket active à la fois (éviter CONNECTING/OPEN multiples)
- Un seul timer de reconnexion (éviter l’empilement)
- Backoff borné (éviter storms)
- Nettoyage fiable au stop/disconnect

Pourquoi c’est critique: les pannes WS sont rarement “hard”; elles sont souvent intermittentes, et donc les bugs de reconnexion deviennent des multiplicateurs de chaos.

---

## 🧪 Fiabilité: rendre les validations déterministes

Un déploiement stable est d’abord un pipeline stable.

- Les tests e2e ne doivent pas dépendre de `Math.random()` pour simuler des erreurs concurrentes.
- Préférer des scénarios **déterministes**: N premiers appels échouent, puis succès.

Effet: moins de flakiness, meilleur signal, meilleure confiance.

---

## 🧱 “Compatibilité sans surprise” — VectorStoreClient

Une stratégie saine: quand une interface expose `deleteWhere(filters)`, l’implémentation doit:

- soit supporter un **sous-ensemble clair** (ex: `id`/`ids`)
- soit refuser de façon explicite et observable (warning + 0)

Le but n’est pas d’ajouter une fonctionnalité dangereuse (bulk delete), mais d’éviter:

- les stubs silencieux
- les comportements ambigus

---

## 🧭 Gouvernance release: ce qui peut bloquer un ship “propre”

### Point d’attention: diffs Rust non triviaux

Le repo montre des modifications côté Rust (ex: `exp_fusion.rs` et potentiellement `main.rs` selon l’état local).

Décision à prendre avant livraison:

- **Option A — garder**: si ces changements sont intentionnels pour la version à ship, alors il faut les traiter comme scope officiel (revue + build/package complet + notes).
- **Option B — revert**: si ces changements sont accidentels ou hors-scope du hardening prod, il faut revenir à une base minimale.

Raison: la stabilité prod dépend aussi du **contrôle de périmètre**.

---

## 📌 Synthèse: ce qui est “vraiment” gagné

- **Surface WS/polling bornée** (localisée, documentée)
- **Production silencieuse par défaut** (pas de polling implicite)
- **Opt-ins explicites** (env/localStorage)
- **Réduction de flakiness** (tests déterministes)
- **Auditabilité** (docs d’audit + README mis à jour)

---

## ✅ Prochaine itération (continue)

- Statuer sur le périmètre Rust (garder vs revert) et aligner la release.
- Valider un run complet “stable runtime” (packaging) si c’est le canal de livraison.
- Conserver une règle simple: tout mécanisme de fond en prod doit être:
  - explicitement activable,
  - limité (backoff / TTL),
  - observable (logs contrôlés),
  - et documenté.

---

## 🔀 Fusion (2025-12-19) — ce qui est fusionnable vs ce qui ne l’est pas

### Ce qui a été fusionné (clean + validé)

- Fusion de la branche documentation “phase0” (gros ré-ordonnancement docs + index master), puis ajout d’un checkpoint “IA governance instructions”.
- Critère: merge sans conflit applicatif, pas de changement runtime, et validation gate + test gate + security scan passent.

### Ce qui n’a pas été fusionné (et pourquoi)

- La branche `feature/TITANE_OS` a été tentée en merge mais a introduit des conflits sur des zones sensibles (Playwright config, mémoire OS Rust, embeddings, etc.) et un gros volume de nouveaux fichiers.
- Décision: **ne pas forcer** l’intégration dans MAIN dans ce contexte “stabilité prod / scope minimal”, car ça augmente le risque de régression et dilue l’objectif “silent-by-default”.

### Heuristique (reproductible)

- **Merge** si: changements majoritairement docs/outillage, conflits faibles, gates verts.
- **Isoler** (branche dédiée + revue) si: conflits sur Rust core / sécurité / memory, ou ajout massif de surface (E2E + CI + scripts) sans campagne de validation dédiée.
