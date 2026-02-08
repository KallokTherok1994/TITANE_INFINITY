# Registre erreurs / warnings / blocages potentiels (priorisé)

## P0 — Bloquants (crash / écran inutilisable)
1. **TypeError / undefined is not an object** (STATS/Health)
   - Symptom : erreur rouge `undefined is not an object (evaluating 'f.quantum_coherence')`
   - Impact : page santé invalide + risque de casser le render global si non isolé.
   - Fix : null-safe + ErrorBoundary local + déplacer calcul backend.

2. **ErrorBoundary déclenché** (capture “Une erreur inattendue s’est produite… composant isolé…”)
   - Symptom : écran d’erreur avec stack react.
   - Impact : fonctionnalité indisponible.
   - Fix : identifier composant fautif via stack + tests.

## P1 — Dégradations majeures
3. **Ollama load failed**
   - Symptom : “Erreur lors du chargement d’Ollama …”
   - Impact : provider indisponible, risque de chat silencieux.
   - Fix : fallback provider + UI status.

4. **UNKNOWN / NaN partout (Memory/Health)**
   - Cause probable : endpoint/IPC non appelé ou retour vide.
   - Fix : contrat Result<T> + placeholders explicites + retry.

## P2 — Dégradations performance / fonctionnalités
5. **WebGL fallback / JS fallback** (Ultimate Optimization)
   - Impact : perf calcul dégradée.
   - Fix : détecter capabilities, expliquer, options.

6. **Service Worker: Not registered**
   - Impact : offline/cache absents, perfs.
   - Fix : (si web) enregistrer SW ; en Tauri, remplacer par cache local.

7. **Disk usage warning ~67.8%**
   - Impact : futur blocage (logs, cache, DB).
   - Fix : GC/cleanup, quotas, alert threshold.

## P3 — Risques UX / cohérence
8. **Layout “Cognitive Layout” flottant** : risque overlay sur contenu.
   - Fix : docking / snap / hide.

9. **Multiplicité de dashboards** (DEV) : risque surcharge cognitive.
   - Fix : modes (simple/advanced), progressive disclosure.

---

## Backlog de vérifications (non prouvées par captures)
- Auth/session : statut utilisateur, permissions ADMIN/DEV.
- GOV page : clés providers, erreurs save.
- IPC allowlist : commandes manquantes.
- E2E desktop : tauri-driver / WebKitWebDriver.

